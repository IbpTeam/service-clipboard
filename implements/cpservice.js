var copypaste = require("copy-paste"),
  os = require("os"),
  // device = require("../../../app/demo-rio/nodewebkit/lib/api/device_service.js"),
  api = require('api'),
  im = api.im(),
  remoteProxy = require("../interface/clipboardProxyRemote");


// var clipContent =undefined,
var clipstack = undefined,
    localIp = os.networkInterfaces().eth1[0].address;


//init the clipstack of a device based on device-discovery service
function maintainClipStack() {
  //init clipstack...
  if (clipstack === undefined) {
    clipstack = [];
    clipstack.push(localIp);
    // device.showDeviceList(function(ddd){
    //  console.log("Init clipstack...");
    //  for (dev in ddd ) {
    //    clipstack.push(ddd[dev].address);
    //  }
    // });
  }

  //update the clipstack when there is a device online or offline.
  // device.addListener(function(_para){
  //  if(_para !== 'object') return console.log(_para);
  //  var _info = _para.info,
  //      _dev_ip = _info.address; 
  //  switch(_para.flag){
  //    case 'up':
  //      if(_dev_ip in clipstack) 
  //        break;
  //      else clipstack.unshift(_dev_ip);
  //      break;
  //    case 'down':
  //      var id = clipstack.indexOf(_dev_ip);
  //      if(id == -1)
  //        throw new Error("Warn: this device is not in the clipstack.");
  //      else
  //        clipstack.splice(id,1);
  //      break;
  //    default :
  //      break;
  //  }
  // });
}

//this function's fearure is to get the current 
//content of local system's clipboard
function getClipboardData(cb_) {
  copypaste.paste(function(err, ret) {
    if (err === null) {
      var clipContent = ret;
      cb_(clipContent);
    } else {
      cb_(err);
    }
  });
}

/* para @string: data to be copied.
 *  para @clipContent: current data of the clipboard
 *  if the clipboard is updated,return a mesage to inform other devices;
 *  otherwise return false.
 *
 */
function isClipboardUpdated(string, callback) {
  var flag = undefined;
  console.log("data to be copied: " + string);
  getClipboardData(function(_clipContent) {
    console.log("_clipContent: " + _clipContent);
    if (string === _clipContent) {
      console.log("clipboard's content is not changed.");
      // var localIp = os.networkInterfaces().eth1[0].address;
      if (localIp != getClipData)
        broadcast();
      flag = false;
      callback(flag);
    } else {
      //broadcast clipboard updated mesage to device in the AdHoc.
      broadcast();
      flag = true;
      callback(flag);
    }
  });
}

/* @method broadcast()
 *   to broadcast clipboard update message to device in the AdHoc
 */
function broadcast() {
  var msg = {};
  msg.ip = localIp;
  msg.txt = "content of " + msg.ip + "'s clipboard is updated!";
  //inform other device in the AdHoc that the content of system clipboard has been updated
  for (var i = 0; i < clipstack.length; i++) {
    var _ip = clipstack[i];
    if (_ip == msg.ip) {
      updateClipStack(msg, clipstack);
      continue;
    } else {
      var intent = im.Intent("cpIntent", msg);
      intent.send("cpReciver", _ip);
      console.log("message is sent...");
    }
  };
  console.log("msg: " + JSON.stringify(msg));
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
function updateClipStack(msg, clipstack, callback) {
  var _ip = msg.ip;
  // data structure of the clip stack needed to be initial before doing the following action
  var _clipstack = clipstack;
  var _count = 0;

  //if msg.ip is already stored in the clipstack,do like this
  for (var i = 0; i < _clipstack.length; i++) {

    if (_ip == _clipstack[i]) {
      if (i == _clipstack.length - 1)
        break;
      else {
        _clipstack.splice(i, 1);
        _clipstack.push(_ip);
        break;
      }
    } else _count++;
  }

  //if msg.ip is not stored in the clipstack,do like this
  if (_count == _clipstack.length)
    clipstack.push(_ip);
}



//function to get the top element of the clipstack

function getClipData() {
  return clipstack[clipstack.length - 1];
}


var stub = null;
exports.setStub = function(stub_) {
  if (typeof stub_ !== 'undefined')
    stub = stub_;
};

//interface for app to execute 'copy' 
//para @string: data to be copied
//para @callback: callback to handle some info
//
exports.copy = function(string, callback) {
  isClipboardUpdated(string, function(flag) {
    if (flag == true) {
      console.log("--------call node-copy-paste's copy()------");
      console.log("string::: " + string);
      copypaste.copy(string);
      callback(null);
    } else {
      callback("content of clipboard is up-to-date");
    }
  });
};

//interface for app to execute 'paste'
exports.paste = function(callback) {
  //check wether the ip is local or remote,
  //then handle the paste request according
  //to the situation.
  var _ip = getClipData();
  var _localIp = localIp;
  if (_ip == _localIp) {
    getClipboardData(function(ret) {
      console.log("--------local paste test--------");
      console.log("ret: " + ret);
      if (ret === null) ret = "";
      callback(null, ret);
    });
  } else {
    //remotePaste procedue
    var _remoteProxy = remoteProxy.getProxy(_ip);
    _remoteProxy.paste(function(result) {
      console.log("--------remote paste test--------");
      if (result === null) result = "";
      console.log("result: " + result);
      callback(null, result);
    });
  }
};

(function main() {
  maintainClipStack();
  im.startReciver("cpReciver", function(content) {
    console.log(content);
    var _msg = content;
    updateClipStack(_msg, clipstack);
  });
})();
