var data = {};

module.exports = {
  /**
  * Optionally load data from a directory other than the default.
  *
  * @method load
  * @param {String} directory Path to the JSON data files
  */
  load: function (directory) {
    try {
    data.tracks = require(directory + '/tracks.json');
    data.artists = require(directory + '/artists.json');
    data.individuals = require(directory + '/individuals.json');
    data.releases = require(directory + '/releases.json');

    data.at = require(directory + '/artist_track.json');
    data.ia = require(directory + '/individual_artist.json');
    data.it = require(directory + '/individual_track.json');
    data.tr = require(directory + '/track_release.json');
  } catch (e) {
    return false;
  }
    return true;
  }
};
