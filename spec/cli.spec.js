// Specs are run via Grunt: grunt jasmine_node

var fs = require("fs");
var glob = require("glob");

var Cli = require("../lib/Cli");

describe ("CLI", function () {

  var cli;
  var fixtureDir = __dirname + "/fixture/data";
  var outputDir = __dirname + "/../tmp";
  var argv = {outputDir: outputDir};


  beforeEach(function () {
    cli = new Cli({dataDir: fixtureDir});
    glob.sync(outputDir+"/*.json").forEach(function (fileName) { fs.unlinkSync(fileName); });
    spyOn(cli, 'exit');
    spyOn(cli, 'error');
  });

  describe("argv()", function () {
    it("should run the command with the given arguments", function () {
      argv._ = ["add", "tracks", "5", "Dis Here"];
      cli.argv(argv);
      expect(cli.search({collection: "tracks"}).results).toContain({_id: "5", names:["Dis Here"]});
    });

    it("should return the usage message if command is not recognized", function () {
      spyOn(console, 'error');
      argv._ = ["node", "mrd", "nonexistent command"];
      cli.argv(argv);
      expect(cli.error).toHaveBeenCalledWith("Usage: mrd [ add | search ] ...");
    });
  });

  describe("add", function () {
    it("should create a new track when called with tracks", function () {
      var initialLength = cli.search({collection: "tracks"}).results.length;
      argv._ = ["add", "tracks", "5", "Original Faubus Fables"];
      cli.argv(argv);
      expect(cli.exit).toHaveBeenCalledWith(0);
      var tracks = cli.search({collection: "tracks"}).results;
      expect(tracks).toContain({_id: "5", names: ["Original Faubus Fables"]});
      expect(tracks.length).toBe(initialLength + 1);
    });

    it("should return ERROR if collection is invalid", function () {
      argv._ = ["add", "invalid collection name", "5", "Dat Dere"];
      cli.argv(argv);
      expect(cli.exit).toHaveBeenCalledWith(1);
    });

    it("should return ERROR if _id is a duplicate", function () {
      argv._ = ["add", "tracks", "1", "Me And Her Got A Good Thing Goin' Baby"];
      cli.argv(argv);
      expect(cli.exit).toHaveBeenCalledWith(1);
      var tracks = cli.search({collection: "tracks"}).results;
      expect(tracks).not.toContain({_id: "1", names: ["Me And Her Got A Good Thing Goin' Baby"]});
      expect(tracks).toContain({_id: "1", names: ["That's All Right"]});
    });

    it("should create a new artist when called with artists", function () {
      var initialLength = cli.search({collection: "artists"}).results.length;
      argv._ = ["add", "artists", "100", "Palace Family Steak House"];
      cli.argv(argv);
      expect(cli.exit).toHaveBeenCalledWith(0);
      var artists = cli.search({collection: "artists"}).results;
      expect(artists).toContain({_id: "100", names: ["Palace Family Steak House"]});
      expect(artists.length).toBe(initialLength + 1);
    });
  });

});
