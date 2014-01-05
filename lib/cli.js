var util = require('util');

var Data = require('./data.js');

function Cli() {
    Data.apply(this, arguments);
}

util.inherits(Cli, Data);

Cli.prototype.add = function (collection, _id, displayName) {
  var rv;
  switch (collection) {
    case "tracks":
      rv = this.create("tracks", {_id: _id, names: [displayName]});
      break;
    default:
      rv = makeReturnValue(this.StatusEnum.ERROR, "Invalid collection: " + collection);
  }

  if (rv.status === this.StatusEnum.ERROR) {
    console.error("Error adding data: " + rv.message);
  }

  return rv;
};

module.exports = Cli;
