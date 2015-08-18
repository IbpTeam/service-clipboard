// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var __cd = undefined,
    init = false,
    pending = [];
require('webde-rpc').defaultSvcMgr().getService('nodejs.webde.commdaemon', function(ret) {
  if(ret.err) return console.log(ret.err);
  __cd = ret.ret;
  init = true;
  __emit();
});

function __emit() {
  for(var key in pending) {
    for(var i = 0; i < pending[key].length; ++i) {
      var p = pending[key][i];
      clearTimeout(p[1]);
      proxy[key].apply(proxy, p[0]);
    }
  }
  pending = [];
}

function __pend(fn, args, cb) {
  if(typeof pending[fn] === 'undefined') {
    pending[fn] = [];
  }
  var to = setTimeout(function() {
    cb({err: 'Can\'t get commdaemon service'});
  }, 5000);
  pending[fn].push([args, to]);
}

function Proxy(ip) {
  if(typeof ip !== 'undefined') {
    this.ip = ip;
  } else {
    return console.log('The remote IP is required');
  }

  this._token = 0;

}

/**
 * @description
 *    some brief introduction of this interface
 * @param
 *    parameter list. e.g. param1: description -> value type
 * @return
 *    what will return from this interface
 */
Proxy.prototype.copy = function(String, callback) {
  if(!init) {
    __pend('copy', arguments, callback);
    return ;
  }
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  var argv = {
      action: 0,
      svr: 'nodejs.webde.clipboard',
      func: 'copy',
      args: args
    };
  __cd.send(this.ip, argv, callback);
};

/**
 * @description
 *    some brief introduction of this interface
 * @param
 *    parameter list. e.g. param1: description -> value type
 * @return
 *    what will return from this interface
 */
Proxy.prototype.paste = function(callback) {
  if(!init) {
    __pend('paste', arguments, callback);
    return ;
  }
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  var argv = {
      action: 0,
      svr: 'nodejs.webde.clipboard',
      func: 'paste',
      args: args
    };
  __cd.send(this.ip, argv, callback);
};

/**
 * @description
 *    add listener for ...
 * @param
 *    param1: event to listen -> String
 *    param2: a listener function -> Function
 *      @description
 *        a callback function called when events happened
 *      @param
 *        param1: description of this parameter -> type
 * @return
 *    itself of this instance
 */
Proxy.prototype.on = function(event, handler) {
  if(!init) {
    __pend('on', arguments, function(){});
    return ;
  }
  __cd.on(event, handler);
  var argvs = {
    'action': 0,
    'svr': 'nodejs.webde.clipboard',
    'func': 'on',
    'args': [event]
  };
  __cd.send(this.ip, argvs);
  return this;
};

/**
 * @description
 *    remove listener from ...
 * @param
 *    param1: event to listen -> String
 *    param2: a listener function -> Function
 *      @description
 *        a callback function called when events happened
 *      @param
 *        param1: description of this parameter -> type
 * @return
 *    itself of this instance
 */
Proxy.prototype.off = function(event, handler) {
  if(!init) {
    __pend('off', arguments, function(){});
    return ;
  }
  __cd.off(event, handler);
  var argvs = {
    'action': 0,
    'svr': 'nodejs.webde.clipboard',
    'func': 'off',
    'args': [event]
  };
  __cd.send(this.ip, argvs);
  return this;
};

var proxy = null;
exports.getProxy = function(ip) {
  if(proxy == null) {
    proxy = new Proxy(ip);
  }
  return proxy;
};
