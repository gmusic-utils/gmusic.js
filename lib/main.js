// Load in dependencies
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var Keyboard = require('./keyboard');
var Mouse = require('./mouse');

// Define selector constants
var SELECTORS = {
  info: {
    containerId: 'playerSongInfo',
    titleId: 'player-song-title'
  },
  forward: {
    buttonSelector: '#player sj-icon-button[data-id="forward"]'
  },
  playPause: {
    buttonSelector: '#player sj-icon-button[data-id="play-pause"]',
    dataId: 'play-pause',
    playingClass: 'playing'
  },
  rating: {
    // DEV: `.player-rating-container` doesn't exist until a song is playing
    containerSelector: '#playerSongInfo',
    thumbsSelector: '#player .player-rating-container [icon^="sj:thumb-"][data-rating]',
    thumbsUpSelector: '#player .player-rating-container [icon^="sj:thumb-"][data-rating="5"]',
    thumbsDownSelector: '#player .player-rating-container [icon^="sj:thumb-"][data-rating="1"]',
    thumbSelectorFormat: '#player .player-rating-container [icon^="sj:thumb-"][data-rating="{rating}"]'
  },
  repeat: {
    dataId: 'repeat',
    buttonSelector: '#player sj-icon-button[data-id="repeat"]'
  },
  rewind: {
    buttonSelector: '#player sj-icon-button[data-id="rewind"]'
  },
  shuffle: {
    dataId: 'shuffle',
    buttonSelector: '#player sj-icon-button[data-id="shuffle"]'
  },
  slider: {
    id: 'material-player-progress'
  }
};

// Define bind method
function bind(context, fn) {
  return function bindFn () {
    return fn.apply(context, arguments);
  };
}

// Define our constructor
function GoogleMusic(win) {
  // If win was not provided, complain
  if (!win) {
    throw new Error('`win` was not provided to the `GoogleMusic` constructor');
  }

  // Inherit from EventEmitter
  EventEmitter.call(this);

  // Localize reference to window and document
  this.win = win;
  this.doc = win.document;

  // Initialize a keyboard and mouse
  this.keyboard = new Keyboard(win);
  this.mouse = new Mouse(win);

  // For each of the prototype sections
  var proto = GoogleMusic._protoObj;
  for (var protoKey in proto) {
    if (proto.hasOwnProperty(protoKey)) {
      // Define a key on our object
      this[protoKey] = {};

      // For each of the keys on the section, define a function that invokes on this original context
      var section = proto[protoKey];
      for (var sectionKey in section) {
        if (section.hasOwnProperty(sectionKey)) {
          this[protoKey][sectionKey] = bind(this, section[sectionKey]);
        }
      }

      // If there was an `init` method, run it
      if (this[protoKey].init) {
        this[protoKey].init();
      }
    }
  }
}
// Inherit from EventEmitter normally
inherits(GoogleMusic, EventEmitter);

// Define a "prototype" that will have magical invocation
var proto = GoogleMusic._protoObj = {};

// Create a volume API
proto.volume = {
  // Query required elements
  init: function () {
    this.volume._sliderEl = this.doc.querySelector('#vslider');
  },

  // Get the current volume level.
  getVolume: function () {
    return parseInt(this.volume._sliderEl.getAttribute('aria-valuenow'), 10);
  },

  // Set the volume level (0 - 100).
  setVolume: function (vol) {
    var current = this.volume.getVolume();

    if (vol > current) {
      this.volume.increaseVolume(vol - current);
    } else if (vol < current) {
      this.volume.decreaseVolume(current - vol);
    }
  },

  // Increase the volume by an amount (default of 1)
  increaseVolume: function (amount) {
    if (amount === undefined) {
      amount = 1;
    }

    for (var i = 0; i < amount; i++) {
      this.keyboard.sendKey(this.volume._sliderEl, Keyboard.KEY_UP);
    }
  },

  // Decrease the volume by an amount (default of 1)
  decreaseVolume: function (amount) {
    if (amount === undefined) {
      amount = 1;
    }

    for (var i = 0; i < amount; i++) {
      this.keyboard.sendKey(this.volume._sliderEl, Keyboard.KEY_DOWN);
    }
  }
};

