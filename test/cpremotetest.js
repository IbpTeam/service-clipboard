var remoteproxy = require("../interface/clipboardProxyRemote");

var _remoteProxy = remoteproxy.getProxy("127.0.0.1");

_remoteProxy.paste(function(ret) {
  if (ret.ret)
    console.log("ret: " + ret.ret);
  else
    console.log("Error: " + ret.err);
});