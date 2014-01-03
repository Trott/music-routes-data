music-routes-data
=================

Music Routes Data: What musicians played on which tracks?

[![Build Status](https://travis-ci.org/Trott/music-routes-data.png?branch=master)](https://travis-ci.org/Trott/music-routes-data)

Schema
======

Data is stored in eight JSON files in the `data` directory.

Four of the files contain basic data:

* `tracks.json` contains the `names` and unique `id` string for a track.
* `releases.json` contains the `names` and unique `id` string for a release.
* `artists.json` contains the `names` and unique `id` string for an artist.
* `individuals.json` contains the `names` and unique `id` string for an individual.

Four of the files describe relationships between the basic data and sometimes include extra data relevant to the relationship:

* `artist_track.json` contains `artistId` and `trackId` pairs where a track is attributed to an artist.
* `individual_artist.json` contains `individualId` and `artistId` pairs where an individual is a member of an artist.
* `individual_track.json` contains `individualId` and `trackId` pairs where the individual performed on the track. There is also an optional `credits` array that explains the person's role on the track (e.g., `["vocals","guitar"]`).
* `track_release.json` contains `trackId` and `releaseId` pairs where a track appears on a release.

License
=======

Music Routes Data by Rich Trott is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a>

