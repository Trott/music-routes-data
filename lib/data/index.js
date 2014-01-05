var fs = require("fs");

function Data(options) {
  var data = {};
  var collectionFields = {
    tracks: ["names"],
    artists: ["names"],
    individuals: ["names"],
    releases: ["names"],
    artist_track: [],
    individual_artist: [],
    individual_track: [],
    track_release: [],
  };

  var collections = [];
  for (var collection in collectionFields) {
    collections.push(collection);
    data[collection] = [];
  }

  var makeReturnValue = function (status, message) {
    return { status: status, message: message};
  };

  this.StatusEnum = Object.freeze({OK:0, ERROR:1});

  this.search = function (options) {
    var rv;
    var collection;
    var filterCallback;
    var results;

    if (typeof options === "undefined") {
      return makeReturnValue(this.StatusEnum.ERROR, "options must be specified");
    }

    collection = options.collection;

    if (typeof collection === "undefined") {
      return makeReturnValue(this.StatusEnum.ERROR, "collection is a required option.");
    }

    if (collections.indexOf(collection) === -1) {
      return makeReturnValue(this.StatusEnum.ERROR, "collection " + collection + " does not exist.");
    }

    // If no filterCallback sent, return everything
    filterCallback = options.filterCallback || function (value) { return true; };

    if (typeof filterCallback !== "function") {
      return makeReturnValue(this.StatusEnum.ERROR, "filterCallback must be a function, got " + typeof filterCallback);
    }

    results = data[collection].filter(filterCallback);

    rv = makeReturnValue(this.StatusEnum.OK, "");
    rv.results = results;
    return rv;
  };

  this.create = function (collection, entry) {
    var rv = {};
    var newEntry = {};
    var isFieldMissing = false;

    if (collections.indexOf(collection) === -1) {
        return makeReturnValue(this.StatusEnum.ERROR, "Collection does not exist: " + collection);
    }

    if (! entry._id) {
      return makeReturnValue(this.StatusEnum.ERROR, "Missing _id");
    }

    if (typeof entry._id !== "string") {
      return makeReturnValue(this.StatusEnum.ERROR, "_id must be a string, got " + typeof entry._id);
    }

    // Check if _id already exists. It should not.
    if (data[collection].filter(function (value) { return value._id === entry._id;}).length>0) {
      return makeReturnValue(this.StatusEnum.ERROR, "_id " + entry._id + " already exists");
    }

    newEntry._id = entry._id;

    collectionFields[collection].forEach(function (field) {
        if (! entry[field]) {
            isFieldMissing = true;
            return;
        }

        if (! (entry[field] instanceof Array)) {
            isFieldMissing = true;
            return;
        }

        // If some element in field array is not a string, reject the entry.
        if (entry[field].some(function (value) { return typeof value !== "string";})) {
            isFieldMissing = true;
            return;
        }

        newEntry[field] = entry[field];
    });

    if (isFieldMissing) {
      return makeReturnValue(this.StatusEnum.ERROR, "Required field is missing");
    }

    data[collection].push(newEntry);
    return makeReturnValue(this.StatusEnum.OK, "");
  };

  //TODO: read() and write() sure seem to have an awful lot of duplicate code....
  this.read = function (dataDir) {
    if (!dataDir || typeof dataDir !== "string") {
        return makeReturnValue(this.StatusEnum.ERROR, "No data directory specified");
    }

    try {
      collections.forEach(function (collection) {
        data[collection] = JSON.parse(fs.readFileSync(dataDir + "/" + collection + ".json"));
      });
    } catch (e) {
      return makeReturnValue(this.StatusEnum.ERROR, e.message || "Error occured while reading data files");
    }
    return makeReturnValue(this.StatusEnum.OK, "");
  };

  this.write = function (outputDir) {
    if (!outputDir || typeof outputDir !== "string") {
        return makeReturnValue(this.StatusEnum.ERROR, "No output directory specified");
    }

    try {
      collections.forEach(function (collection) {
        fs.writeFileSync(outputDir + "/" + collection + ".json", JSON.stringify(data[collection], null, 2));
      });
    } catch (e) {
      return makeReturnValue(this.StatusEnum.ERROR, e.message || "Error occured while writing output files");
    }
    return makeReturnValue(this.StatusEnum.OK, "");
  };
}

module.exports = Data;
