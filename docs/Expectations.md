# Expectations

## app.core

### dataservice
- `getStreamers(opts)`
  - Takes one argument: a filter options object.
  - Returns a promise that resolves to a filtered shallow copy of the streamers array.
- `refreshStreamers()`
  - Returns a promise that resolves when the streamers array is updated with the latest data.
- `sortStreamers(opt)`
  - Takes one argument: a sort option string or object.
  - Returns a promise that resolves when the streamers array's elements are sorted.
- `addStreamer(name)`
  - Takes one argument: a string representing a streamer's name.
  - Returns a promise that resolves when the streamer has been added.
- `removeStreamer(name)`
  - Takes one argument: a string representing a streamer's name.
  - Returns a promise that resolves when the streamer has been removed.
- `getStreamerIDs(searchPattern)`
  - Takes on argument: a string representing a search pattern.
  - Returns a promise that resolves to an array of streamerIDs ({name: String, displayName: String}) that match the searchPattern.
- `ready()`
  - Returns a promise that resolves either immediately or after the data service finishes initializing.
