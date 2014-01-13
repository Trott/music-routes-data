// Specs are run via Grunt: grunt jasmine_node

var fs = require("fs");
var glob = require("glob");

var Data = require("../lib/Data");


describe("data constructor", function () {

  it("should begin with no data", function () {
    var data = new Data();
    var tracks = data.search({collection: "tracks"}).results;
    expect(tracks.length).toBe(0);
  });

  describe("read(dataDir)", function () {
    it("should read from specified directory", function () {
      var dataDir = __dirname + "/fixture/data";
      var data = new Data();
      data.read(dataDir);
      var tracks = data.search({collection: "tracks"}).results;
      expect(tracks).toContain({_id:"1", names:["That's All Right"]});
      expect(tracks).toContain({_id:"2", names:["Blue Moon of Kentucky"]});
      expect(tracks.length).toBe(2);
    });

    it("should return ERROR if data directory does not exist", function () {
      var dataDir = __dirname + "bad/path";
      var data = new Data();
      var rv = data.read(dataDir);
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
    });

    it("should return ERROR if dataDir not specified", function () {
      var data = new Data ();
      var rv = data.read();
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
    });

  });
});

describe ("data", function () {

  var data;
  var fixtureDir = __dirname + "/fixture/data";

  beforeEach(function () {
    data = new Data();
    data.read(fixtureDir);
  });

  describe("create(collection, entry)", function () {

    it("should add a track to the track collection", function () {
      var initialLength = data.search({collection: "tracks"}).results.length;
      data.create('tracks', {_id: "3", names: ["If I Needed Someone"]});
      var tracks = data.search({collection: "tracks"}).results;
      expect(tracks.length).toBe(initialLength + 1);
      expect(tracks).toContain({_id: "3", names: ["If I Needed Someone"]});
    });

    it("should return OK status code if track is added", function () {
      var rv = data.create('tracks', {_id: "3", names: ["Let's Go Away For A While"]});
      expect(rv.status).toEqual(data.StatusEnum.OK);
    });

    it("should return ERROR if _id matches another track", function () {
      var rv = data.create('tracks', {_id: "2", names: ["Someone Keeps Moving My Chair"]});
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
    });

    it("should return ERROR if _id is not specified", function () {
      var rv = data.create('tracks', {names: ["Everybody's Got Something To Hide Except For Me And My Monkey"]});
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
    });

    it("should not change the tracks collection if _id matches another track", function () {
      data.create('tracks', {_id: "2", names: ["The Night They Drove Old Dixie Down"]});
      expect(data.search({collection: "tracks"}).results).not.toContain({_id: "3", names: ["The Night They Drove Old Dixie Down"]});
    });

    it("should not change the tracks collection if _id is not specified", function () {
      var before = data.search({collection: "tracks"}).results;
      data.create('tracks', {names: ["Autumn Sweater"]});
      expect(data.search({collection: "tracks"}).results).toEqual(before);
    });

    it("should not allow an empty _id string", function () {
      var before = data.search({collection: "tracks"}).results;
      var rv = data.create('tracks', {_id: "", names: ["Quiet Village"]});
      expect(data.search({collection: "tracks"}).results).toEqual(before);
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
    });

    it("should return ERROR and not update tracks collection if names array is not provided", function () {
      var before = data.search({collection: "tracks"}).results;
      var rv = data.create('tracks', {_id: "3"});
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
      expect(data.search({collection: "tracks"}).results).toEqual(before);
    });

    it("should return ERROR and not update tracks collection if names property is provided but not an array", function () {
      var before = data.search({collection: "tracks"}).results;
      var rv = data.create('tracks', {_id: "3", names: "The Battle Of Who Could Care Less"});
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
      expect(data.search({collection: "tracks"}).results).toEqual(before);
    });

    it("should discard properties other than _id and names", function () {
      var rv = data.create('tracks', {_id: "3", names: ["Uh, Zoom Zip"], releases: ["Ruby Vroom"]});
      expect(rv.status).toEqual(data.StatusEnum.OK);
      expect(data.search({collection: "tracks"}).results).toContain({_id: "3", names: ["Uh, Zoom Zip"]});
    });

    it("should return ERROR and not change collection if _id is not a string", function () {
      var before = data.search({collection: "tracks"}).results;
      var rv = data.create('tracks', {_id: true, names: ["Don't Think Twice, It's Alright"]});
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
      expect(data.search({collection: "tracks"}).results).toEqual(before);
    });

    it("should return ERROR and not change collection with a names array where one or more elements are not strings", function () {
      var before = data.search({collection: "tracks"}).results;
      var rv = data.create("tracks", {_id: "3", names: [true, "True"]});
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
      expect(data.search({collection: "tracks"}).results).toEqual(before);
    });

    it("should return ERROR if collection does not exist", function () {
      var newTrack = {_id: "3", names: ["All The Things You Could Be By Now If Sigmund Freud's Wife Were Your Mother"]};
      var rv = data.create("invalid collection", newTrack);
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
    });

  });

  describe("link(collection, entry)", function () {
    it("should connect two entities from different collections", function () {
      var initialLength = data.search({collection: "individual_track"}).results.length;
      data.link('individual_track', {track_id: "1", individual_id: "1"});
      var individual_track = data.search({collection: "individual_track"}).results;
      expect(individual_track.length).toBe(initialLength + 1);
      expect(individual_track).toContain({track_id: "1", individual_id: "1"});
    });

    it("should return ERROR if collection is not a link collection", function () {
      var rv = data.link('tracks', {});
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
      data.create("tracks", {_id: "3", names: ["Flesh, Blood, and Bone"]});
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

  describe("write(outputDir)", function () {
    var outputDir;

    beforeEach(function () {
      outputDir = __dirname + "/../tmp";
      glob.sync(outputDir+"/*.json").forEach(function (fileName) { fs.unlinkSync(fileName); });
    });

    it("should duplicate the track collection if no changes have been made", function () {
      data.write(outputDir);
      var newData = new Data();
      newData.read(outputDir);
      expect(newData.search({collection: "tracks"}).results).toEqual(data.search({collection: "tracks"}).results);
    });

    it("should reflect a newly-created track in the output", function () {
      var newTrack = {_id: "3", names:["Count It Higher"]};
      data.create('tracks', newTrack);
      data.write(outputDir);
      var newData = new Data();
      newData.read(outputDir);
      expect(newData.search({collection: "tracks"}).results).toContain(newTrack);
      var oldData = new Data();
      oldData.read(fixtureDir);
      expect(oldData.search({collection: "tracks"}).results).not.toContain(newTrack);
    });

    it("should return ERROR if outputDir not specified", function () {
      var rv = data.write();
      expect(rv.status).toEqual(data.StatusEnum.ERROR);
    });

    it("should return OK for routine usage", function () {
      var rv = data.write(outputDir);
      expect(rv.status).toEqual(data.StatusEnum.OK);
    });
  });
});
