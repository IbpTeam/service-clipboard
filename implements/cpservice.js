var copypaste = require("copy-paste"),
  os = require("os"),
  api = require("api"),
  im = api.im(),
  device = api.devDetect(),
  remoteProxy = require("../interface/clipboardProxyRemote");


var clipstack = undefined,
  netIface = os.networkInterfaces(),
  eth = netIface.eth0 || netIface.eth1,
  localIp = eth[0].address;


//init the clipstack of a device based on device-discovery service
function maintainClipStack() {
  if (clipstack === undefined) {
    // clipstack = ["192.168.162.122", "192.168.160.56"];
    clipstack = [localIp];
  }
  console.log("======This is in maintainClipStack======");
  // update the clipstack when there is a device online or offline.
  device.addListener(function(_para) {
    if (typeof _para !== 'object') return console.log(_para);
    var _info = _para.info,
      _dev_ip = _info.address;
    id = clipstack.indexOf(_dev_ip);
    switch (_para.flag) {
      case 'up':
        console.log('Device Up');
        if (id !== -1)
          break;
        else clipstack.unshift(_dev_ip);
        break;
      case 'down':
        console.log('Device Down');
        if (id == -1)
          throw new Error("INFO: This device is not in the clipstack.");
        else
          clipstack.splice(id, 1);
        break;
      default:
        break;
    }
    console.log('clipboard stack:', clipstack);
  });
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
      if (localIp != getClipData)
      // broadcast();
        flag = false;
      callback(flag);
    } else {
      //broadcast clipboard updated mesage to device in the AdHoc.    
      flag = true;
      callback(flag);
    }
    // broadcast();
  });
}

/* @method broadcast()
 *   to broadcast clipboard update message to device in the AdHoc
 * para @msg:Object,
 *      {ip: string,e.g:127.0.0.1
 *       value:string,
 *          e.g:value of text:"text:this is a test"
 *              value of path:"path:/home/zk/file.txt"
 *       txt: string }
 */
function broadcast(string) {
  var msg = {};
  msg.ip = localIp;
  msg.value = string;
  msg.txt = "State of " + msg.ip + "'s clipboard is updated!";
  //inform other device in the AdHoc that the content of system clipboard has been updated
  for (var i = 0; i < clipstack.length; i++) {
    var _ip = clipstack[i];
    if (_ip == msg.ip) {
      updateClipStack(msg, clipstack);
      continue;
    } else {
      var intent = new im.Intent("cpIntent", msg);
      intent.send("cpReciver", _ip);
      console.log("message is sent to " + _ip + "...");
    }
  };
  console.log("msg: " + JSON.stringify(msg));
}

/* para @msg:Object,
 *      {ip: string,e.g:127.0.0.1
 *      content:string,
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
  // data structure of the clipstack needed to be initiated before doing the following action
  var _clipstack = clipstack;
  console.log("clipstack : " + clipstack);
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
  console.log("clipstack: " + JSON.stringify(clipstack));
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
  broadcast(string);
  console.log("original sting: " + string);
  var str = string.substring(5)
  console.log("new str: " + str);
  isClipboardUpdated(str, function(flag) {
    if (flag == true) {
      console.log("--------call node-copy-paste's copy()------");
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
      console.log("local ret: " + ret);
      var err = "Target value is null!";
      if (ret === null) {
        callback(err);
      } else {
        callback(null, ret, "");
      }
    });
  } else {
    //remotePaste procedue
    var _remoteProxy = remoteProxy.getProxy(_ip);
    _remoteProxy.paste(function(ret) {
      console.log("--------remote paste test--------");
      if (ret.err) {
        callback(ret.err);
      } else {
        console.log("remote ret: " + ret.ret);
        callback(null, ret.ret, _ip);
      }

    });
  }
};

(function main() {

  maintainClipStack();
  device.startMdnsService(function(state) {
    if (state === true) {
      console.log('start MDNS service successful!');
    };
  });
  im.startReciver("cpReciver", function(content) { 
    console.log(content);
    var _msg = content;
    updateClipStack(_msg, clipstack);
    if (_msg.value.indexOf("text:") == 0)
      copypaste.copy(_msg.value.substring(5));
    console.log("update clipstack : " + clipstack);
  }); 
})();
