var fs = require("fs");
var Data = require("../Data");
var add = require("./add");
var search = require("./search");
var link = require("./link");


module.exports = function (argv) {
  var that = this;
  var actions = ["add", "search"];
  var action = argv._[0];
  var args = argv._.splice(1);
  var rv = {};
  var code;
  var inputRv;

  var outputDir = argv.outputDir || argv.o;
  var inputDir = argv.inputDir || argv.i;

  var data = new Data();

  var save = function () {
    if (rv.status === data.StatusEnum.OK) {
      if (outputDir) {
        data.write(outputDir);
      } else {
        that.error("No output directory specified. Your data will not be saved.\nUse -o to specify an output directory.");
      }
    }
  };

  if (inputDir) {
    inputRv = data.read(inputDir);
    if (inputRv.message) {
        this.error(inputRv.message);
    }
    if (inputRv.status === data.StatusEnum.ERROR) {
        this.exit(1);
    }
  } else {
    this.error("No input directory specified. Operating on empty data set.\nUse -i to specify a data directory.");
  }

  // TODO: DRY out this.error and rv.message stuff
  switch (action) {
    case "add":
      rv = add(data, args[0], args[1], args[2]);
      if (rv.message) {
        this.error(rv.message);
      }
      save();
      break;

    case "link":
      rv = link(data, args[0], args[1], args[2], args[3]);

      if (rv.message) {
        this.error(rv.message);
      }
      save();
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

    default:
      var message = fs.readFileSync(__dirname + "/../../doc/cli/help.txt", "utf8");
      this.error(message);
      rv = {status: data.StatusEnum.ERROR};
  }
  code = rv.status === data.StatusEnum.OK ? 0 : 1;
  this.exit(code);
};
