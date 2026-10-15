module.exports = function (data, collection, names, metadata) {
  let entry = { names: [names] }
  if (collection === 'tracks') {
    try {
      entry = { ...JSON.parse(metadata), names: [names] }
    } catch {
      return { status: data.StatusEnum.ERROR, message: 'Tracks require JSON metadata containing artists and releases arrays' }
    }
  }
  return data.create(collection, entry)
}
