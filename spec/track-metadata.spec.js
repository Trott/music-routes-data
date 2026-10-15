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