// Create a playback API and constants
GoogleMusic.Playback = {
  // Playback states
  STOPPED: 0,
  PAUSED: 1,
  PLAYING: 2,

  // Repeat modes
  LIST_REPEAT: 'LIST_REPEAT',
  SINGLE_REPEAT: 'SINGLE_REPEAT',
  NO_REPEAT: 'NO_REPEAT',

  // Shuffle modes
  ALL_SHUFFLE: 'ALL_SHUFFLE',
  NO_SHUFFLE: 'NO_SHUFFLE'
};
proto.playback = {
  // Query references to the media playback elements
  init: function () {
    this.playback._sliderEl = this.doc.getElementById(SELECTORS.slider.id);
    this.playback._playPauseEl = this.doc.querySelector(SELECTORS.playPause.buttonSelector);
    this.playback._forwardEl = this.doc.querySelector(SELECTORS.forward.buttonSelector);
    this.playback._rewindEl = this.doc.querySelector(SELECTORS.rewind.buttonSelector);
    this.playback._shuffleEl = this.doc.querySelector(SELECTORS.shuffle.buttonSelector);
    this.playback._repeatEl = this.doc.querySelector(SELECTORS.repeat.buttonSelector);
  },

  // Time functions
  getPlaybackTime: function () {
    return parseInt(this.playback._sliderEl.getAttribute('aria-valuenow'), 10);
  },

  setPlaybackTime: function (milliseconds) {
    var percent = milliseconds / parseFloat(this.playback._sliderEl.getAttribute('aria-valuemax'), 10);
    var lower = this.playback._sliderEl.offsetLeft + 6;
    var upper = this.playback._sliderEl.offsetLeft + this.playback._sliderEl.clientWidth - 6;
    var x = lower + percent * (upper - lower);

    this.mouse.clickAtLocation(this.playback._sliderEl, x, 0);
  },

  // Playback functions
  playPause: function () { this.playback._playPauseEl.click(); },
  forward: function () { this.playback._forwardEl.click(); },
  rewind: function () { this.playback._rewindEl.click(); },

  getShuffle: function () { return this.playback._shuffleEl.getAttribute('value'); },
  toggleShuffle: function () { this.playback._shuffleEl.click(); },

  getRepeat: function () {
    return this.playback._repeatEl.getAttribute('value');
  },

  toggleRepeat: function (mode) {
    if (!mode) {
      // Toggle between repeat modes once
      this.playback._repeatEl.click();
    } else {
      // Toggle between repeat modes until the desired mode is activated
      while (this.playback.getRepeat() !== mode) {
        this.playback._repeatEl.click();
      }
    }
  },

  // Taken from the Google Play Music page
  toggleVisualization: function () {
    this.win.SJBpost('toggleVisualization');
  }
};

// Create a rating API
proto.rating = {
  // Determine if a thumb is selected or not
  _isElSelected: function (el) {
    // If the target is not outlined in its shadow DOM, then it's selected
    // jscs:disable maximumLineLength
    // DEV: Access shadow DOM via `$`
    //   Selected thumbs up:
    //   <core-icon relative="" id="icon" src="{{src}}" icon="{{icon}}" aria-label="thumb-up" role="img"></core-icon>
    //   Unselected thumbs down:
    //   <core-icon relative="" id="icon" src="{{src}}" icon="{{icon}}" aria-label="thumb-down-outline" role="img"></core-icon>
    // jscs:enable maximumLineLength
    // DEV: We can receive the container element by accident and need to make sure this isn't it
    if (el && el.$ && el.$.icon) {
      return el.$.icon.getAttribute('aria-label').indexOf('-outline') === -1;
    } else {
      return false;
    }
  },
  // Get current rating
  getRating: function () {
    var thumbEls = this.doc.querySelectorAll(SELECTORS.rating.thumbsSelector);
    var i = 0;
    var len = thumbEls.length;
    for (; i < len; i++) {
      var el = thumbEls[i];
      if (this.rating._isElSelected(el)) {
        return el.dataset.rating;
      }
    }
    return '0';
  },

  // Thumbs up
  toggleThumbsUp: function () {
    var el = this.doc.querySelector(SELECTORS.rating.thumbsUpSelector);

    if (el) {
      el.click();
    }
  },

  // Thumbs down
  toggleThumbsDown: function () {
    var el = this.doc.querySelector(SELECTORS.rating.thumbsDownSelector);

    if (el) {
      el.click();
    }
  },

  // Set a rating
  setRating: function (rating) {
    var selector = SELECTORS.rating.thumbSelectorFormat.replace('{rating}', rating);
    var el = this.doc.querySelector(selector);

    if (el && !this.rating._isElSelected(el)) {
      el.click();
    }
  }
};

