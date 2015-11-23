$(document).ready(function() {

  var url = 'https://api.twitch.tv/kraken/streams/',
      callback = '?callback=?',
      streams = ["freecodecamp", "medrybw", "storbeck", "lirik", "oshi7", "rekkles", "cohhcarnage", "esl_lol", "richard_hammer"];

  streams.forEach(function(stream) {
    var streaming, name, status, logo, channel;
    $.getJSON(url + stream + callback, function(data) {
      streaming = data.stream !== null;
      $.getJSON(data._links.channel + callback, function(channelData) {
        name = channelData.display_name;
        status = channelData.status || '';
        logo = channelData.logo;
        channel = channelData.url;


        $('ul').append('<li id="' + name + '"><a class="row" target="_blank" href="' + channel + '"><div class="column"><span>' + name + '</span><span>' + status + '</span></div></a></li>');
        if (streaming) {
          $('#' + name).addClass('online');
        }
        if (logo) {
          $('#' + name + ' a').prepend('<img src="' + logo + '">');
        } else {
          $('#' + name + ' a').prepend('<div class="placeholderLogo"></div>');
        }
      });
    });
  });

  // Display streamers based on streaming status.
  $("[type='radio']").change(function() {
    var visible = $("[type='radio']:checked").val();
    $('li').each(function() {
      filterByStreaming(this, visible);
    });
    // Reapply name filtering.
    var re = new RegExp($("[type='search']").val(), 'i');
    $('li:not(.hidden)').each(function() {
      filterByName(this, re);
    });
  });

  // On search bar input, check if streamer's name (stored in li id) matches search input.
  $("[type='search']").on('input', function() {
    var re = new RegExp($("[type='search']").val(), 'i');
    $('li').each(function() {
      filterByName(this, re);
    });
  });

  /* ------------------------------------------------
  * Helper functions.
  * ---------------------------------------------- */

  // Filter by streaming status.
  function filterByStreaming(elem, filter) {
    // Display online.
    if (filter === 'online') {
      if (!$(elem).hasClass('online') && !$(elem).hasClass('hidden')) {
        $(elem).addClass('hidden');
      } else if ($(elem).hasClass('online') && $(elem).hasClass('hidden')) {
        $(elem).removeClass('hidden');
      }
    }
    // Display offline.
    else if (filter === 'offline') {
      if ($(elem).hasClass('online') && !$(elem).hasClass('hidden')) {
        $(elem).addClass('hidden');
      } else if (!$(elem).hasClass('online') && $(elem).hasClass('hidden')) {
        $(elem).removeClass('hidden');
      }
    }
    // Display all.
    else {
      if($(elem).hasClass('hidden')) {
        $(elem).removeClass('hidden');
      }
    }
  }

  // Filter by name.
  function filterByName(elem, re) {
    var name = $(elem).attr('id');
    // If the name does not match the search input...
    if(!re.test(name)) {
      $(elem).addClass('hidden');
    }
    // Otherwise, if it does match but is hidden...
    else if($(elem).hasClass('hidden')) {
      $(elem).removeClass('hidden');
    }
  }

});
