var cpService = require("../../../service/clipboard/interface/clipboardProxy").getProxy();

var data = "this a test of clipboard.";
cpService.copy(data, function(ret) {
  console.log(ret.err);
  if (!ret.err) {
    console.log("--------copy test--------");
    cpService.paste(function(ret) {
      console.log("ret :::" + ret.ret);
      console.log("--------do paste succeedly--------");
    });
  } else {
    // throw err;
    console.log("Error: " + ret.err);
  }
});
