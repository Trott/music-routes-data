music-routes-data
=================

Music Routes Data: What musicians played on which tracks?

Schema
======

Data is stored in JSON files in the `data` directory.

The graph has three collections:

* `tracks.json`: recordings, identified by a unique `_id` string.
* `individuals.json`: people, each with a unique `_id` string and a `names` array.
* `individual_track.json`: performance relationships with `individual_id` and
  `track_id` strings, plus an optional `credits` array (for example,
  `["vocals", "guitar"]`).

Every track has this structure:

```json
{
  "_id": "36",
  "names": ["Under Pressure"],
  "artists": [
    { "names": ["Queen"] },
    { "names": ["David Bowie"] }
  ],
  "releases": [
    { "names": ["The Best Of 1980/1987"] },
    { "names": ["80s Hits"] }
  ]
}
```

`artists` and `releases` are required arrays with at least one entry. Each entry
has a required, non-empty `names` array containing non-empty strings. Additional
names are aliases for that same artist or release; separate entries represent
separate artists or releases. These metadata objects have no IDs.

`bin/verify` validates this requirement when loading the data, in addition to
checking IDs and performance relationships. The data library also rejects invalid
track metadata on creation, reading, and writing. `npm test` runs the tests and
validates the full dataset.

Migration from version 5
========================

This is a breaking schema change. The `artists`, `releases`, `artist_track`, and
`track_release` collections have been removed, including their JSON files and
support in the data library and CLI. Artist and release names (including aliases)
are embedded directly in each associated track. Track IDs, individual IDs, and
performance relationships are unchanged.

Consumers should read `track.artists` and `track.releases` instead of joining the
removed collections. Artist and release metadata is now local to a track;
corrections affecting multiple tracks must update each occurrence. Recordings
with the same title still have distinct track IDs when they are different
performances, such as studio, demo, and live versions.

For CLI usage, see [the command help](doc/cli/help.txt). Adding a track now requires
JSON metadata containing both arrays. Adding individuals and linking people to
tracks continue to work as before.

License
=======

Music Routes Data by Rich Trott is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a>

