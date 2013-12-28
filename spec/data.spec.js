// Specs are run via Grunt: grunt jasmine_node

var Data = require('../lib/Data.js');

describe('Constructor', function () {

  it('should load from specified directory', function () {
    var dataDir = __dirname + '/fixture/data';
    var data = new Data({dataDir: dataDir});
    var tracks = data.getTracks();
    expect(tracks).toContain({_id:"1", titles:["That's All Right"]});
    expect(tracks).toContain({_id:"2", titles:["Blue Moon of Kentucky"]});
  });

  it('should throw an exception if data directory does not exist', function () {
    var dataDir = __dirname + 'bad/path';
    expect(function () {var data = new Data({dataDir: dataDir});}).toThrow();
  });

  it('should load from the data directory if no directory is specified', function () {
    var dataDir = __dirname + '/../data';
    var dataWithArgument = new Data({dataDir: dataDir});
    var dataWithoutArgument = new Data();
    expect(dataWithArgument.getTracks()).toEqual(dataWithoutArgument.getTracks());
  });

});

describe ("non-Constructor", function () {

  var data;

  beforeEach(function () {
    data = new Data({dataDir: __dirname + "/fixture/data"});
  });

  describe("createTrack()", function () {

    it("should add a track to the track collection", function () {
      var initialLength = data.getTracks().length;
      data.createTrack({_id: "3", titles: ["If I Needed Someone"]});
      expect(data.getTracks().length).toBe(initialLength + 1);
    });

    it("should return the _id of an added track", function () {
      expect(data.createTrack({_id: "3", titles: ["Let's Go Away For A While"]})).toBe("3");
    });

    it("should return an empty string if _id matches another track", function () {
      expect(data.createTrack({_id: "2", titles: ["Someone Keeps Moving My Chair"]})).toBe("");
    });

    it("should return an empty string if _id is not specified", function () {
      expect(data.createTrack({titles: ["Everybody's Got Something To Hide Except For Me And My Monkey"]})).toBe("");
    });

    it("should not change the tracks collection if _id matches another track", function () {
      data.createTrack({_id: "2", titles: ["The Night They Drove Old Dixie Down"]});
      expect(data.getTracks()).not.toContain({_id: "3", titles: ["The Night They Drove Old Dixie Down"]});
    });

    it("should not change the tracks collection if _id is not specified", function () {
      var before = data.getTracks();
      data.createTrack({titles: ["Autumn Sweater"]});
      expect(data.getTracks()).toEqual(before);
    });

    it("should not allow an empty _id string", function () {
      var before = data.getTracks();
      data.createTrack({_id: "", titles: ["Quiet Village"]});
      expect(data.getTracks()).toEqual(before);
    });

    it("should return an empty string and not update tracks collection if titles array is not provided", function () {
      var before = data.getTracks();
      var rc = data.createTrack({_id: "3"});
      expect(rc).toBe("");
      expect(data.getTracks()).toEqual(before);
    });

    it("should return an empty string and not update tracks collection if titles property is provided but not an array", function () {
      var before = data.getTracks();
      var rc = data.createTrack({_id: "3", titles: "The Battle Of Who Could Care Less"});
      expect(rc).toBe("");
      expect(data.getTracks()).toEqual(before);
    });

    xit("should discard properties other than _id and titles", function () {

    });

    xit("should reject a track with an _id that is not a string", function () {

    });

    xit("should reject a track with a titles array where one or more elements are not strings", function () {

    });

  });

  describe("getTracks()", function () {
    it("should return a cloned array, not a reference to the internal tracks collection", function () {
      var before = data.getTracks();
      data.createTrack({_id: "3", titles: ["Flesh, Blood, and Bone"]});
      expect(data.getTracks()).not.toEqual(before);
    });
  });

});
