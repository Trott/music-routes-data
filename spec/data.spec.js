/* global beforeEach describe expect it */

const fs = require('fs')
const path = require('path')

const Data = require('../lib/Data')

describe('data constructor', function () {
  it('should begin with no data', function () {
    const data = new Data()
    const tracks = data.search({ collection: 'tracks' }).results
    expect(tracks.length).toBe(0)
  })

  describe('read(dataDir)', function () {
    it('should read from specified directory', function () {
      const dataDir = path.join(__dirname, 'fixture', 'data')
      const data = new Data()
      data.read(dataDir)
      const tracks = data.search({ collection: 'tracks' }).results
      expect(tracks).toContain({ _id: '1', names: ["That's All Right"] })
      expect(tracks).toContain({ _id: '2', names: ['Blue Moon of Kentucky'] })
      expect(tracks.length).toBe(2)
    })

    it('should return ERROR if data directory does not exist', function () {
      const dataDir = path.join(__dirname, 'bad/path')
      const data = new Data()
      const rv = data.read(dataDir)
      expect(rv.status).toEqual(data.StatusEnum.ERROR)
    })

    it('should return ERROR if dataDir not specified', function () {
      const data = new Data()
      const rv = data.read()
      expect(rv.status).toEqual(data.StatusEnum.ERROR)
    })
  })
})

