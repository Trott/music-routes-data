const fs = require('fs')

function Data (options) {
  const data = {}
  const collectionFields = {
    tracks: ['names'],
    artists: ['names'],
    individuals: ['names'],
    releases: ['names']
  }

  const linkCollectionFields = {
    artist_track: [],
    individual_artist: [],
    individual_track: [],
    track_release: []
  }

  this.dataCollections = Object.freeze(Object.keys(collectionFields))
  this.linkCollections = Object.freeze(Object.keys(linkCollectionFields))

  const collections = this.dataCollections.concat(this.linkCollections)
  collections.forEach(function (value) {
    data[value] = []
  })

  const makeReturnValue = function (status, message) {
    return { status, message }
  }

  this.StatusEnum = Object.freeze({ OK: 0, ERROR: 1 })

  this.search = function (options) {
    if (typeof options === 'undefined') {
      return makeReturnValue(this.StatusEnum.ERROR, 'options must be specified')
    }

    const collection = options.collection

    if (typeof collection === 'undefined') {
      return makeReturnValue(this.StatusEnum.ERROR, 'collection is a required option.')
    }

    if (collections.indexOf(collection) === -1) {
      return makeReturnValue(this.StatusEnum.ERROR, 'collection ' + collection + ' does not exist.')
    }

    // If no filterCallback sent, return everything
    const filterCallback = options.filterCallback || function (value) { return true }

    if (typeof filterCallback !== 'function') {
      return makeReturnValue(this.StatusEnum.ERROR, 'filterCallback must be a function, got ' + typeof filterCallback)
    }

    const results = data[collection].filter(filterCallback)

    const rv = makeReturnValue(this.StatusEnum.OK, '')
    rv.results = results
    return rv
  }

  this.create = function (collection, entry) {
    const newEntry = {}
    let isFieldMissing = false

    if (this.dataCollections.indexOf(collection) === -1) {
      return makeReturnValue(this.StatusEnum.ERROR, 'Collection does not exist: ' + collection)
    }

    if (!entry._id) {
      return makeReturnValue(this.StatusEnum.ERROR, 'Missing _id')
    }

    if (typeof entry._id !== 'string') {
      return makeReturnValue(this.StatusEnum.ERROR, '_id must be a string, got ' + typeof entry._id)
    }

    // Check if _id already exists. It should not.
    if (data[collection].filter(function (value) { return value._id === entry._id }).length > 0) {
      return makeReturnValue(this.StatusEnum.ERROR, '_id ' + entry._id + ' already exists')
    }

    newEntry._id = entry._id

    collectionFields[collection].forEach(function (field) {
      if (!entry[field]) {
        isFieldMissing = true
        return
      }

      if (!(entry[field] instanceof Array)) {
        isFieldMissing = true
        return
      }

      // If some element in field array is not a string, reject the entry.
      if (entry[field].some(function (value) { return typeof value !== 'string' })) {
        isFieldMissing = true
        return
      }

      newEntry[field] = entry[field]
    })

    if (isFieldMissing) {
      return makeReturnValue(this.StatusEnum.ERROR, 'Required field is missing')
    }

    data[collection].push(newEntry)
    return makeReturnValue(this.StatusEnum.OK, '')
  }

  this.link = function (collection, entry) {
    // TODO: error checking for linkage that already exists
    // TODO: how to handle credits? separate command? handle it here? I guess real challenge is handling from the command line.
    if (this.linkCollections.indexOf(collection) === -1) {
      return makeReturnValue(this.StatusEnum.ERROR, 'Invalid link collection specified')
    }
    data[collection].push(entry)
    return makeReturnValue(this.StatusEnum.OK, '')
  }

  const fsOp = function (dir, callback) {
    if (!dir || typeof dir !== 'string') {
      return makeReturnValue(this.StatusEnum.ERROR, 'No directory specified')
    }

    try {
      collections.forEach(callback)
    } catch (e) {
      return makeReturnValue(this.StatusEnum.ERROR, e.message || 'Unknown error')
    }
    return makeReturnValue(this.StatusEnum.OK, '')
  }

  this.read = function (dir) {
    return fsOp.call(this, dir, function (collection) {
      data[collection] = JSON.parse(fs.readFileSync(dir + '/' + collection + '.json'))
    })
  }

  this.write = function (dir) {
    return fsOp.call(this, dir, function (collection) {
      fs.writeFileSync(dir + '/' + collection + '.json', JSON.stringify(data[collection], null, 2))
    })
  }
}

module.exports = Data
