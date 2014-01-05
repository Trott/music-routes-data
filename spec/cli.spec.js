// Specs are run via Grunt: grunt jasmine_node

var fs = require("fs");
var glob = require("glob");

var Cli = require("../lib/Cli");

describe ("CLI", function () {

  var cli;
  var fixtureDir = __dirname + "/fixture/data";
  var outputDir = __dirname + "/../tmp";

  beforeEach(function () {
    cli = new Cli({dataDir: fixtureDir, outputDir: outputDir});
    glob.sync(outputDir+"/*.json").forEach(function (fileName) { fs.unlinkSync(fileName); });
  });

  describe("add(collection, _id, displayName)", function () {
    it("should create a new track when called with tracks", function () {
      var initialLength = cli.search({collection: "tracks"}).results.length;
      var rv = cli.add("tracks", "5", "Original Faubus Fables");
      expect(rv.status).toEqual(cli.StatusEnum.OK);
      var tracks = cli.search({collection: "tracks"}).results;
      expect(tracks).toContain({_id: "5", names: ["Original Faubus Fables"]});
      expect(tracks.length).toBe(initialLength + 1);
    });

    it("should return ERROR if collection is invalid", function () {
      var rv = cli.add("invalid collection name", "5", "Dat Dere");
      expect(rv.status).toEqual(cli.StatusEnum.ERROR);
    });

    it("should return ERROR if _id is a duplicate", function () {
      var rv = cli.add("tracks", "1", "Me And Her Got A Good Thing Goin' Baby");
      expect(rv.status).toEqual(cli.StatusEnum.ERROR);
      var tracks = cli.search({collection: "tracks"}).results;
      expect(tracks).not.toContain({_id: "1", names: ["Me And Her Got A Good Thing Goin' Baby"]});
      expect(tracks).toContain({_id: "1", names: ["That's All Right"]});
    });

    it("should create a new artist when called with artists", function () {
      var initialLength = cli.search({collection: "artists"}).results.length;
      var rv = cli.add("artists", "100", "Palace Family Steak House");
      expect(rv.status).toEqual(cli.StatusEnum.OK);
      var artists = cli.search({collection: "artists"}).results;
      expect(artists).toContain({_id: "100", names: ["Palace Family Steak House"]});
      expect(artists.length).toBe(initialLength + 1);
    });
  });

  describe("argv()", function () {
    it("should run the command with the given arguments", function () {
      cli.argv(["node", "/foo/bar.js", "add", "tracks", "5", "Dis Here"]);
      expect(cli.search({collection: "tracks"}).results).toContain({_id: "5", names:["Dis Here"]});
    });

    it("should return the usage message if command is not recognized", function () {
      spyOn(console, 'error');
      cli.argv(["node", "mrd", "nonexistent command"]);
      expect(console.error).toHaveBeenCalledWith("Usage: mrd [ add | search ] ...");
    });
  });

});
