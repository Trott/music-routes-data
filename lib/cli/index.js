var util = require("util");

var Data = require("../data");

function Cli() {
  Data.apply(this, arguments);
}

util.inherits(Cli, Data);

Cli.prototype.exit = function (code) {
  process.exit(code);
};

Cli.prototype.error = function (message) {
  console.error(message);
};

Cli.prototype.argv = function (argv) {
  var actions = ["add", "search"];
  var action = argv._[0];
  var args = argv._.splice(1);
  var rv;
  var code;

  var outputDir = argv.outputDir || argv.o;
  var inputDir = argv.inputDir || argv.i;

  if (inputDir) {
    // TODO: check return code and report error/exit
    this.read(inputDir);
  }

  // TODO: Should warn user if no input dir specified?
  // TODO: Should warn user if no output dir specified for a command that writes?
  // TODO: Update usage message to include --inputDir/-i and --outputDir/-o

  // TODO: move the individual case's to their own modules to keep this short and manageable
  switch (action) {
    case "add":
      rv = this.create(args[0], {_id: args[1], names: [args[2]]});
      if (rv.message) {
        this.error(rv.message);
      }
      if (rv.status === this.StatusEnum.OK) {
        this.write(outputDir);
      }
      break;

    case "search":
      var collection = args.shift();
      var searchTerm = args.shift();
      filterCallback = function (value) {
        var names = value.names;
        return names.indexOf(searchTerm) !== -1;
      };
      rv = this.search({collection: collection, filterCallback: filterCallback});
      if (rv.status === this.StatusEnum.OK) {
        console.dir(rv.results);
      }
      if (rv.message) {
        this.error(rv.message);
      }
      break;

    default:
      this.error("Usage: mrd [ " + actions.join(" | ") + " ] ...");
      rv = {status: this.StatusEnum.ERROR};
  }
  code = rv.status === this.StatusEnum.OK ? 0 : 1;
  this.exit(code);
};

module.exports = Cli;
