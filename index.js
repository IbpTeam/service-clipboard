var clipboard = require("./implements/cpservice");
var stub = require("./interface/clipboardStub").getStub(__dirname +"/interface/clipboardProxy",clipboard);
clipboard.setStub(stub);

