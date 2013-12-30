var fs = require("fs");

function Data(options) {
  options = options || {};
  var dataDir = options.dataDir || __dirname + "/../data";
  var outputDir = options.outputDir || dataDir;
  var data = {};
  var collectionFields = {
    tracks: ["titles"],
    artists: ["names"],
    individuals: ["names"],
    releases: ["titles"],
    artist_track: [],
    individual_artist: [],
    individual_track: [],
    track_release: [],
  };

  var collections = [];
  for (var collection in collectionFields) {
    collections.push(collection);
  }

  collections.forEach(function (collection) {
    data[collection] = JSON.parse(fs.readFileSync(dataDir + "/" + collection + ".json"));
  });

  /**
  */
  this.find = function (collection) {
    if (typeof collection === "undefined") {
        throw new Error("A collection name is required.");
    }
    if (collections.indexOf(collection) === -1) {
        throw new Error("Collection does not exist: " + collection);
    }
    return data[collection].slice();
  };

  this.create = function (collection, entry) {
    if (collections.indexOf(collection) === -1) {
        throw new Error("Collection does not exist: " + collection);
    }

    if (! entry._id) {
      return "";
    }

    if (typeof entry._id !== "string") {
      return "";
    }

    // Check if _id already exists. It should not.
    if (data[collection].filter(function (value) { return value._id === entry._id;}).length>0) {
      return "";
    }

    if (! entry.titles) {
      return "";
    }

    if (! (entry.titles instanceof Array)) {
      return "";
    }

    // If some element in titles array is not a string, reject the entry.
    if (entry.titles.some(function (value) { return typeof value !== "string";})) {
      return "";
    }

    data[collection].push({_id: entry._id, titles: entry.titles});
    return(entry._id);
  };

  this.add = function (collection, _id, displayName) {
    var rc;
    switch (collection) {
      case "tracks":
        rc = this.create("tracks", {_id: _id, titles: [displayName]});
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
      fs.writeFileSync(outputDir + "/" + collection + ".json", JSON.stringify(data[collection], null, 2));
    });
  };
}

module.exports = Data;
