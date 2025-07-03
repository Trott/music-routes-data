module.exports = function (data, collection, searchTerm) {
  const filterCallback = function (value) {
    const names = value.names.map(name => name.toLowerCase())
    return names.indexOf(searchTerm.toLowerCase()) !== -1
  }
  return data.search({ collection, filterCallback })
}
