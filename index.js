var clipboard = require("./implements/cpservice");
	stub = require("./interface/clipboardStub").getStub(clipboard);
clipboard.setStub(stub);