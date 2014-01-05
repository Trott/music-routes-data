var util = require('util');

var Data = require('./data.js');

function Cli() {
  Data.apply(this, arguments);
}

util.inherits(Cli, Data);

Cli.prototype.argv = function (initialArgv) {
  var actions = ["add", "search"];
  var action = initialArgv[2];
  var args = initialArgv.splice(3);
  var rv;

//TODO: normalize this so that a switch isn't really necessary. Just call the functions and process the results the same for each.
  switch (action) {
  case "add":
    rv = this.add.apply(this, args);
    if (rv.status === this.StatusEnum.OK) {
        this.write();
    }
    if (rv.message) {
      console.error(rv.message);
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
      console.error(rv.message);
    }
    break;

  default:
    console.error("Usage: " + initialArgv[1] + " [ " + actions.join(" | ") + " ] ...");
  }
};

Cli.prototype.add = function (collection, _id, displayName) {
  var rv;
  rv = this.create(collection, {_id: _id, names: [displayName]});

  return rv;
};

module.exports = Cli;
