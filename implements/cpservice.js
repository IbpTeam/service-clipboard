var copypaste = require("node-copy-paste"),
    fs = require("fs"),
    os = require("os"),
    device = require("../../../app/demo-rio/nodewebkit/lib/api/device_service.js"),
    im = require("../../../framework/api/lib/im.js"),
    remoteProxy = require("../interface/clipboardProxyRemote");


var clipContent =undefined,
		clipstack = undefined;


//init the clipstack of a device based on device-discovery service
function maintainClipStack(){
	//init clipstack...
	if(clipstack === undefined){
		clipstack = [];
		device.showDeviceList(function(ddd){
			console.log("Init clipstack...");
			for (dev in ddd ) {
				clipstack.push(ddd[dev].address);
			}
		});
	}

	//update the clipstack when there is a device online or offline.
	device.addListener(function(_para){
		if(_para !== 'object') return console.log(_para);
		var _info = _para.info,
				_dev_ip = _info.address; 
		switch(_para.flag){
			case 'up':
				if(_dev_ip in clipstack) 
					break;
				else clipstack.unshift(_dev_ip);
				break;
			case 'down':
				var id = clipstack.indexOf(_dev_ip);
				if(id == -1)
					throw new Error("Warn: this device is not in the clipstack.");
				else
					clipstack.splice(id,1);
				break;
			default :
		  	break;
		}
	});
}

//this function's fearure is to get the current 
//content of local system's clipboard
function getClipboardData(){
	copypaste.paste(function(err,ret){
		if(err === null){
			clipContent = ret;
			console.log("content of clipboard: " + clipContent);
			return clipContent;
		}else{
			throw err;
		}
	});
}

/* para @string: data to be copied.
*  para @clipContent: current data of the clipboard
*  if the clipboard is updated,return a mesage to inform other devices;
*  otherwise return false.
*  
*/
function isClipboardUpdated(string,clipContent,callback){
	var _string = string;
	getClipboardData();
	var _clipContent = clipContent;
	if (_string === _clipContent){
		console.log("clipboard's content is not changed.");
		return false;
	}else{
		//broadcast clipboard updated mesage to device in the AdHoc.
		var msg = {};
		msg.ip = os.networkInterfaces().eth0[0].address;
		console.log("local ip is: " + msg.ip);
		msg.txt = "content of "+ msg.ip +"'s clipboard is updated!";

		//inform other device in the AdHoc that the content of system clipboard has been updated
		for (var i = 0; i < clipstack.length; i++) {
			var _ip = clipstack[i];
			if(_ip == msg.ip) break;
			else{
				var obj = remoteProxy.getRemoteObj('clipboard', _ip);
				obj.sendmsg(msg,function(res){
  				console.log(res);
  				if (res.err) {
    				console.log(res.err);
  				}
				});
			}
		};
		return msg;
	}
}


/* para @msg:Object,
*      {ip: string,
*       txt: string }
* para @clipstack:Array, 
*   [ ip:string,
*      ...
*   ]
* storing metadata of each system clipboard
* in the whole local network
*/
function updateClipStack(msg,clipstack,callback){
	var _ip = msg.ip;
	// data structure of the clip stack needed to be initial before doing the following action
	var _clipstack = clipstack;
	var _count = 0;

	//if msg.ip is already stored in the clipstack,do like this
	for(var i = 0;i < _clipstack.length; i++){
		
		if(_ip == _clipstack[i]){
			if(i == _clipstack.length-1) 
				break;
			else {
				_clipstack.splice(i,1);
				_clipstack.push(_ip);
				break;
			}
		}else _count++;
	}

	//if msg.ip is not stored in the clipstack,do like this
	if(_count == _clipstack.length)
		clipstack.push(_ip);
}


//function to get the top element of the clipstack

function getClipData(clipstack){
	var _clipstack = clipstack;
	return _clipstack.pop();
}


var stub = null;
exports.setStub = function(stub_) {
  if(typeof stub_ !== 'undefined')
    stub = stub_;
};

//interface for app to execute 'copy' 
//para @string: data to be copied
//para @callback: callback to handle some info
//
 exports.copy = function(string,callback){
	var arg = string;
	if(!!isClipboardUpdated(arg,clipContent,function(){}))
		copypaste.copy(arg);

};

//interface for app to execute 'paste'
 exports.paste = function(callback){
	//check wether the ip is local or remote,
	//then handle the paste request according
	//to the situation.
    var _ip = getClipData();
    var _localIp = os.networkInterfaces().eth0[0].address;
    if(_ip == _localIp){
    	var result = getClipboardData();
    	return result;
    }else{
    	//remotePaste procedue
    	var _remoteProxy = remoteProxy.getProxy(_ip);
    	var res = _remoteProxy.paste();
    	return res;
    }
	// return clipContent;	
};
