/*  dataservice.js
 *    Handles all data operations.
 */

(function() {
  angular
    .module('app.core')
    .factory('dataservice', ['$http', '$q', '$cookies', '$log', dataservice]);

  function dataservice($http, $q, $cookies, $log) {
    var streamers = [];   // All tracked streamer data.
    var readyPromise;     // Resolved when the dataservice is finished initializing.

    var service = {
      getStreamers: getStreamers,         // Get a filtered shallow copy of the streamers array.
      refreshStreamers: refreshStreamers, // Refresh the streamer data in the streamers array.
      sortStreamers: sortStreamers,       // Sort the streamers array.
      addStreamer: addStreamer,           // Add a streamer to the streamers array and cookie.
      removeStreamer: removeStreamer,     // Remove a streamer from the streamers array and cookie.
      getStreamerIDs: getStreamerIDs,     // Get an array of streamerIDs that match a search pattern.
      ready: ready                        // Guarantee the data service has been initialized.
    };

    return service;

    /*  Returns a promise that resolves to a filtered shallow copy of the streamers array.
     *    filterOptions: {name: String, state: String}
     *    If defined, filterOptions.state may be 'online' or 'offline'.
     */
    function getStreamers(filterOptions) {
      return $q(function(resolve, reject) {
        // Create a shallow copy of the streamers array.
        var copy = streamers.slice(0);

        // Filter the copy.
        if (filterOptions) {
          if (filterOptions.state) {
            // Check that the streamer's online state matches the filter state.
            copy = copy.filter(function(streamer) {
              return (streamer.online === (filterOptions.state === 'online'));
            });
          }

          if (filterOptions.name) {
            // Check for a loose match with either the streamer's name or display name.
            var re = new RegExp(filterOptions.name, 'i');
            copy = copy.filter(function(streamer) {
              return (re.test(streamer.name) || re.test(streamer.displayName));
            });
          }
        }

        // Resolve with the copy.
        resolve(copy);
      });
    }

    /* Returns a promise that resolves when the streamers array is updated with the latest data. */
    function refreshStreamers() {
      return $q(function(resolve, reject) {
        var promises = [];

        streamers.forEach(function(streamer) {
          promises.push(addStreamer(streamer.name));
        });

        resolve($q.all(promises));
      });
    }

    /*  Returns a promise that resolves when the streamers array's elements are sorted.
     *    Possible sort options:
     *      'name:asc', 'name:desc'
     *      'online:true', 'online:false'
     *      {name: 'bob', newIndex: 3}
     */
    function sortStreamers(sortOption) {
      return $q(function(resolve, reject) {
        if (sortOption) {
          if (sortOption.name) {
            // Move the named streamer to the new index.

            // Find the named streamer's index position in streamers array.
            var i = streamers.map(function(streamer) {
              return streamer.name;
            }).indexOf(sortOption.name);

            // If the named streamer exists...
            if (i !== -1) {
              // Remove the named streamer from the streamers array.
              var removed = streamers.splice(i, 1)[0];

              // Add the named streamer back into the streamers array at the desired position.
              streamers.splice(sortOption.newIndex, 0, removed);
            }
          } else if (sortOption.split(':')[0] === 'name') {
            // Sort alphabetically.
            switch (sortOption.split(':')[1]) {
              case 'asc':
                // Sort alphabetically ascending (A-Z).
                streamers.sort(function(a, b) {
                  a = a.displayName.toLowerCase();
                  b = b.displayName.toLowerCase();

                  if (a < b) {
                    return -1;
                  } else if (a > b) {
                    return 1;
                  } else {
                    return 0;
                  }
                });
                break;
              case 'desc':
                // Sort alphabetically descending (Z-A).
                streamers.sort(function(a,b) {
                  a = a.displayName.toLowerCase();
                  b = b.displayName.toLowerCase();

                  if (a < b) {
                    return 1;
                  } else if (a > b) {
                    return -1;
                  } else {
                    return 0;
                  }
                });
            }
          } else if (sortOption.split(':')[0] === 'online') {
            // Sort by online state.
            switch (sortOption.split(':')[1]) {
              case 'true':
                // Sort online first (online-offline).
                streamers.sort(function(a, b) {
                  if (a.online === b.online) {
                    // Both are either online or offline.
                    return 0;
                  } else if (a.online) {
                    // a is online, which means b must be offline.
                    return -1;
                  } else {
                    // a is offline, which means b must be online.
                    return 1;
                  }
                });
                break;
              case 'false':
                // Sort offline first (offline-online).
                streamers.sort(function(a, b) {
                  if (a.online === b.online) {
                    // Both are either online or offline.
                    return 0;
                  } else if (a.online) {
                    // a is online, which means b must be offline.
                    return 1;
                  } else {
                    // a is offline, which means b must be online.
                    return -1;
                  }
                });
              }
          }
        }

        resolve('Streamers sorted.');
      });
    }

    /* Returns a promise that resolves when the streamer has been added. */
    function addStreamer(name) {
      return getStreamer(name)
        .then(trackStreamer)
        .catch(function(err) {
          $log.warn('Failed to add streamer: ' + name + '.', err);
        });
    }

    /* Returns a promise that resolves when the streamer has been removed. */
    function removeStreamer(name) {
      return untrackStreamer(name)
        .catch(function(err) {
          $log.warn('Failed to remove streamer: ' + name + '.', err);
        });
    }

    /* Returns a promise that resolves to an array of streamerIDs ({name: String, displayName: String}) that match the searchPattern. */
    function getStreamerIDs(searchPattern) {
      return $http.jsonp('https://api.twitch.tv/kraken/search/channels?q=' + searchPattern + '&callback=JSON_CALLBACK')
        .then(formatResults)
        .catch(function(err) {
          $log.warn('Failed to get streamer IDs.', err);
        });

      function formatResults(results) {
        return $q(function(resolve, reject) {
          var streamerIDs = [];
          var maxIDs = 5;

          results = results.data.channels;

          if (results) {
            for (var i = 0; i < maxIDs; i++) {
              // If there are less than i results, we're done.
              if (!results[i]) {
                break;
              }

              var streamerID = {};
              streamerID.name = results[i].name;
              streamerID.displayName = results[i].display_name;

              streamerIDs.push(streamerID);
            }
          }

          resolve(streamerIDs);
        });
      }
    }

    /* Returns a promise that resolves either immediately or after the data service finishes initializing. */
    function ready() {
      var promise = readyPromise || initialize();
      return promise;
    }

    /* Sets the readyPromise after completing necessary initialization operations. */
    function initialize() {
      // Ensure that this is only called once.
      if (readyPromise) {
        return readyPromise;
      }

      // Get the promises needed to complete initialization.
      return promisesToComplete()
        // Wait for those promises to finish.
        .then(function(promises) {
          return $q.all(promises);
        })
        // Return the ready promise.
        .then(function() {
          readyPromise = $q.when(true);
          return readyPromise;
        })
        .catch(function(err) {
          $log.warn('Failed to initialize data service.', err);
        });

      function promisesToComplete() {
        return $q(function(resolve, reject) {
          var tracked = $cookies.get('trackedStreamers');
          var promises = [];

          if (!tracked) {
            // There is no record of tracked streamers for this user. (Either no cookie, or an empty cookie.)
            // Use some of the current most popular streamers.
            $http.jsonp('https://api.twitch.tv/kraken/streams/' + '?callback=JSON_CALLBACK')
              .then(function(res) {
                var topStreamers = [
                  res.data.streams[0].channel.name,
                  res.data.streams[1].channel.name,
                  res.data.streams[2].channel.name,
                  res.data.streams[3].channel.name,
                  res.data.streams[4].channel.name
                ];

                // Add each of the top streamers.
                topStreamers.forEach(function(name) {
                  promises.push(addStreamer(name));
                });

                resolve(promises);
              })
              .catch(function(err) {
                reject(err);
              });
          } else {
            // Add each of the tracked streamers.
            tracked.split(',').forEach(function(name) {
              promises.push(addStreamer(name));
            });

            resolve(promises);
          }
        });
      }
    }

    /* Returns a promise that resolves to a streamer once the streamer's data has been retrieved and formatted. */
    function getStreamer(name) {
      return getStreamerData()
        .then(formatStreamerData)
        .catch(function(err) {
          $log.warn('Failed to get streamer: ' + name + '.', err);
        });

      function getStreamerData() {
        return $q(function(resolve, reject) {
          var data = {};

          $http.jsonp('https://api.twitch.tv/kraken/streams/' + name + '?callback=JSON_CALLBACK')
            .then(function(res) {
              data.basic = res;
              return $http.jsonp(res.data._links.channel + '?callback=JSON_CALLBACK');
            })
            .then(function(res) {
              data.channel = res;
              return $http.jsonp(res.data._links.videos + '?callback=JSON_CALLBACK');
            })
            .then(function(res) {
              data.videos = res;
              resolve(data);
            })
            .catch(function(err) {
              reject(err);
            });
        });
      }

      function formatStreamerData(data) {
        return $q(function(resolve, reject) {
          var streamer = {};

          if (data) {
            var basicData = data.basic;
            var channelData = data.channel;
            var videosData = data.videos;

            streamer.name = name;  // Unique identifier.
            streamer.online = (basicData.data.stream !== null);

            if (streamer.online) {
              // Stream data.
              streamer.stream = {};
              streamer.stream.game = basicData.data.stream.game;
              streamer.stream.viewers = basicData.data.stream.viewers;
              streamer.stream.preview = basicData.data.stream.preview.large;  // 640x360 .jpg image.
            }

            // Channel data.
            streamer.displayName = channelData.data.display_name;
            streamer.logo = channelData.data.logo;
            streamer.status = channelData.data.status;
            streamer.url = channelData.data.url;
            streamer.videoBanner = channelData.data.video_banner;  // .jpg image, usually 1920x1080 though we only need 640x360 to match the stream.preview image.

            // Video data.
            streamer.videos = [];

            videosData.data.videos.forEach(function(video) {
              streamer.videos.push({
                title: video.title,
                description: video.description,
                date: video.recorded_at,
                duration: video.length,  // Video duration in seconds.
                preview: video.preview,  // 320x240 .jpg image.
                url: video.url
              });
            });
          }

          resolve(streamer);
        });
      }
    }

    /* Returns a promise that resolves when the streamer is tracked. */
    function trackStreamer(streamer) {
      return cache()
        .then(remember)
        .catch(function(err) {
          $log.warn('Failed to track a streamer.', err);
        });

      function cache() {
        return $q(function(resolve, reject) {
          if (!streamer || !streamer.name) {
            reject('Attempting to cache data on an unknown streamer.');
          } else {
            // Cache the streamer's data.
            var i = streamers.map(function(existingStreamer) {
              return existingStreamer.name;
            }).indexOf(streamer.name);

            if (i !== -1) {
              // Replace the existing cached data.
              streamers[i] = streamer;
            } else {
              // Cache the data in the beginning of the streamers array.
              streamers.unshift(streamer);
            }

            resolve('Streamer data cached.');
          }
        });
      }

      function remember(){
        return $q(function(resolve, reject) {
          if (!streamer || !streamer.name) {
            reject('Attempting to remember an unknown streamer.');
          } else {
            // Add the streamer's name to the cookie.
            var tracked = $cookies.get('trackedStreamers');

            if (!tracked) {
              // The cookie doesn't exist or is empty.
              $cookies.put('trackedStreamers', streamer.name);
            } else {
              // Only add the name if it doesn't already exist.
              var exists = tracked.split(',').indexOf(streamer.name) !== -1;
              if (!exists) {
                tracked = streamer.name + ',' + tracked;
                $cookies.put('trackedStreamers', tracked);
              }
            }

            resolve('Streamer remembered.');
          }
        });
      }
    }

    /* Returns a promise that resolves when the streamer is untracked. */
    function untrackStreamer(name) {
      return uncache()
        .then(forget)
        .catch(function(err) {
          $log.warn('Failed to untrack a streamer.', err);
        });

      function uncache() {
        return $q(function(resolve, reject) {
          if (!name) {
            reject('Attempting to uncache data on an unknown streamer.');
          } else {
            // Handle the case where untrackStreamer is passed a streamer object instead of name.
            if (name.name) {
              name = name.name;
            }

            // Uncache the streamer's data.
            streamers = streamers.filter(function(streamer) {
              return streamer.name !== name;
            });

            resolve('Streamer data uncached.');
          }
        });
      }

      function forget() {
        return $q(function(resolve, reject) {
          if (!name) {
            reject('Attempting to forget an unknown streamer.');
          } else {
            // Remove the streamer's name from the cookie.
            var tracked = $cookies.get('trackedStreamers');

            if (tracked) {
              tracked = tracked.split(',')
                .filter(function(existingName) {
                  return existingName !== name;
                })
                .join(',');

              $cookies.put('trackedStreamers', tracked);
            }

            resolve('Streamer forgotten.');
          }
        });
      }
    }
  }
})();