describe('data', function () {
  let data
  const fixtureDir = path.join(__dirname, 'fixture', 'data')

  beforeEach(function () {
    data = new Data()
    data.read(fixtureDir)
  })

  describe('create(collection, entry)', function () {
    it('should add a track to the track collection', function () {
      const initialLength = data.search({ collection: 'tracks' }).results.length
      data.create('tracks', { _id: '3', names: ['If I Needed Someone'] })
      const tracks = data.search({ collection: 'tracks' }).results
      expect(tracks.length).toBe(initialLength + 1)
      expect(tracks).toContain({ _id: '3', names: ['If I Needed Someone'] })
    })

    it('should return OK status code if track is added', function () {
      const rv = data.create('tracks', { _id: '3', names: ["Let's Go Away For A While"] })
      expect(rv.status).toEqual(data.StatusEnum.OK)
    })

    it('should return ERROR if _id matches another track', function () {
      const rv = data.create('tracks', { _id: '2', names: ['Someone Keeps Moving My Chair'] })
      expect(rv.status).toEqual(data.StatusEnum.ERROR)
    })

    it('should not change the tracks collection if _id matches another track', function () {
      data.create('tracks', { _id: '2', names: ['The Night They Drove Old Dixie Down'] })
      expect(data.search({ collection: 'tracks' }).results).not.toContain({ _id: '3', names: ['The Night They Drove Old Dixie Down'] })
    })

    it('should generate an _id if _id is not specified', function () {
      const rv = data.create('tracks', { names: ['Autumn Sweater'] })
      expect(data.search({ collection: 'tracks' }).results).toContain({ _id: '3', names: ['Autumn Sweater'] })
      expect(rv.status).toEqual(data.StatusEnum.OK)
    })

    it('should generate an _id string if empty string is provided', function () {
      const rv = data.create('tracks', { _id: '', names: ['Quiet Village'] })
      expect(data.search({ collection: 'tracks' }).results).toContain({ _id: '3', names: ['Quiet Village'] })
      expect(rv.status).toEqual(data.StatusEnum.OK)
    })

    it('should return ERROR and not update tracks collection if names array is not provided', function () {
      const before = data.search({ collection: 'tracks' }).results
      const rv = data.create('tracks', { _id: '3' })
      expect(rv.status).toEqual(data.StatusEnum.ERROR)
      expect(data.search({ collection: 'tracks' }).results).toEqual(before)
    })

    it('should return ERROR and not update tracks collection if names property is provided but not an array', function () {
      const before = data.search({ collection: 'tracks' }).results
      const rv = data.create('tracks', { _id: '3', names: 'The Battle Of Who Could Care Less' })
      expect(rv.status).toEqual(data.StatusEnum.ERROR)
      expect(data.search({ collection: 'tracks' }).results).toEqual(before)
    })

    it('should discard properties other than _id and names', function () {
      const rv = data.create('tracks', { _id: '3', names: ['Uh, Zoom Zip'], releases: ['Ruby Vroom'] })
      expect(rv.status).toEqual(data.StatusEnum.OK)
      expect(data.search({ collection: 'tracks' }).results).toContain({ _id: '3', names: ['Uh, Zoom Zip'] })
    })

    it('should return ERROR and not change collection if _id is not a string', function () {
      const before = data.search({ collection: 'tracks' }).results
      const rv = data.create('tracks', { _id: true, names: ["Don't Think Twice, It's Alright"] })
      expect(rv.status).toEqual(data.StatusEnum.ERROR)
      expect(data.search({ collection: 'tracks' }).results).toEqual(before)
    })

    it('should return ERROR and not change collection with a names array where one or more elements are not strings', function () {
      const before = data.search({ collection: 'tracks' }).results
      const rv = data.create('tracks', { _id: '3', names: [true, 'True'] })
      expect(rv.status).toEqual(data.StatusEnum.ERROR)
      expect(data.search({ collection: 'tracks' }).results).toEqual(before)
    })

    it('should return ERROR if collection does not exist', function () {
      const newTrack = { _id: '3', names: ["All The Things You Could Be By Now If Sigmund Freud's Wife Were Your Mother"] }
      const rv = data.create('invalid collection', newTrack)
      expect(rv.status).toEqual(data.StatusEnum.ERROR)
    })
  })

  describe('link(collection, entry)', function () {
    it('should connect two entities from different collections', function () {
      const initialLength = data.search({ collection: 'individual_track' }).results.length
      data.link('individual_track', { track_id: '1', individual_id: '1' })
      const individualTrack = data.search({ collection: 'individual_track' }).results
      expect(individualTrack.length).toBe(initialLength + 1)
      expect(individualTrack).toContain({ track_id: '1', individual_id: '1' })
    })

    it('should return ERROR if collection is not a link collection', function () {
      const rv = data.link('tracks', {})
      expect(rv.status).toEqual(data.StatusEnum.ERROR)
    })
  })

  describe('search(options)', function () {
    it('should return ERROR if called without an options argument', function () {
      expect(data.search().status).toEqual(data.StatusEnum.ERROR)
    })

    it('should return ERROR if called without a collection specified in options', function () {
      expect(data.search({}).status).toEqual(data.StatusEnum.ERROR)
    })

    it('should return ERROR if the collection does not exist', function () {
      expect(data.search({ collection: 'a bad collection name' }).status).toEqual(data.StatusEnum.ERROR)
    })

    it('should return OK and all documents in collection if no filter specified', function () {
      const rv = data.search({ collection: 'tracks' })
      expect(rv.status).toEqual(data.StatusEnum.OK)
      expect(rv.results.length).toBe(2)
    })

    it('should return a cloned array, not a reference to the internal results', function () {
      const before = data.search({ collection: 'tracks' }).results
      data.create('tracks', { _id: '3', names: ['Flesh, Blood, and Bone'] })
      expect(data.search({ collection: 'tracks' }).results).not.toEqual(before)
    })

    it('should filter using the filterCallback option', function () {
      const filterCallback = function (individual) {
        return individual.names.indexOf('Elvis Presley') !== -1
      }
      const rv = data.search({ collection: 'individuals', filterCallback })
      expect(rv.status).toEqual(data.StatusEnum.OK)
      expect(rv.results).toEqual([{ _id: '1', names: ['Elvis Presley'] }])
    })

    it('should return ERROR if filterCallback is not a function', function () {
      const rv = data.search({ collection: 'individuals', filterCallback: '*' })
      expect(rv.status).toEqual(data.StatusEnum.ERROR)
    })
  })

  describe('write(outputDir)', function () {
    let outputDir

    beforeEach(function () {
      outputDir = path.join(__dirname, '..', 'tmp')
      try {
        fs.rmSync(outputDir, { recursive: true })
      } catch (e) {
        // ignore
      }
      fs.mkdirSync(outputDir)
    })

    it('should duplicate the track collection if no changes have been made', function () {
      data.write(outputDir)
      const newData = new Data()
      newData.read(outputDir)
      expect(newData.search({ collection: 'tracks' }).results).toEqual(data.search({ collection: 'tracks' }).results)
    })

    it('should reflect a newly-created track in the output', function () {
      const newTrack = { _id: '3', names: ['Count It Higher'] }
      data.create('tracks', newTrack)
      data.write(outputDir)
      const newData = new Data()
      newData.read(outputDir)
      expect(newData.search({ collection: 'tracks' }).results).toContain(newTrack)
      const oldData = new Data()
      oldData.read(fixtureDir)
      expect(oldData.search({ collection: 'tracks' }).results).not.toContain(newTrack)
    })

    it('should return ERROR if outputDir not specified', function () {
      const rv = data.write()
      expect(rv.status).toEqual(data.StatusEnum.ERROR)
    })

    it('should return OK for routine usage', function () {
      const rv = data.write(outputDir)
      expect(rv.status).toEqual(data.StatusEnum.OK)
    })
  })
})
