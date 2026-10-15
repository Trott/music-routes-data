/* global describe it expect */

const fs = require('fs')
const os = require('os')
const path = require('path')
const Data = require('../lib/Data')
const validateTrack = require('../lib/Data/validate-track')

const track = () => ({
  _id: 'test',
  names: ['Test'],
  artists: [{ names: ['Artist', 'Alias'] }, { names: ['Collaborator'] }],
  releases: [{ names: ['Album'] }, { names: ['Compilation', 'Alternate title'] }]
})

describe('track metadata', function () {
  for (const field of ['artists', 'releases']) {
    for (const names of [new Array(1), ['Valid'].concat(new Array(1), ['Alias'])]) {
      it(`rejects sparse ${field} names of length ${names.length} on creation`, function () {
        const data = new Data()
        const entry = { ...track(), [field]: [{ names }] }
        expect(() => validateTrack(entry)).toThrowError(new RegExp(field))
        expect(data.create('tracks', entry).status).toBe(data.StatusEnum.ERROR)
        expect(data.search({ collection: 'tracks' }).results).toEqual([])
      })
    }

    it(`rejects a deleted ${field} name without overwriting valid saved data`, function () {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'music-routes-sparse-'))
      try {
        const data = new Data()
        expect(data.create('tracks', track()).status).toBe(data.StatusEnum.OK)
        expect(data.write(dir).status).toBe(data.StatusEnum.OK)
        const saved = fs.readFileSync(path.join(dir, 'tracks.json'), 'utf8')
        delete data.search({ collection: 'tracks' }).results[0][field][0].names[0]
        expect(data.write(dir).status).toBe(data.StatusEnum.ERROR)
        expect(fs.readFileSync(path.join(dir, 'tracks.json'), 'utf8')).toBe(saved)
        const loaded = new Data()
        expect(loaded.read(dir).status).toBe(loaded.StatusEnum.OK)
        expect(loaded.search({ collection: 'tracks' }).results).toEqual([track()])
      } finally {
        fs.rmSync(dir, { recursive: true, force: true })
      }
    })

    for (const value of [undefined, null, 'name', {}, [], [null], ['name'], [{}],
      [{ names: 'name' }], [{ names: [] }], [{ names: [42] }], [{ names: [''] }],
      [{ names: ['   '] }], [{ names: ['Valid', false] }]]) {
      it(`rejects ${field} = ${JSON.stringify(value)} without adding the track`, function () {
        const data = new Data()
        const entry = { ...track(), [field]: value }
        expect(() => validateTrack(entry)).toThrowError(new RegExp(field))
        expect(data.create('tracks', entry).status).toBe(data.StatusEnum.ERROR)
        expect(data.search({ collection: 'tracks' }).results).toEqual([])
      })
    }
  }

  it('preserves multiple artists, releases, and aliases through creation and file round trips', function () {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'music-routes-metadata-'))
    try {
      const data = new Data()
      expect(data.create('tracks', track()).status).toBe(data.StatusEnum.OK)
      expect(data.write(dir).status).toBe(data.StatusEnum.OK)
      expect(fs.readdirSync(dir).sort()).toEqual(['individual_track.json', 'individuals.json', 'tracks.json'])
      const loaded = new Data()
      expect(loaded.read(dir).status).toBe(loaded.StatusEnum.OK)
      expect(loaded.search({ collection: 'tracks' }).results).toEqual([track()])
      // Direct JSON edits must be rejected on load, as used by bin/verify.
      fs.writeFileSync(path.join(dir, 'tracks.json'), JSON.stringify([{ ...track(), artists: [] }]))
      expect(new Data().read(dir).status).toBe(data.StatusEnum.ERROR)
      // Mutating a returned entry must not allow invalid metadata to be saved.
      loaded.search({ collection: 'tracks' }).results[0].releases = []
      expect(loaded.write(dir).status).toBe(data.StatusEnum.ERROR)
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })

  it('returns an error rather than throwing when a new entry has neither an ID nor names', function () {
    const data = new Data()
    expect(data.create('tracks', {}).status).toBe(data.StatusEnum.ERROR)
  })
})
