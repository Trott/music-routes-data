// Specs are run via Grunt: grunt jasmine_node

var path = require('path');
var Data = require('../lib/Data.js');
var data;

describe('Constructor', function () {

  it('should load from specified directory', function() {
    var dataDir = path.resolve('spec/fixture/data');
    data = new Data({dataDir: dataDir});
    expect(data.getTracks()).toEqual([{"id":"1", "titles":["That's All Right"]}, {"id":"2", "titles":["Blue Moon of Kentucky"]}]);
  });

  it('should throw an exception if data directory does not exist', function () {
    var dataDir = path.resolve('bad/path');
    expect(function () {data = new Data({dataDir: dataDir});}).toThrow();
  });

  it('should load from the data directory if no directory is specified', function () {
    var dataDir = path.resolve('data');
    var dataWithArgument = new Data({dataDir: dataDir});
    var dataWithoutArgument = new Data();
    expect(dataWithArgument.getTracks()).toEqual(dataWithoutArgument.getTracks());
  });

});

describe ('non-Constructor tests', function () {

  beforeEach(function () {
    var dataDir = path.resolve('spec/fixture/data');
    data = new Data({dataDir: dataDir});
  });

  // describe('data.getTracks()', function () {

  //   it('should load from data directory if load is not called first', function () {
  //     var dataWithoutLoad = data.tracks();
  //     data.load();
  //     expect(data.tracks()).toEqual(dataWithoutLoad);
  //   });

  // });

});
