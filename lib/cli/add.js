module.exports = function (data, collection, names) {
  return data.create(collection, { names: [names] })
}
