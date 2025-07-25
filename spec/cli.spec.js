/* global beforeEach describe expect it spyOn */

const fs = require('fs')
const path = require('path')

const Data = require('../lib/Data')
const cli = require('../lib/cli')

describe('cli', function () {
  const inputDir = path.join(__dirname, 'fixture', 'data')
  const outputDir = path.join(__dirname, '..', 'tmp')
  let argv

  beforeEach(function () {
    argv = { _: [], inputDir, outputDir }
    fs.rmSync(outputDir, { recursive: true, force: true })
    fs.mkdirSync(outputDir)
    spyOn(cli, 'exit')
    spyOn(cli, 'error')
    spyOn(cli, 'dir')
  })

  describe('argv()', function () {
    it('should run the command with the given arguments', function () {
      argv._ = ['add', 'tracks', 'Dis Here']
      cli.argv(argv)
      const data = new Data()
      data.read(outputDir)
      expect(data.search({ collection: 'tracks' }).results).toContain({ _id: 'Dis Here', names: ['Dis Here'] })
    })

    it('should return help file text if command is not recognized', function () {
      argv._ = ['nonexistent command']
      cli.argv(argv)
      const message = fs.readFileSync(path.join(__dirname, '..', 'doc', 'cli', 'help.txt'), 'utf8')
      expect(cli.error).toHaveBeenCalledWith(message)
    })

    it('should return error code if bad inputdir specified', function () {
      argv.inputDir = '/a/directory/that/does/not/exist'
      argv._ = ['add', 'tracks', 'Fool For The City']
      cli.argv(argv)
      expect(cli.exit).toHaveBeenCalledWith(1)
    })

    it('should not print a warning if inputdir specified', function () {
      expect(argv.inputDir).toBeTruthy()
      argv._ = ['search', 'tracks', 'My Attorney Bernie']
      cli.argv(argv)
      expect(cli.error).not.toHaveBeenCalled()
    })
  })

  describe('add', function () {
    it('should create a new track when called with tracks', function () {
      argv._ = ['add', 'tracks', 'Original Faubus Fables']
      cli.argv(argv)
      expect(cli.exit).toHaveBeenCalledWith(0)
      const data = new Data()
      data.read(outputDir)
      const tracks = data.search({ collection: 'tracks' }).results
      expect(tracks).toContain({ _id: 'Original Faubus Fables', names: ['Original Faubus Fables'] })
      expect(tracks.length).toBe(3)
    })

    it('should return ERROR if collection is invalid', function () {
      argv._ = ['add', 'invalid collection name', 'Dat Dere']
      cli.argv(argv)
      expect(cli.exit).toHaveBeenCalledWith(1)
    })

    it('should create a new artist when called with artists', function () {
      argv._ = ['add', 'artists', 'Palace Family Steak House']
      cli.argv(argv)
      expect(cli.exit).toHaveBeenCalledWith(0)
      const data = new Data()
      data.read(outputDir)
      const artists = data.search({ collection: 'artists' }).results
      expect(artists).toContain({ _id: 'Palace Family Steak House', names: ['Palace Family Steak House'] })
      expect(artists.length).toBe(2)
    })

    it('should not print a warning if outputDir specified', function () {
      argv._ = ['add', 'artists', 'Palace Family Steak House']
      cli.argv(argv)
      expect(cli.error).not.toHaveBeenCalled()
    })
  })

  describe('link', function () {
    it('should link an individual to a track', function () {
      argv._ = ['link', 'individual', '1', 'track', '1']
      cli.argv(argv)
      expect(cli.error).not.toHaveBeenCalled()
      const data = new Data()
      data.read(outputDir)
      const individualTrack = data.search({ collection: 'individual_track' }).results
      expect(individualTrack).toEqual([{ individual_id: '1', track_id: '1' }])
    })

    it('should link a track to a release', function () {
      argv._ = ['link', 'track', '1', 'release', '1']
      cli.argv(argv)
      expect(cli.error).not.toHaveBeenCalled()
      const data = new Data()
      data.read(outputDir)
      const trackRelease = data.search({ collection: 'track_release' }).results
      expect(trackRelease).toEqual([{ track_id: '1', release_id: '1' }])
    })

    it('should link a track to an artist', function () {
      argv._ = ['link', 'artist', '1', 'track', '1']
      cli.argv(argv)
      expect(cli.error).not.toHaveBeenCalled()
      const data = new Data()
      data.read(outputDir)
      const artistTrack = data.search({ collection: 'artist_track' }).results
      expect(artistTrack).toEqual([{ artist_id: '1', track_id: '1' }])
    })

    it('should allow collections to be specified in reverse order', function () {
      argv._ = ['link', 'track', '1', 'artist', '1']
      cli.argv(argv)
      expect(cli.error).not.toHaveBeenCalled()
      const data = new Data()
      data.read(outputDir)
      const artistTrack = data.search({ collection: 'artist_track' }).results
      expect(artistTrack).toEqual([{ artist_id: '1', track_id: '1' }])
    })

    it('should not print a warning if outputDir specified', function () {
      argv._ = ['link', 'artist', '1', 'track', '1']
      cli.argv(argv)
      expect(cli.error).not.toHaveBeenCalled()
    })

    it('should convert an integer _id to a string', function () {
      argv._ = ['link', 'artist', 1, 'track', 1]
      cli.argv(argv)
      expect(cli.error).not.toHaveBeenCalled()
      const data = new Data()
      data.read(outputDir)
      const artistTrack = data.search({ collection: 'artist_track' }).results
      expect(artistTrack).toEqual([{ artist_id: '1', track_id: '1' }])
    })

    it('should report an error if we try to link two collections that cannot be linked', function () {
      argv._ = ['link', 'individual', '1', 'release', '1']
      cli.argv(argv)
      expect(cli.error).toHaveBeenCalledWith('individual and release cannot be linked')
      expect(cli.exit).toHaveBeenCalledOnceWith(1)
    })
  })

  describe('search', function () {
    it('should return entries with a name that exactly matches the search term', function () {
      argv._ = ['search', 'individuals', 'Elvis Presley']
      cli.argv(argv)
      expect(cli.error).not.toHaveBeenCalled()
      expect(cli.dir).toHaveBeenCalledWith([{ _id: '1', names: ['Elvis Presley'] }])
    })

    it('should run using the default data directory if no input or output directories are specified', function () {
      delete argv.inputDir
      delete argv.outputDir
      argv._ = ['search', 'tracks', 'Fanstume [singular] 2024'] // This track should exist in the default data
      cli.argv(argv)
      expect(cli.error).not.toHaveBeenCalled()
      expect(cli.dir).toHaveBeenCalledWith([{ _id: '13483', names: ['Fanstume [singular] 2024'] }])
    })

    it('should be case insensitive', function () {
      argv._ = ['search', 'individuals', 'elvis presley']
      cli.argv(argv)
      expect(cli.error).not.toHaveBeenCalled()
      expect(cli.dir).toHaveBeenCalledWith([{ _id: '1', names: ['Elvis Presley'] }])
    })
  })
})
