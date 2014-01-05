// Specs are run via Grunt: grunt jasmine_node

var fs = require("fs");
var glob = require("glob");

var Cli = require("../lib/Cli.js");

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
  });

});
