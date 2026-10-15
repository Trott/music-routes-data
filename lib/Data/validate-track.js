const assert = require('assert')

module.exports = function (track) {
  for (const field of ['artists', 'releases']) {
    const entries = track[field]
    assert.ok(Array.isArray(entries) && entries.length > 0,
      `Track ${track._id}: ${field} must be a non-empty array`)
    for (const entry of entries) {
      assert.ok(entry && Array.isArray(entry.names) && entry.names.length > 0 &&
        entry.names.every(name => typeof name === 'string' && name.trim().length > 0),
      `Track ${track._id}: each ${field} entry must have a non-empty names array of non-empty strings`)
    }
  }
}
