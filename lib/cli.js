var util = require('util');

var Data = require('./data.js');

function Cli() {
  Data.apply(this, arguments);
}

util.inherits(Cli, Data);

Cli.prototype.add = function (collection, _id, displayName) {
  var rv;
  rv = this.create(collection, {_id: _id, names: [displayName]});

  return rv;
};

module.exports = Cli;
