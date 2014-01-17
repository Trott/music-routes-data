var fs = require("fs");
var Data = require("../Data");
var add = require("./add");
var search = require("./search");
var link = require("./link");


module.exports = function (argv) {
  var actions = ["add", "search"];
  var action = argv._[0];
  var args = argv._.splice(1);
  var rv = {};
  var code;
  var inputRv;

  var outputDir = argv.outputDir || argv.o;
  var inputDir = argv.inputDir || argv.i;

  var data = new Data();

  if (inputDir) {
    inputRv = data.read(inputDir);
    if (inputRv.message) {
        this.error(inputRv.message);
    }
    if (inputRv.status === data.StatusEnum.ERROR) {
        this.exit(1);
    }
  } else {
    this.error("No input directory -i specified. Operating on empty data set.\nUse -i to specify a data directory.");
  }

  // TODO: Should warn user if no output dir specified for a command that writes?

  // TODO: DRY out this.error, data.write, rv.status, rv.message stuff
  switch (action) {
    case "add":
      rv = add(data, outputDir, args[0], args[1], args[2]);
      if (rv.message) {
        this.error(rv.message);
      }
      if (rv.status === data.StatusEnum.OK) {
        data.write(outputDir);
      }
      break;

    case "search":
      rv = search(data, args[0], args[1]);
      if (rv.status === data.StatusEnum.OK) {
        this.dir(rv.results);
      }
      if (rv.message) {
        this.error(rv.message);
      }
      break;

    case "link":
      rv = link(data, args[0], args[1], args[2], args[3]);

      if (rv.message) {
        this.error(rv.message);
      }
      if (rv.status === data.StatusEnum.OK) {
        data.write(outputDir);
      }
      break;

    default:
      var message = fs.readFileSync(__dirname + "/../../doc/cli/help.txt", "utf8");
      this.error(message);
      rv = {status: data.StatusEnum.ERROR};
  }
  code = rv.status === data.StatusEnum.OK ? 0 : 1;
  this.exit(code);
};
