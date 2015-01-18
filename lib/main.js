// Load in dependencies
var Keyboard = require('./keyboard');
var Mouse = require('./mouse');

// Define our constructor
function GoogleMusic(win) {
  // If win was not provided, complain
  if (!win) {
    throw new Error('`win` was not provided to the `GoogleMusic` constructor');
  }

  // Localize reference to document and `that`
  var doc = win.document;
  var that = this;

  // Initialize a keyboard and mouse
  var keyboard = new Keyboard(win);
  var mouse = new Mouse(win);

  // Define mutation observer for reuse
  var MutationObserver = win.MutationObserver || win.WebKitMutationObserver;

  /* Create a volume API. */
  that.volume = {
    // A reference to the volume slider element.
    slider: doc.querySelector('#vslider'),

    // Get the current volume level.
    getVolume: function () {
      return parseInt(that.volume.slider.getAttribute('aria-valuenow'), 10);
    },

    // Set the volume level (0 - 100).
    setVolume: function (vol) {
      var current = that.volume.getVolume();

      if (vol > current) {
        that.volume.increaseVolume(vol - current);
      } else if (vol < current) {
        that.volume.decreaseVolume(current - vol);
      }
    },

    // Increase the volume by an amount (default of 1).
    increaseVolume: function (amount) {
      if (amount === undefined) {
        amount = 1;
      }

      for (var i = 0; i < amount; i++) {
        keyboard.sendKey(that.volume.slider, Keyboard.KEY_UP);
      }
    },

    // Decrease the volume by an amount (default of 1).
    decreaseVolume: function (amount) {
      if (amount === undefined) {
        amount = 1;
      }

      for (var i = 0; i < amount; i++) {
        keyboard.sendKey(that.volume.slider, Keyboard.KEY_DOWN);
      }
    }
  };

  /* Create a playback API. */
  that.playback = {
    // References to the media playback elements.
    _eplayPause: doc.querySelector('button[data-id="play-pause"]'),
    _eforward: doc.querySelector('button[data-id="forward"]'),
    _erewind: doc.querySelector('button[data-id="rewind"]'),
    _eshuffle: doc.querySelector('button[data-id="shuffle"]'),
    _erepeat: doc.querySelector('button[data-id="repeat"]'),

    // Playback modes.
    STOPPED: 0,
    PAUSED: 1,
    PLAYING: 2,

    // Repeat modes.
    LIST_REPEAT: 'LIST_REPEAT',
    SINGLE_REPEAT: 'SINGLE_REPEAT',
    NO_REPEAT: 'NO_REPEAT',

    // Shuffle modes.
    ALL_SHUFFLE: 'ALL_SHUFFLE',
    NO_SHUFFLE: 'NO_SHUFFLE',

    // Time functions.
    getPlaybackTime: function () {
      return parseInt(win.slider.getAttribute('aria-valuenow'), 10);
    },

    setPlaybackTime: function (milliseconds) {
      var percent = milliseconds / parseFloat(win.slider.getAttribute('aria-valuemax'));
      var lower = win.slider.offsetLeft + 6;
      var upper = win.slider.offsetLeft + win.slider.clientWidth - 6;
      var x = lower + percent * (upper - lower);

      mouse.clickAtLocation(win.slider, x, 0);
    },

    // Playback functions.
    playPause: function () { that.playback._eplayPause.click(); },
    forward: function () { that.playback._eforward.click(); },
    rewind: function () { that.playback._erewind.click(); },

    getShuffle: function () { return that.playback._eshuffle.value; },
    toggleShuffle: function () { that.playback._eshuffle.click(); },

    getRepeat: function () {
      return that.playback._erepeat.value;
    },

    changeRepeat: function (mode) {
      if (!mode) {
        // Toggle between repeat modes once.
        that.playback._erepeat.click();
      } else {
        // Toggle between repeat modes until the desired mode is activated.
        while (that.playback.getRepeat() !== mode) {
          that.playback._erepeat.click();
        }
      }
    },

    // Taken from the Google Play Music page.
    toggleVisualization: function () {
      win.SJBpost('toggleVisualization');
    }
  };

  /* Create a rating API. */
  that.rating = {
    // Determine whether the rating system is thumbs or stars.
    isStarsRatingSystem: function () {
      return doc.querySelector('.rating-container.stars') !== null;
    },

    // Get current rating.
    getRating: function () {
      var el = doc.querySelector('.player-rating-container li.selected');

      if (el) {
        return el.getAttribute('data-rating');
      } else {
        return 0;
      }
    },

    // Thumbs up.
    toggleThumbsUp: function () {
      var el = doc.querySelector('.player-rating-container li[data-rating="5"]');

      if (el) {
        el.click();
      }
    },

    // Thumbs down.
    toggleThumbsDown: function () {
      var el = doc.querySelector('.player-rating-container li[data-rating="1"]');

      if (el) {
        el.click();
      }
    },

    // Set a star rating.
    setStarRating: function (rating) {
      var el = doc.querySelector('.player-rating-container li[data-rating="' + rating + '"]');

      if (el) {
        el.click();
      }
    }
  };

  /* Miscellaneous functions. */
  that.extras = {
    // Get a shareable URL of the song on Google Play Music.
    getSongURL: function () {
      var albumEl = doc.querySelector('.player-album');
      var artistEl = doc.querySelector('.player-artist');

      var urlTemplate = 'https://play.google.com/music/m/';
      var url = null;

      var parseID = function (id) {
        return id.substring(0, id.indexOf('/'));
      };

      if (albumEl === null && artistEl === null) {
        return null;
      }

      var albumId = parseID(albumEl.dataset.id);
      var artistId = parseID(artistEl.dataset.id);

      if (albumId) {
        url = urlTemplate + albumId;
      } else if (artistId) {
        url = urlTemplate + artistId;
      }

      return url;
    }
  };

  var lastTitle = '';
  var lastArtist = '';
  var lastAlbum = '';

  var addObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      for (var i = 0; i < m.addedNodes.length; i++) {
        var target = m.addedNodes[i];
        var name = target.id || target.className;

        if (name === 'text-wrapper')  {
          var title = doc.querySelector('#playerSongTitle');
          var artist = doc.querySelector('#player-artist');
          var album = doc.querySelector('.player-album');
          var art = doc.querySelector('#playingAlbumArt');
          var duration = parseInt(doc.querySelector('#player #slider').getAttribute('aria-valuemax'), 10) / 1000;

          title = (title) ? title.innerText : 'Unknown';
          artist = (artist) ? artist.innerText : 'Unknown';
          album = (album) ? album.innerText : 'Unknown';
          art = (art) ? art.src : null;

          // The art may be a protocol-relative URL, so normalize it to HTTPS.
          if (art && art.slice(0, 2) === '//') {
            art = 'https:' + art;
          }

          // Make sure that this is the first of the notifications for the
          // insertion of the song information elements.
          if (lastTitle !== title || lastArtist !== artist || lastAlbum !== album) {
            win.GoogleMusicApp.notifySong(title, artist, album, art, duration);

            lastTitle = title;
            lastArtist = artist;
            lastAlbum = album;
          }
        }
      }
    });
  });

  var shuffleObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      var target = m.target;
      var id = target.dataset.id;

      if (id === 'shuffle') {
        win.GoogleMusicApp.shuffleChanged(target.value);
      }
    });
  });

  var repeatObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      var target = m.target;
      var id = target.dataset.id;

      if (id === 'repeat') {
        win.GoogleMusicApp.repeatChanged(target.value);
      }
    });
  });

  var playbackObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      var target = m.target;
      var id = target.dataset.id;

      if (id === 'play-pause') {
        var mode;
        var playing = target.classList.contains('playing');

        if (playing) {
          mode = that.playback.PLAYING;
        } else {
          // If there is a current song, then the player is paused.
          if (doc.querySelector('#playerSongInfo').childNodes.length) {
            mode = that.playback.PAUSED;
          } else {
            mode = that.playback.STOPPED;
          }
        }

        win.GoogleMusicApp.playbackChanged(mode);
      }
    });
  });

  var playbackTimeObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      var target = m.target;
      var id = target.id;

      if (id === 'slider') {
        var currentTime = parseInt(target.getAttribute('aria-valuenow'), 10);
        var totalTime = parseInt(target.getAttribute('aria-valuemax'), 10);
        win.GoogleMusicApp.playbackTimeChanged(currentTime, totalTime);
      }
    });
  });

  var ratingObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      var target = m.target;

      if (target.classList.contains('selected')) {
        win.GoogleMusicApp.ratingChanged(target.dataset.rating);
      }
    });
  });

  addObserver.observe(doc.querySelector('#playerSongInfo'), {childList: true, subtree: true});
  shuffleObserver.observe(doc.querySelector('#player button[data-id="shuffle"]'), {attributes: true});
  repeatObserver.observe(doc.querySelector('#player button[data-id="repeat"]'), {attributes: true});
  playbackObserver.observe(doc.querySelector('#player button[data-id="play-pause"]'), {attributes: true});
  playbackTimeObserver.observe(doc.querySelector('#player #slider'), {attributes: true});
  ratingObserver.observe(doc.querySelector('#player .player-rating-container'), {attributes: true, subtree: true});
}

// Export our constructor
module.exports = GoogleMusic;
