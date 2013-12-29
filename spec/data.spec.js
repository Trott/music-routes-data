// Specs are run via Grunt: grunt jasmine_node

var fs = require("fs");
var glob = require("glob");

var Data = require("../lib/Data.js");

describe("Constructor", function () {

  it("should load from specified directory", function () {
    var dataDir = __dirname + "/fixture/data";
    var data = new Data({dataDir: dataDir});
    var tracks = data.find("tracks");
    expect(tracks).toContain({_id:"1", titles:["That's All Right"]});
    expect(tracks).toContain({_id:"2", titles:["Blue Moon of Kentucky"]});
  });

  it("should throw an exception if data directory does not exist", function () {
    var dataDir = __dirname + "bad/path";
    expect(function () {var data = new Data({dataDir: dataDir});}).toThrow();
  });

  it("should load from the data directory if no directory is specified", function () {
    var dataDir = __dirname + "/../data";
    var dataWithArgument = new Data({dataDir: dataDir});
    var dataWithoutArgument = new Data();
    expect(dataWithArgument.find("tracks")).toEqual(dataWithoutArgument.find("tracks"));
  });

});

describe ("non-Constructor", function () {

  var data;
  var fixtureDir = __dirname + "/fixture/data";
  var outputDir = __dirname + "/../tmp";

  beforeEach(function () {
    data = new Data({dataDir: fixtureDir, outputDir: outputDir});
    console.dir(outputDir);
    glob.sync(outputDir+"/*.json").forEach(function (fileName) { fs.unlinkSync(fileName); });
  });

  describe("createTrack(entry)", function () {

    it("should add a track to the track collection", function () {
      var initialLength = data.find("tracks").length;
      data.createTrack({_id: "3", titles: ["If I Needed Someone"]});
      var tracks = data.find("tracks");
      expect(tracks.length).toBe(initialLength + 1);
      expect(tracks).toContain({_id: "3", titles: ["If I Needed Someone"]});
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
      expect(data.find("tracks")).not.toContain({_id: "3", titles: ["The Night They Drove Old Dixie Down"]});
    });

    it("should not change the tracks collection if _id is not specified", function () {
      var before = data.find("tracks");
      data.createTrack({titles: ["Autumn Sweater"]});
      expect(data.find("tracks")).toEqual(before);
    });

    it("should not allow an empty _id string", function () {
      var before = data.find("tracks");
      data.createTrack({_id: "", titles: ["Quiet Village"]});
      expect(data.find("tracks")).toEqual(before);
    });

    it("should return an empty string and not update tracks collection if titles array is not provided", function () {
      var before = data.find("tracks");
      var rc = data.createTrack({_id: "3"});
      expect(rc).toBe("");
      expect(data.find("tracks")).toEqual(before);
    });

    it("should return an empty string and not update tracks collection if titles property is provided but not an array", function () {
      var before = data.find("tracks");
      var rc = data.createTrack({_id: "3", titles: "The Battle Of Who Could Care Less"});
      expect(rc).toBe("");
      expect(data.find("tracks")).toEqual(before);
    });

    it("should discard properties other than _id and titles", function () {
      data.createTrack({_id: "3", titles: ["Uh, Zoom Zip"], releases: ["Ruby Vroom"]});
      expect(data.find("tracks")).toContain({_id: "3", titles: ["Uh, Zoom Zip"]});
    });

    it("should reject a track with an _id that is not a string", function () {
      var before = data.find("tracks");
      var rc = data.createTrack({_id: true, titles: ["Don't Think Twice, It's Alright"]});
      expect(rc).toBe("");
      expect(data.find("tracks")).toEqual(before);
    });

    it("should reject a track with a titles array where one or more elements are not strings", function () {
      var before = data.find("tracks");
      var rc = data.createTrack({_id: "3", titles: [true, "True"]});
      expect(rc).toBe("");
      expect(data.find("tracks")).toEqual(before);
    });

  });

  describe("find(collection)", function () {
    it("should return a cloned array, not a reference to the internal collection", function () {
      var before = data.find("tracks");
      data.createTrack({_id: "3", titles: ["Flesh, Blood, and Bone"]});
      expect(data.find("tracks")).not.toEqual(before);
    });

    it("should throw an exception if called without a collection argument", function () {
      expect(function () {data.find();}).toThrow();
    });

    it("should throw an exception if the collection does not exist", function () {
      expect(function () {data.find('a bad collection name');}).toThrow();
    });
  });

  describe("add(collection, _id, displayName)", function () {
    it("should create a new track when called with tracks", function () {
      var initialLength = data.find("tracks").length;
      var rc = data.add("tracks", "5", "Original Faubus Fables");
      expect(rc).toBe("5");
      var tracks = data.find("tracks");
      expect(tracks).toContain({"_id": "5", "titles": ["Original Faubus Fables"]});
      expect(tracks.length).toBe(initialLength + 1);
    });
  });

  describe("write()", function () {
    it("should duplicate the track collection if no changes have been made", function () {
      data.write();
      var newData = new Data({dataDir: outputDir});
      expect(newData.find("tracks")).toEqual(data.find("tracks"));
    });

    it("should reflect a newly-created track in the output", function () {
      var newTrack = {_id: "3", titles:["Count It Higher"]};
      data.createTrack(newTrack);
      data.write();
      var newData = new Data({dataDir: outputDir});
      expect(newData.find("tracks")).toContain(newTrack);
      var oldData = new Data({dataDir: fixtureDir});
      expect(oldData.find("tracks")).not.toContain(newTrack);
    });
  });

});
