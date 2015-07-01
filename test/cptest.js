var cpService = require("../../../service/clipboard/interface/clipboardProxy").getProxy();

var data = "text:this a test of clipboard.";
cpService.copy(data, function(ret) {
  if (!ret.err) {
    console.log("--------copy test--------");
    cpService.paste(function(ret) {
      console.log("ret :::" +  JSON.stringify(ret.ret));
      console.log("IP: " + ret.ip);
      console.log("--------do paste succeedly--------");
    });
  } else {
    // throw err;
    console.log("Info: " + ret.err);
  }
});
