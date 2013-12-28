var fs = require('fs');

function Data(options) {
  options = options || {};
  var dataDir = options.dataDir || __dirname + '/../data';
  var outputDir = options.outputDir || dataDir;
  var data = {};
  var collections = ['tracks','artists','individuals','releases','artist_track', 'individual_artist', 'individual_track', 'track_release'];
  data.tracks = JSON.parse(fs.readFileSync(dataDir + '/tracks.json'));
  data.artists = JSON.parse(fs.readFileSync(dataDir + '/artists.json'));
  data.individuals = JSON.parse(fs.readFileSync(dataDir + '/individuals.json'));
  data.releases = JSON.parse(fs.readFileSync(dataDir + '/releases.json'));

  data.artist_track = JSON.parse(fs.readFileSync(dataDir + '/artist_track.json'));
  data.individual_artist = JSON.parse(fs.readFileSync(dataDir + '/individual_artist.json'));
  data.individual_track = JSON.parse(fs.readFileSync(dataDir + '/individual_track.json'));
  data.track_release = JSON.parse(fs.readFileSync(dataDir + '/track_release.json'));

  this.getTracks = function () {
    return data.tracks.slice();
  };

  this.createTrack = function (entry) {
    if (! entry._id) {
      return "";
    }

    if (typeof entry._id !== "string") {
      return "";
    }

    // Check if _id already exists. It should not.
    if (data.tracks.filter(function (value) { return value._id === entry._id;}).length>0) {
      return "";
    }

    if (! entry.titles) {
      return "";
    }

    if (! (entry.titles instanceof Array)) {
      return "";
    }

    // If some element in titles array is not a strings, reject the entry.
    if (entry.titles.some(function (value) { return typeof value !== "string";})) {
      return "";
    }

    data.tracks.push({_id: entry._id, titles: entry.titles});
    return(entry._id);
  };

  this.add = function (collection, _id, displayName) {
    var rc;
    switch (collection) {
      case "tracks":
        rc = this.createTrack({_id: _id, titles: [displayName]});
        break;
    }

    if (!rc) {
      //TODO: More info needed in error reporting.
      console.error("Error adding track. Hey, maybe we ought to improve the error reporting here to give more info.");
      process.exit(1);
    }

    return rc;
  };

  this.write = function () {
    collections.forEach(function (collection) {
      fs.writeFileSync(outputDir + '/' + collection + '.json', JSON.stringify(data[collection], null, 2));
    });
  };
}

module.exports = Data;
