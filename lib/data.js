function Data(options) {
  options = options || {};
  var dataDir = options.dataDir || '../data';
  var data = {};
  data.tracks = require(dataDir + '/tracks.json');
  data.artists = require(dataDir + '/artists.json');
  data.individuals = require(dataDir + '/individuals.json');
  data.releases = require(dataDir + '/releases.json');

  data.at = require(dataDir + '/artist_track.json');
  data.ia = require(dataDir + '/individual_artist.json');
  data.it = require(dataDir + '/individual_track.json');
  data.tr = require(dataDir + '/track_release.json');

  this.getTracks = function () {
    return data.tracks;
  };

  this.createTrack = function (entry) {
    data.tracks.push(entry);
    return(entry._id);
  };
}

module.exports = Data;
