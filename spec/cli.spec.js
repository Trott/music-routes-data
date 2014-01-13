// Specs are run via Grunt: grunt jasmine_node

var fs = require("fs");
var glob = require("glob");
var path = require("path");

var Data = require(path.join("..", "lib", "Data"));
var cli = require(path.join("..", "lib", "cli"));

describe ("cli", function () {

  var inputDir = path.join(__dirname, "fixture/data");
  var outputDir = path.join(__dirname, "..", "tmp");
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
      var message = fs.readFileSync(path.join(__dirname, "..", "doc/cli/help.txt"), "utf8");
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

  describe("link", function () {
    it("should link an individual to a track", function () {
      argv._ = ["link", "individual", "1", "track", "1"];
      cli.argv(argv);
      expect(cli.error).not.toHaveBeenCalled();
      var data = new Data();
      data.read(outputDir);
      var individual_track = data.search({collection: "individual_track"}).results;
      expect(individual_track).toEqual([{individual_id: "1", track_id: "1"}]);
    });

    it("should link a track to a release", function () {
      argv._ = ["link", "track", "1", "release", "1"];
      cli.argv(argv);
      expect(cli.error).not.toHaveBeenCalled();
      var data = new Data();
      data.read(outputDir);
      var track_release = data.search({collection: "track_release"}).results;
      expect(track_release).toEqual([{track_id: "1", release_id: "1"}]);
    });

    it("should link a track to an artist", function () {
      argv._ = ["link", "artist", "1", "track", "1"];
      cli.argv(argv);
      expect(cli.error).not.toHaveBeenCalled();
      var data = new Data();
      data.read(outputDir);
      var artist_track = data.search({collection: "artist_track"}).results;
      expect(artist_track).toEqual([{artist_id: "1", track_id: "1"}]);
    });

    it("should allow collections to be specified in reverse order", function () {
      argv._ = ["link", "track", "1", "artist", "1"];
      cli.argv(argv);
      expect(cli.error).not.toHaveBeenCalled();
      var data = new Data();
      data.read(outputDir);
      var artist_track = data.search({collection: "artist_track"}).results;
      expect(artist_track).toEqual([{artist_id: "1", track_id: "1"}]);
    });

    it("should link an individual to an artist", function () {
      argv._ = ["link", "individual", "1", "artist", "1"];
      cli.argv(argv);
      expect(cli.error).not.toHaveBeenCalled();
      var data = new Data();
      data.read(outputDir);
      var individual_artist = data.search({collection: "individual_artist"}).results;
      expect(individual_artist).toEqual([{individual_id: "1", artist_id: "1"}]);
    });
  });

});
