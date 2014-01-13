module.exports = function (data, collection, searchTerm) {
  var filterCallback = function (value) {
    var names = value.names;
    return names.indexOf(searchTerm) !== -1;
  };
  return data.search({collection: collection, filterCallback: filterCallback});
};