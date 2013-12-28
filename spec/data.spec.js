// Specs are run via Grunt: grunt jasmine_node

var path = require('path');
var Data = require('../lib/Data.js');

describe('Constructor', function () {

  it('should load from specified directory', function () {
    var dataDir = path.resolve('spec/fixture/data');
    var data = new Data({dataDir: dataDir});
    expect(data.getTracks()).toEqual([{_id:"1", titles:["That's All Right"]}, {_id:"2", titles:["Blue Moon of Kentucky"]}]);
  });

  it('should throw an exception if data directory does not exist', function () {
    var dataDir = path.resolve('bad/path');
    expect(function () {var data = new Data({dataDir: dataDir});}).toThrow();
  });

  it('should load from the data directory if no directory is specified', function () {
    var dataDir = path.resolve('data');
    var dataWithArgument = new Data({dataDir: dataDir});
    var dataWithoutArgument = new Data();
    expect(dataWithArgument.getTracks()).toEqual(dataWithoutArgument.getTracks());
  });

});

describe ("non-Constructor", function () {

  var data;
  var dataDir = path.resolve("spec/fixture/data");

  var resetData = function () {
    data = new Data({dataDir: dataDir});
  };

  describe("createTrack()", function () {
    beforeEach(resetData);

    it("should add a track to the track collection", function () {
      var initialLength = data.getTracks().length;
      data.createTrack({_id: "3", title: "If I Needed Someone"});
      expect(data.getTracks().length).toBe(initialLength + 1);
    });

    it("should return the _id of an added track", function () {
      expect(data.createTrack({_id: "3", title: "Let's Go Away For A While"})).toBe("3");
    });

    it("should return an empty string if _id matches another track", function () {
      expect(data.createTrack({_id: "2", title: "Someone Keeps Moving My Chair"})).toBe("");
    });

    xit("should return an empty string if _id is not specified", function () {

    });

    xit("should not change the tracks collection if _id matches another track", function () {
      expect();
    });

    xit("should not change the tracks collection if _id is not specified", function () {

    });

    xit("should not allow an empty _id string", function () {

    });

  });

});