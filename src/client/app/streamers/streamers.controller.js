/*  streamers.controller.js
 *    Handles streamers logic for the view.
 */

(function() {
  angular
    .module('app.streamers')
    .controller('StreamersController', ['dataservice', StreamersController]);

  function StreamersController(dataservice) {
    var vm = this;
    vm.streamers = [];
    vm.foundIDs = [];       // Auto-completion values.
    vm.refresh = refresh;
    vm.sort = sort;
    vm.filter = filter;     // Alias for updateStreamers(). Both use vm.filterOptions.
    vm.filterOptions = {};
    vm.add = add;           // Uses vm.toAdd.
    vm.toAdd = '';
    vm.remove = remove;
    vm.findMatchingIDs = findMatchingIDs;   // Uses vm.toAdd to get auto-completion values.

    activate();

    function refresh() {
      dataservice.refreshStreamers()
        .then(updateStreamers);
    }

    function sort(sortOption) {
      dataservice.sortStreamers(sortOption)
        .then(updateStreamers);
    }

    function filter() {
      updateStreamers();
    }

    function add() {
      dataservice.addStreamer(vm.toAdd)
        .then(updateStreamers);

      vm.toAdd = '';
    }

    function remove(name) {
      dataservice.removeStreamer(name)
        .then(updateStreamers);
    }

    function findMatchingIDs() {
      dataservice.getStreamerIDs(vm.toAdd)
        .then(function(IDs) {
          vm.foundIDs = IDs;
        })
        .catch(function(err) {
          // TODO: Handle the find IDs error.
        });
    }

    function activate() {
      dataservice.ready().then(updateStreamers);
    }

    function updateStreamers() {
      dataservice.getStreamers(vm.filterOptions)
        .then(function(streamers) {
          vm.streamers = streamers;
        })
        .catch(function(err) {
          // TODO: Handle the update streamers error.
        });
    }
  }
})();
