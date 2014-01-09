// Specs are run via Grunt: grunt jasmine_node

var fs = require("fs");
var glob = require("glob");

var Data = require("../lib/Data");
var cli = require("../lib/cli");

describe ("cli", function () {

  var inputDir = __dirname + "/fixture/data";
  var outputDir = __dirname + "/../tmp";
  var argv;


  beforeEach(function () {
    argv = {_: [], inputDir: inputDir, outputDir: outputDir};
    glob.sync(outputDir+"/*.json").forEach(function (fileName) { fs.unlinkSync(fileName); });
    spyOn(cli, 'exit');
    spyOn(cli, 'error');
  });

  describe("argv()", function () {
    it("should run the command with the given arguments", function () {
      argv._ = ["add", "tracks", "5", "Dis Here"];
      cli.argv(argv);
      var data = new Data();
      data.read(outputDir);
      expect(data.search({collection: "tracks"}).results).toContain({_id: "5", names:["Dis Here"]});
    });

    it("should return help file text if command is not recognized", function () {
      argv._ = ["nonexistent command"];
      cli.argv(argv);
      var message = fs.readFileSync(__dirname + "/../doc/cli/help.txt", "utf8");
      expect(cli.error).toHaveBeenCalledWith(message);
    });

    it("should return error code if bad inputdir specified", function () {
        argv.inputDir = "/a/directory/that/does/not/exist";
        argv._ = ["add", "tracks", "5", "Fool For The City"];
        cli.argv(argv);
        expect(cli.exit).toHaveBeenCalledWith(1);
    });
  });

  describe("add", function () {
    it("should create a new track when called with tracks", function () {
      argv._ = ["add", "tracks", "5", "Original Faubus Fables"];
      cli.argv(argv);
      expect(cli.exit).toHaveBeenCalledWith(0);
      var data = new Data();
      data.read(outputDir);
      var tracks = data.search({collection: "tracks"}).results;
      expect(tracks).toContain({_id: "5", names: ["Original Faubus Fables"]});
      expect(tracks.length).toBe(3);
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
      var data = new Data();
      data.read(outputDir);
      var tracks = data.search({collection: "tracks"}).results;
      expect(tracks).not.toContain({_id: "1", names: ["Me And Her Got A Good Thing Goin' Baby"]});
    });

    it("should create a new artist when called with artists", function () {
      argv._ = ["add", "artists", "100", "Palace Family Steak House"];
      cli.argv(argv);
      expect(cli.exit).toHaveBeenCalledWith(0);
      var data = new Data();
      data.read(outputDir);
      var artists = data.search({collection: "artists"}).results;
      expect(artists).toContain({_id: "100", names: ["Palace Family Steak House"]});
      expect(artists.length).toBe(2);
    });
  });

});
