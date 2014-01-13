var fs = require("fs");
var Data = require("../Data");

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
  }

  // TODO: Should warn user if no input dir specified?
  // TODO: Should warn user if no output dir specified for a command that writes?

  // TODO: move the individual case's to their own modules to keep this short and manageable
  switch (action) {
    case "add":
      rv = data.create(args[0], {_id: args[1], names: [args[2]]});
      if (rv.message) {
        this.error(rv.message);
      }
      if (rv.status === data.StatusEnum.OK) {
        data.write(outputDir);
      }
      break;

    case "search":
      var collection = args.shift();
      var searchTerm = args.shift();
      filterCallback = function (value) {
        var names = value.names;
        return names.indexOf(searchTerm) !== -1;
      };
      rv = data.search({collection: collection, filterCallback: filterCallback});
      if (rv.status === data.StatusEnum.OK) {
        console.dir(rv.results);
      }
      if (rv.message) {
        this.error(rv.message);
      }
      break;

    case "link":
      var collection1 = args.shift();
      var id1 = args.shift();
      var collection2 = args.shift();
      var id2 = args.shift();

      var linkCollection = collection1 + '_' + collection2;
      var field1 = collection1 + '_id';
      var field2 = collection2 + '_id';
      var link = {};
      link[field1] = id1;
      link[field2] = id2;

      if (data.linkCollections.indexOf(linkCollection) === -1) {
        // Try track_release if release_track is what we have
        linkCollection = collection2 + '_' + collection1;
        if (data.linkCollections.indexOf(linkCollection) === -1) {
          this.error(collection1 + " and " + collection2 + " cannot be linked");
          rv.status = data.StatusEnum.ERROR;
          break;
        }
      }
      rv = data.link(linkCollection, link);

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
