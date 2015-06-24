var remoteproxy = require("../interface/clipboardProxyRemote");

var _remoteProxy = remoteproxy.getProxy("127.0.0.1");

_remoteProxy.paste(function(ret) {
	console.log("ret: " + JSON.stringify(ret));
});
