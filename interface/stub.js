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
      clipboard.copy(String, function(err) {
        if (err) {
          return callback({
            err: err
          });
        }
        callback({});
      });
    },
    paste: function(callback) {
      clipboard.paste(function(err, ret, ip) {
        console.log(arguments);
        if (err) {
          return callback({
            err: err
          });
        }
        callback({
          ret: ret,
          ip: ip
        });
      });
    }
  }
}

function Stub() {
  this._ipc = require('webde-rpc').getIPC(initObj);
}

Stub.prototype.notify = function(event) {
  this._ipc.notify.apply(this._ipc, arguments);
};

var stub = null,
    clipboard = null;
exports.getStub = function(clipboard_) {
  if(stub == null) {
    stub = new Stub();
    clipboard = clipboard_;
  }
  return stub;
}
