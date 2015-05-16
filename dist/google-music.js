(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Expose our constructor to the world
window.GoogleMusic = require('./main');

},{"./main":3}],2:[function(require,module,exports){
function Keyboard(win) {
  // Save window for later
  this.win = win;
}
// Define constants
Keyboard.KEY_UP = 0x26;
Keyboard.KEY_DOWN = 0x28;
// Define methods
Keyboard.prototype = {
  sendKey: function (element, key) {
    var ev = this.win.document.createEvent('Events');
    ev.initEvent('keydown', true, true);
    ev.keyCode = key;
    ev.which = key;

    element.dispatchEvent(ev);
  }
};

// Export Keyboard constructor
module.exports = Keyboard;

},{}],3:[function(require,module,exports){
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
    // TODO: Revisit me
    // containerSelector: '#player .player-rating-container'
    containerSelector: '#playerSongInfo'
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

  getShuffle: function () { return this.playback._shuffleEl.value; },
  toggleShuffle: function () { this.playback._shuffleEl.click(); },

  getRepeat: function () {
    return this.playback._repeatEl.value;
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
  // Determine whether the rating system is thumbs or stars
  isStarsRatingSystem: function () {
    return this.doc.querySelector('.rating-container.stars') !== null;
  },

  // Get current rating
  getRating: function () {
    var el = this.doc.querySelector('.player-rating-container li.selected');

    if (el) {
      return el.getAttribute('data-rating');
    } else {
      return 0;
    }
  },

  // Thumbs up
  toggleThumbsUp: function () {
    var el = this.doc.querySelector('.player-rating-container li[data-rating="5"]');

    if (el) {
      el.click();
    }
  },

  // Thumbs down
  toggleThumbsDown: function () {
    var el = this.doc.querySelector('.player-rating-container li[data-rating="1"]');

    if (el) {
      el.click();
    }
  },

  // Set a rating
  setRating: function (rating) {
    var el = this.doc.querySelector('.player-rating-container li[data-rating="' + rating + '"]');

    if (el && !el.classList.contains('selected')) {
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

        if (id === SELECTORS.shuffle.repeat) {
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

        // If the target is no longer outlined in its shadow DOM
        // DEV: Access shadow DOM via `$`
        //   Selected thumbs up:
        //   <core-icon relative="" id="icon" src="{{src}}" icon="{{icon}}" aria-label="thumb-up" role="img"></core-icon>
        //   Unselected thumbs down:
        //   <core-icon relative="" id="icon" src="{{src}}" icon="{{icon}}" aria-label="thumb-down-outline" role="img"></core-icon>
        // var notSelected = target.$.icon.ariaLabel.indexOf('-outline') === -1;
        // var selected = !notSelected;
        // if (selected) {
        //   that.emit('change:rating', target.dataset.rating);
        // }
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

},{"./keyboard":2,"./mouse":4,"events":5,"inherits":6}],4:[function(require,module,exports){
// Define our constructor
function Mouse(win) {
  // Save window for later
  this.win = win;
}
Mouse.prototype = {
  clickAtLocation: function (element, pageX, pageY) {
    // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
    var ev = new this.win.MouseEvent('click', {
      // Metadata for event
      bubbles: true,
      cancelable: true,
      view: this.win,

      // Coordinates
      screenX: pageX,
      screenY: pageY,
      clientX: pageX,
      clientY: pageY,

      // Information about action
      button: 0 // left click
    });
    element.dispatchEvent(ev);
  }
};

// Expose our constructor
module.exports = Mouse;

},{}],5:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],6:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}]},{},[1]);
