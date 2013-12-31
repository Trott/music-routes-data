// Specs are run via Grunt: grunt jasmine_node

var fs = require("fs");
var glob = require("glob");

var Data = require("../lib/Data.js");

describe("Constructor", function () {

  it("should load from specified directory", function () {
    var dataDir = __dirname + "/fixture/data";
    var data = new Data({dataDir: dataDir});
    var tracks = data.search({collection: "tracks"}).results;
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
    expect(dataWithArgument.search("tracks").results).toEqual(dataWithoutArgument.search("tracks").results);
  });

});

describe ("non-Constructor", function () {

  var data;
  var fixtureDir = __dirname + "/fixture/data";
  var outputDir = __dirname + "/../tmp";

  beforeEach(function () {
    data = new Data({dataDir: fixtureDir, outputDir: outputDir});
    glob.sync(outputDir+"/*.json").forEach(function (fileName) { fs.unlinkSync(fileName); });
  });

  describe("create(collection, entry)", function () {

    it("should add a track to the track collection", function () {
      var initialLength = data.search({collection: "tracks"}).results.length;
      data.create('tracks', {_id: "3", titles: ["If I Needed Someone"]});
      var tracks = data.search({collection: "tracks"}).results;
      expect(tracks.length).toBe(initialLength + 1);
      expect(tracks).toContain({_id: "3", titles: ["If I Needed Someone"]});
    });

    it("should return OK status code if track is added", function () {
      var rv = data.create('tracks', {_id: "3", titles: ["Let's Go Away For A While"]});
      expect(rv.status).toEqual(data.StatusEnum.OK);
    });

    it("should return ERROR if _id matches another track", function () {
      var rv = data.create('tracks', {_id: "2", titles: ["Someone Keeps Moving My Chair"]});
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
    });

    it("should return ERROR if _id is not specified", function () {
      var rv = data.create('tracks', {titles: ["Everybody's Got Something To Hide Except For Me And My Monkey"]});
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
    });

    it("should not change the tracks collection if _id matches another track", function () {
      data.create('tracks', {_id: "2", titles: ["The Night They Drove Old Dixie Down"]});
      expect(data.search({collection: "tracks"}).results).not.toContain({_id: "3", titles: ["The Night They Drove Old Dixie Down"]});
    });

    it("should not change the tracks collection if _id is not specified", function () {
      var before = data.search({collection: "tracks"}).results;
      data.create('tracks', {titles: ["Autumn Sweater"]});
      expect(data.search({collection: "tracks"}).results).toEqual(before);
    });

    it("should not allow an empty _id string", function () {
      var before = data.search({collection: "tracks"}).results;
      var rv = data.create('tracks', {_id: "", titles: ["Quiet Village"]});
      expect(data.search({collection: "tracks"}).results).toEqual(before);
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
    });

    it("should return ERROR and not update tracks collection if titles array is not provided", function () {
      var before = data.search({collection: "tracks"}).results;
      var rv = data.create('tracks', {_id: "3"});
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
      expect(data.search({collection: "tracks"}).results).toEqual(before);
    });

    it("should return ERROR and not update tracks collection if titles property is provided but not an array", function () {
      var before = data.search({collection: "tracks"}).results;
      var rv = data.create('tracks', {_id: "3", titles: "The Battle Of Who Could Care Less"});
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
      expect(data.search({collection: "tracks"}).results).toEqual(before);
    });

    it("should discard properties other than _id and titles", function () {
      var rv = data.create('tracks', {_id: "3", titles: ["Uh, Zoom Zip"], releases: ["Ruby Vroom"]});
      expect(rv.status).toEqual(data.StatusEnum.OK);
      expect(data.search({collection: "tracks"}).results).toContain({_id: "3", titles: ["Uh, Zoom Zip"]});
    });

    it("should return ERROR and not change collection if _id is not a string", function () {
      var before = data.search({collection: "tracks"}).results;
      var rv = data.create('tracks', {_id: true, titles: ["Don't Think Twice, It's Alright"]});
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
      expect(data.search({collection: "tracks"}).results).toEqual(before);
    });

    it("should return ERROR and not change collection with a titles array where one or more elements are not strings", function () {
      var before = data.search({collection: "tracks"}).results;
      var rv = data.create("tracks", {_id: "3", titles: [true, "True"]});
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
      expect(data.search({collection: "tracks"}).results).toEqual(before);
    });

    it("should return ERROR if collection does not exist", function () {
      var newTrack = {_id: "3", titles: ["All The Things You Could Be By Now If Sigmund Freud's Wife Were Your Mother"]};
      var rv = data.create("invalid collection", newTrack);
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
    });

  });

  describe("search(options)", function () {

    it("should return ERROR if called without an options argument", function () {
      expect(data.search().status).toEqual(data.StatusEnum.ERROR);
    });

    it("should return ERROR if called without a collection specified in options", function () {
      expect(data.search({}).status).toEqual(data.StatusEnum.ERROR);
    });

    it("should return ERROR if the collection does not exist", function () {
      expect(data.search({collection: "a bad collection name"}).status).toEqual(data.StatusEnum.ERROR);
    });

    it("should return OK and all documents in collection if no filter specified", function () {
      var rv = data.search({collection: "tracks"});
      expect(rv.status).toEqual(data.StatusEnum.OK);
      expect(rv.results.length).toBe(2);
    });

    it("should return a cloned array, not a reference to the internal results", function () {
      var before = data.search({collection: "tracks"}).results;
      data.create("tracks", {_id: "3", titles: ["Flesh, Blood, and Bone"]});
      expect(data.search({collection: "tracks"}).results).not.toEqual(before);
    });

    it("should filter using the filterCallback option", function () {
      var filterCallback = function (individual) {
        return individual.names.indexOf("Elvis Presley") !== -1;
      };
      var rv = data.search({collection: "individuals", filterCallback: filterCallback});
      expect(rv.status).toEqual(data.StatusEnum.OK);
      expect(rv.results).toEqual([{_id:"1", names:["Elvis Presley"]}]);
    });

    it("should return ERROR if filterCallback is not a function", function () {
      var rv = data.search({collection: "individuals", filterCallback: "*"});
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
    });

  });

  describe("add(collection, _id, displayName)", function () {
    it("should create a new track when called with tracks", function () {
      var initialLength = data.search({collection: "tracks"}).results.length;
      var rv = data.add("tracks", "5", "Original Faubus Fables");
      expect(rv.status).toEqual(data.StatusEnum.OK);
      var tracks = data.search({collection: "tracks"}).results;
      expect(tracks).toContain({"_id": "5", "titles": ["Original Faubus Fables"]});
      expect(tracks.length).toBe(initialLength + 1);
    });
  });

  describe("write()", function () {
    it("should duplicate the track collection if no changes have been made", function () {
      data.write();
      var newData = new Data({dataDir: outputDir});
      expect(newData.search({collection: "tracks"}).results).toEqual(data.search({collection: "tracks"}).results);
    });

    it("should reflect a newly-created track in the output", function () {
      var newTrack = {_id: "3", titles:["Count It Higher"]};
      data.create('tracks', newTrack);
      data.write();
      var newData = new Data({dataDir: outputDir});
      expect(newData.search({collection: "tracks"}).results).toContain(newTrack);
      var oldData = new Data({dataDir: fixtureDir});
      expect(oldData.search({collection: "tracks"}).results).not.toContain(newTrack);
    });
  });

});
