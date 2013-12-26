// Specs are run via Grunt: grunt jasmine_node

var path = require('path');
var data = require('../lib/data.js');

describe('data.load()', function() {
  it('should return true if data loaded from specified directory', function() {
    var dataDir = path.resolve('./spec/fixture/data');
    expect(data.load(dataDir)).toBe(true);
  });
});