// Miscellaneous functions
proto.extras = {
  // Get a shareable URL of the song on Google Play Music
  getSongURL: function () {
    var albumEl = this.doc.querySelector('.player-album');
    var artistEl = this.doc.querySelector('.player-artist');

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

proto.hooks = {
  init: function () {
    // Save context for bindings
    var that = this;

    // Define mutation observer for reuse
    var MutationObserver = this.win.MutationObserver || this.win.WebKitMutationObserver;

    var lastTitle = '';
    var lastArtist = '';
    var lastAlbum = '';

    var addObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        for (var i = 0; i < m.addedNodes.length; i++) {
          var target = m.addedNodes[i];
          var name = target.id || target.className;

          if (name === 'text-wrapper')  {
            var title = that.doc.querySelector('#playerSongTitle');
            var artist = that.doc.querySelector('#player-artist');
            var album = that.doc.querySelector('.player-album');
            var art = that.doc.querySelector('#playingAlbumArt');
            var duration = parseInt(that.doc.getElementById(SELECTORS.slider.id).getAttribute('aria-valuemax'), 10);

            title = (title) ? title.innerText : 'Unknown';
            artist = (artist) ? artist.innerText : 'Unknown';
            album = (album) ? album.innerText : 'Unknown';
            art = (art) ? art.src : null;

            // The art may be a protocol-relative URL, so normalize it to HTTPS
            if (art && art.slice(0, 2) === '//') {
              art = 'https:' + art;
            }

            // Make sure that this is the first of the notifications for the
            // insertion of the song information elements.
            if (lastTitle !== title || lastArtist !== artist || lastAlbum !== album) {
              that.emit('change:song', {
                title: title,
                artist: artist,
                album: album,
                art: art,
                duration: duration
              });

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

        if (id === SELECTORS.shuffle.dataId) {
          that.emit('change:shuffle', target.value);
        }
      });
    });

    var repeatObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        var target = m.target;
        var id = target.dataset.id;

        if (id === SELECTORS.repeat.dataId) {
          that.emit('change:repeat', target.value);
        }
      });
    });

    var playbackObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        var target = m.target;
        var id = target.dataset.id;

        if (id === SELECTORS.playPause.dataId) {
          var mode;
          var playing = target.classList.contains(SELECTORS.playPause.playingClass);

          if (playing) {
            mode = GoogleMusic.Playback.PLAYING;
          } else {
            // If there is a current song, then the player is paused
            if (that.doc.getElementById(SELECTORS.info.containerId).childNodes.length) {
              mode = GoogleMusic.Playback.PAUSED;
            } else {
              mode = GoogleMusic.Playback.STOPPED;
            }
          }

          that.emit('change:playback', mode);
        }
      });
    });

    var playbackTimeObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        var target = m.target;
        var id = target.id;

        if (id === SELECTORS.shuffle.buttonSelector) {
          var currentTime = parseInt(target.getAttribute('aria-valuenow'), 10);
          var totalTime = parseInt(target.getAttribute('aria-valuemax'), 10);
          that.emit('change:playback-time', {current: currentTime, total: totalTime});
        }
      });
    });

    var ratingObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        var target = m.target;
        if (that.rating._isElSelected(target)) {
          that.emit('change:rating', target.dataset.rating);
        }
      });
    });

    addObserver.observe(this.doc.getElementById(SELECTORS.info.containerId), {
      childList: true,
      subtree: true
    });
    shuffleObserver.observe(this.doc.querySelector(SELECTORS.shuffle.buttonSelector), {
      attributes: true
    });
    repeatObserver.observe(this.doc.querySelector(SELECTORS.repeat.buttonSelector), {
      attributes: true
    });
    playbackObserver.observe(this.doc.querySelector(SELECTORS.playPause.buttonSelector), {
      attributes: true
    });
    playbackTimeObserver.observe(this.doc.getElementById(SELECTORS.slider.id), {
      attributes: true
    });
    ratingObserver.observe(this.doc.querySelector(SELECTORS.rating.containerSelector), {
      attributes: true,
      subtree: true
    });
  }
};

// Expose selectors as a class property
GoogleMusic.SELECTORS = SELECTORS;

// Export our constructor
module.exports = GoogleMusic;
