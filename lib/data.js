var fs = require('fs');

function Data(options) {
  options = options || {};
  var dataDir = options.dataDir || __dirname + '/../data';
  var data = {};
  data.tracks = JSON.parse(fs.readFileSync(dataDir + '/tracks.json'));
  data.artists = JSON.parse(fs.readFileSync(dataDir + '/artists.json'));
  data.individuals = JSON.parse(fs.readFileSync(dataDir + '/individuals.json'));
  data.releases = JSON.parse(fs.readFileSync(dataDir + '/releases.json'));

  data.at = JSON.parse(fs.readFileSync(dataDir + '/artist_track.json'));
  data.ia = JSON.parse(fs.readFileSync(dataDir + '/individual_artist.json'));
  data.it = JSON.parse(fs.readFileSync(dataDir + '/individual_track.json'));
  data.tr = JSON.parse(fs.readFileSync(dataDir + '/track_release.json'));

  this.getTracks = function () {
    return data.tracks;
  };

  this.createTrack = function (entry) {
    if (! entry._id || data.tracks.filter(function (value) { return value._id === entry._id;}).length>0) {
      return "";
    }
    data.tracks.push(entry);
    return(entry._id);
  };
}

module.exports = Data;
