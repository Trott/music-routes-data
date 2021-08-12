module.exports = function (data, collection, searchTerm) {
  const filterCallback = function (value) {
    const names = value.names
    return names.indexOf(searchTerm) !== -1
  }
  return data.search({ collection: collection, filterCallback: filterCallback })
}
