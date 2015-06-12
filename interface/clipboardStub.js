// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var initObj = {
  "address": "nodejs.webde.clipboard",
  "path": "/nodejs/webde/clipboard",
  "name": "nodejs.webde.clipboard",
  "type": "dbus",
  "service": true,
  "interface": [
    {
      "name": "copy",
      "in": [
        "String"
      ]
    },
    {
      "name": "paste",
      "in": []
    }
  ],
  "serviceObj": {
    copy: function(String, callback) {
      clipboard.copy(String,function(err) {
        if(err) {
          return callback({err: err});
        }
        callback({});
      });
    },
    paste: function(callback) {
      clipboard.paste(function(err,ret){
        if(err) {
          return callback({err:err});
        }
        callback({ret:string});
      });
    }
  }
}

function Stub() {
  // TODO: please replace $IPC with the real path of webde-rpc module in your project
  this._ipc = require('webde-rpc').getIPC(initObj);
}

Stub.prototype.notify = function(event) {
  this._ipc.notify.apply(this._ipc, arguments);
};

var stub = null,
    cd = null,
    proxyAddr = "./clipboardPrxy.js";
exports.getStub = function(proxyAddr,clipboard_) {
  if(stub == null) {
    if(typeof proxyAddr === 'undefined')
      throw 'The path of proxy\'s module file we need!';
    // TODO: replace $cdProxy to the path of commdaemonProxy
    cd = require('../node_modules/commdaemon/interface/commdaemonProxy').getProxy();
    cd.register(initObj.name, proxyAddr, function(ret) {
      if(ret.err) {
        return console.log(ret.err
          , 'This service cannot be accessed from other devices since failed to register on CD');
      }
    });
    stub = new Stub();
    clipboard = clipboard_;
  }
  return stub;
}
