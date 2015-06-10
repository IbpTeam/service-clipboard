var clipboard = require("./implements/cpservice");
var stub = require("./interface/clipboardStub").getStub(proxyAddr,clipboard);
clipboard.setStub(stub);
