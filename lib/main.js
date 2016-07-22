// Load in dependencies
const assert = require('assert');
const EventEmitter = require('events').EventEmitter;
const inherits = require('inherits');

// Define selector constants
const SELECTORS = {
  info: {
    albumArtId: 'playerBarArt',
    albumSelector: '.player-album',
    artistId: 'player-artist',
    containerId: 'playerSongInfo',
    infoWrapperClass: 'now-playing-info-wrapper',
    titleId: 'currently-playing-title',
  },
  forward: {
    buttonSelector: '[data-id="forward"]',
  },
  playPause: {
    buttonSelector: '[data-id="play-pause"]',
    dataId: 'play-pause',
    playingClass: 'playing',
  },
  rating: {
    // DEV: `.player-rating-container` doesn't exist until a song is playing
    containerSelector: '#playerSongInfo',
    thumbsSelector: '#player .player-rating-container [icon^="sj:thumb-"][data-rating]',
    thumbsUpSelector: '#player .player-rating-container [icon^="sj:thumb-"][data-rating="5"]',
    thumbsDownSelector: '#player .player-rating-container [icon^="sj:thumb-"][data-rating="1"]',
    thumbSelectorFormat: '#player .player-rating-container [icon^="sj:thumb-"][data-rating="{rating}"]',
  },
  repeat: {
    dataId: 'repeat',
    buttonSelector: '[data-id="repeat"]',
  },
  rewind: {
    buttonSelector: '[data-id="rewind"]',
  },
  shuffle: {
    dataId: 'shuffle',
    buttonSelector: '[data-id="shuffle"]',
  },
  playback: {
    sliderId: 'material-player-progress',
  },
  volume: {
    sliderId: 'material-vslider',
  },
};

// Define getTextContent method to safely fetch textContent from unknown elements
function getTextContent(elem, defaultText) {
  return elem ? (elem.textContent || defaultText) : defaultText;
}

// Define our constructor
function GMusic(win) {
  // If win was not provided, complain
  if (!win) {
    throw new Error('`win` was not provided to the `GMusic` constructor');
  }

  // Inherit from EventEmitter
  EventEmitter.call(this);

  // Localize reference to window and document
  this.win = win;
  this.doc = win.document;

  // For each of the prototype sections
  const proto = GMusic._protoObj;
  Object.keys(proto).forEach(protoKey => {
    // Define a key on our object
    this[protoKey] = {};

    // For each of the keys on the section, define a function that invokes on this original context
    const section = proto[protoKey];
    Object.keys(section).forEach(sectionKey => {
      this[protoKey][sectionKey] = section[sectionKey].bind(this);
    });

    // If there was an `init` method, run it
    if (this[protoKey].init) {
      this[protoKey].init();
    }
  });
}
// Inherit from EventEmitter normally
inherits(GMusic, EventEmitter);

// Define a "prototype" that will have magical invocation
const proto = GMusic._protoObj = {};

// Create a volume API
proto.volume = {
  // Query required elements
  init() {
    this.volume._sliderEl = this.doc.getElementById(SELECTORS.volume.sliderId);
    assert(this.volume._sliderEl, `Failed to find slider element for volume "#${SELECTORS.volume.sliderId}"`);
  },

  // Get the current volume level.
  getVolume() {
    return parseInt(this.volume._sliderEl.getAttribute('aria-valuenow'), 10);
  },

  // Set the volume level (0 - 100).
  setVolume(vol) {
    const current = this.volume.getVolume();

    if (vol > current) {
      this.volume.increaseVolume(vol - current);
    } else if (vol < current) {
      this.volume.decreaseVolume(current - vol);
    }
  },

  // Increase the volume by an amount (default of 5)
  increaseVolume(amount = 5) {
    for (let i = 0; i < amount; i += 5) {
      this.volume._sliderEl.increment();
    }
  },

  // Decrease the volume by an amount (default of 5)
  decreaseVolume(amount = 5) {
    for (let i = 0; i < amount; i += 5) {
      this.volume._sliderEl.decrement();
    }
  },
};

// Create a playback API and constants
GMusic.Playback = {
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
  NO_SHUFFLE: 'NO_SHUFFLE',
};
GMusic.Playback.SHUFFLE_MODES = [
  GMusic.Playback.ALL_SHUFFLE,
  GMusic.Playback.NO_SHUFFLE,
];
GMusic.Playback.REPEAT_MODES = [
  GMusic.Playback.LIST_REPEAT,
  GMusic.Playback.SINGLE_REPEAT,
  GMusic.Playback.NO_REPEAT,
];
proto.playback = {
  // Query references to the media playback elements
  init() {
    const _sliderEl = this.playback._sliderEl = this.doc.getElementById(SELECTORS.playback.sliderId);
    const _playPauseEl = this.playback._playPauseEl = this.doc.querySelector(SELECTORS.playPause.buttonSelector);
    const _forwardEl = this.playback._forwardEl = this.doc.querySelector(SELECTORS.forward.buttonSelector);
    const _rewindEl = this.playback._rewindEl = this.doc.querySelector(SELECTORS.rewind.buttonSelector);
    const _shuffleEl = this.playback._shuffleEl = this.doc.querySelector(SELECTORS.shuffle.buttonSelector);
    const _repeatEl = this.playback._repeatEl = this.doc.querySelector(SELECTORS.repeat.buttonSelector);

    assert(_sliderEl, `Failed to find slider element for playback "#${SELECTORS.playback.sliderId}"`);
    assert(_playPauseEl, `Failed to find playPause element for playback "${SELECTORS.playPause.buttonSelector}"`);
    assert(_forwardEl, `Failed to find forward element for playback "${SELECTORS.forward.buttonSelector}"`);
    assert(_rewindEl, `Failed to find rewind element for playback "${SELECTORS.rewind.buttonSelector}"`);
    assert(_shuffleEl, `Failed to find shuffle element for playback "${SELECTORS.shuffle.buttonSelector}"`);
    assert(_repeatEl, `Failed to find repeat element for playback "${SELECTORS.repeat.buttonSelector}"`);
  },

  // Time functions
  getPlaybackTime() {
    return parseInt(this.playback._sliderEl.getAttribute('aria-valuenow'), 10);
  },

  setPlaybackTime(milliseconds) {
    // Set playback value on the element and trigger a change event
    this.playback._sliderEl.value = milliseconds;
    const evt = new this.win.UIEvent('change');
    this.playback._sliderEl.dispatchEvent(evt);
  },

  getPlaybackState() {
    // Play/Pause element states:
    //   PLAYING: {__data__: {icon: 'av:pause-circle-filled'}, disabled: false}
    //   PAUSED: {__data__: {icon: 'av:sj:pause-circle-fill'}, disabled: false}
    //   STOPPED: {__data__: {icon: 'av:sj:play-circle-fill'}, disabled: true}
    if (!this.playback._playPauseEl.disabled) {
      if (this.playback._playPauseEl.__data__.icon === 'av:pause-circle-filled') {
        return GMusic.Playback.PLAYING;
      }
      return GMusic.Playback.PAUSED;
    }
    return GMusic.Playback.STOPPED;
  },

  getSongInfo() {
    const songInfo = {
      title: getTextContent(this.doc.getElementById(SELECTORS.info.titleId), 'Unknown Title'),
      artist: getTextContent(this.doc.getElementById(SELECTORS.info.artistId), 'Unknown Artist'),
      album: getTextContent(this.doc.querySelector(SELECTORS.info.albumSelector), 'Unknown Album'),
      art: this.doc.getElementById(SELECTORS.info.albumArtId) || null,
      duration: this.doc.getElementById(SELECTORS.playback.sliderId).max,
    };
    songInfo.art = (songInfo.art) ? songInfo.art.src : null;

    // The art may be a protocol-relative URL, so normalize it to HTTPS
    if (songInfo.art && songInfo.art.slice(0, 2) === '//') {
      songInfo.art = `https:${songInfo.art}`;
    }
    return songInfo;
  },

  // Playback functions
  playPause() { this.playback._playPauseEl.click(); },
  forward() { this.playback._forwardEl.click(); },
  rewind() { this.playback._rewindEl.click(); },

  getShuffle() {
    if (this.playback._shuffleEl.classList.contains('active')) {
      return GMusic.Playback.ALL_SHUFFLE;
    }
    return GMusic.Playback.NO_SHUFFLE;
  },
  setShuffle(mode) {
    assert(GMusic.Playback.SHUFFLE_MODES.indexOf(mode) !== -1,
      `Expected shuffle mode "${mode}" to be inside ${JSON.stringify(GMusic.Playback.SHUFFLE_MODES)} but it wasn't`);
    while (this.playback.getShuffle() !== mode) {
      this.playback.toggleShuffle();
    }
  },
  toggleShuffle() { this.playback._shuffleEl.click(); },

  getRepeat() {
    // Repeat element states:
    //   SINGLE_REPEAT: {classList: ['active'], __data__: {icon: 'av:repeat-one'}}
    //   LIST_REPEAT: {classList: ['active'], __data__: {icon: 'av:repeat'}}
    //   NO_REPEAT: {classList: [], __data__: {icon: 'av:repeat'}}
    if (this.playback._repeatEl.__data__.icon === 'av:repeat-one') {
      return GMusic.Playback.SINGLE_REPEAT;
    } else if (this.playback._repeatEl.classList.contains('active')) {
      return GMusic.Playback.LIST_REPEAT;
    }
    return GMusic.Playback.NO_REPEAT;
  },
  setRepeat(mode) {
    assert(GMusic.Playback.REPEAT_MODES.indexOf(mode) !== -1,
      `Expected repeat mode "${mode}" to be inside ${JSON.stringify(GMusic.Playback.REPEAT_MODES)} but it wasn't`);
    while (this.playback.getRepeat() !== mode) {
      this.playback.toggleRepeat();
    }
  },
  toggleRepeat() { this.playback._repeatEl.click(); },

  // Taken from the Google Play Music page
  toggleVisualization() {
    this.win.SJBpost('toggleVisualization'); // eslint-disable-line new-cap
  },
};

// Create a rating API
proto.rating = {
  // Determine if a thumb is selected or not
  _isElSelected(el) {
    // jscs:disable maximumLineLength
    // Unselected thumbs down:
    // <paper-icon-button icon="sj:thumb-up-outline" data-rating="5" role="button" tabindex="0" aria-disabled="false" class="x-scope paper-icon-button-0" title="Thumb-up" aria-label="Thumb-up"></paper-icon-button>
    //   el.__data__.icon = 'sj:thumb-down-outline';
    // Selected thumbs up:
    // <paper-icon-button icon="sj:thumb-up-outline" data-rating="5" role="button" tabindex="0" aria-disabled="false" class="x-scope paper-icon-button-0" title="Undo thumb-up" aria-label="Undo thumb-up"></paper-icon-button>
    //   el.__data__.icon = 'thumb-up';
    // jscs:enable maximumLineLength
    // DEV: We don't use English only strings (e.g. "Undo") to support i18n
    return el.__data__.icon === 'thumb-up' || el.__data__.icon === 'thumb-down';
  },
  // Get current rating
  getRating() {
    const thumbEls = this.doc.querySelectorAll(SELECTORS.rating.thumbsSelector);
    assert(thumbEls.length, `Failed to find thumb elements for rating "${SELECTORS.rating.thumbsSelector}"`);
    let i = 0;
    const len = thumbEls.length;
    for (; i < len; i++) {
      const el = thumbEls[i];
      if (this.rating._isElSelected(el)) {
        return el.dataset.rating;
      }
    }
    return '0';
  },

  // Thumbs up
  toggleThumbsUp() {
    const el = this.doc.querySelector(SELECTORS.rating.thumbsUpSelector);

    if (el) {
      el.click();
    }
  },

  // Thumbs down
  toggleThumbsDown() {
    const el = this.doc.querySelector(SELECTORS.rating.thumbsDownSelector);

    if (el) {
      el.click();
    }
  },

  // Set a rating
  setRating(rating) {
    const selector = SELECTORS.rating.thumbSelectorFormat.replace('{rating}', rating);
    const el = this.doc.querySelector(selector);

    if (el && !this.rating._isElSelected(el)) {
      el.click();
    }
  },

  // Reset the rating
  resetRating() {
    const selector = SELECTORS.rating.thumbSelectorFormat.replace('{rating}', this.rating.getRating());
    const el = this.doc.querySelector(selector);

    if (el && this.rating._isElSelected(el)) {
      el.click();
    }
  },
};

// Miscellaneous functions
proto.extras = {
  // Get a shareable URL of the song on Google Play Music
  getSongURL() {
    const albumEl = this.doc.querySelector('.player-album');
    const artistEl = this.doc.querySelector('.player-artist');

    const urlTemplate = 'https://play.google.com/music/m/';
    let url = null;

    const parseID = id => id.substring(0, id.indexOf('/'));

    if (albumEl === null && artistEl === null) {
      return null;
    }

    const albumId = parseID(albumEl.dataset.id);
    const artistId = parseID(artistEl.dataset.id);

    if (albumId) {
      url = urlTemplate + albumId;
    } else if (artistId) {
      url = urlTemplate + artistId;
    }

    return url;
  },
};

proto.hooks = {
  init() {
    // Define mutation observer for reuse
    const MutationObserver = this.win.MutationObserver || this.win.WebKitMutationObserver;

    let lastTitle = '';
    let lastArtist = '';
    let lastAlbum = '';
    let lastArt = null;

    const addObserver = new MutationObserver(mutations => {
      mutations.forEach(m => {
        for (let i = 0; i < m.addedNodes.length; i++) {
          // DEV: We can encounter a text node, verify we have a `classList` to assert against
          const target = m.addedNodes[i];
          if (target.classList && target.classList.contains(SELECTORS.info.infoWrapperClass)) {
            const songInfo = this.playback.getSongInfo();
            // Make sure that this is the first of the notifications for the
            // insertion of the song information elements.
            if (lastTitle !== songInfo.title || lastArtist !== songInfo.artist ||
                lastAlbum !== songInfo.album || lastArt !== songInfo.art) {
              this.emit('change:song', songInfo);

              lastTitle = songInfo.title;
              lastArtist = songInfo.artist;
              lastAlbum = songInfo.album;
              lastArt = songInfo.art;
            }
          }
        }
      });
    });

    let lastShuffle;
    const shuffleObserver = new MutationObserver(mutations => {
      const shuffleTouched = mutations.some(m => {
        const target = m.target;
        return target.dataset.id === SELECTORS.shuffle.dataId;
      });

      if (!shuffleTouched) {
        return;
      }

      const newShuffle = this.playback.getShuffle();
      if (lastShuffle !== newShuffle) {
        lastShuffle = newShuffle;
        this.emit('change:shuffle', newShuffle);
      }
    });

    let lastRepeat;
    const repeatObserver = new MutationObserver(mutations => {
      const repeatTouched = mutations.some(m => {
        const target = m.target;
        return target.dataset.id === SELECTORS.repeat.dataId;
      });

      if (!repeatTouched) {
        return;
      }

      const newRepeat = this.playback.getRepeat();
      if (lastRepeat !== newRepeat) {
        lastRepeat = newRepeat;
        this.emit('change:repeat', newRepeat);
      }
    });

    let lastMode;
    const playbackObserver = new MutationObserver(mutations => {
      mutations.forEach(m => {
        const target = m.target;
        const id = target.dataset.id;

        if (id === SELECTORS.playPause.dataId) {
          // If the play/pause button is disabled
          let mode;
          if (target.disabled === true) {
            // If there is song info, then we are transitioning songs and do nothing
            if (this.doc.getElementById(SELECTORS.info.containerId).style.display !== 'none') {
              return;
            }
            // Otherwise, we are stopped
            mode = GMusic.Playback.STOPPED;
          // Otherwise (the play/pause button is enabled)
          } else {
            const playing = target.classList.contains(SELECTORS.playPause.playingClass);
            if (playing) {
              mode = GMusic.Playback.PLAYING;
            // DEV: If this fails to catch stopped cases, then maybe move "no song info" check to top level
            } else {
              mode = GMusic.Playback.PAUSED;
            }
          }

          // If the mode has changed, then update it
          if (mode !== lastMode) {
            this.emit('change:playback', mode);
            lastMode = mode;
          }
        }
      });
    });

    const playbackTimeObserver = new MutationObserver(mutations => {
      mutations.forEach(m => {
        const target = m.target;
        const id = target.id;

        if (id === SELECTORS.playback.sliderId) {
          const currentTime = parseInt(target.getAttribute('aria-valuenow'), 10);
          const totalTime = parseInt(target.getAttribute('aria-valuemax'), 10);
          this.emit('change:playback-time', { current: currentTime, total: totalTime });
        }
      });
    });

    let lastRating;
    const ratingObserver = new MutationObserver(mutations => {
      // If we are looking at a rating button and it's selected, emit a notification
      // DEV: Prevent selection of container and "remove-circle-outline" button
      // jscs:disable maximumLineLength
      // Good:
      //   <paper-icon-button icon="sj:thumb-up-outline" data-rating="5" role="button" tabindex="0" aria-disabled="false" class="x-scope paper-icon-button-0" title="Thumb-up" aria-label="Thumb-up"></paper-icon-button>
      // Bad:
      //   <div id="playerSongInfo" style=""></div>
      //   <paper-icon-button icon="remove-circle-outline" data-rating="0" role="button" tabindex="0" aria-disabled="false" class="x-scope paper-icon-button-0"></paper-icon-button>
      // jscs:enable maximumLineLength
      const ratingsTouched = mutations.some(m => {
        // Determine if our ratings were touched
        const target = m.target;
        return target.dataset && target.dataset.rating && target.hasAttribute('aria-label');
      });

      if (!ratingsTouched) {
        return;
      }

      const newRating = this.rating.getRating();
      if (lastRating !== newRating) {
        lastRating = newRating;
        this.emit('change:rating', newRating);
      }
    });

    // Find our target elements
    const addObserverEl = this.doc.getElementById(SELECTORS.info.containerId);
    const shuffleObserverEl = this.doc.querySelector(SELECTORS.shuffle.buttonSelector);
    const repeatObserverEl = this.doc.querySelector(SELECTORS.repeat.buttonSelector);
    const playbackObserverEl = this.doc.querySelector(SELECTORS.playPause.buttonSelector);
    const playbackTimeObserverEl = this.doc.getElementById(SELECTORS.playback.sliderId);
    const ratingObserverEl = this.doc.querySelector(SELECTORS.rating.containerSelector);

    // Verify they exist
    // jscs:disable maximumLineLength
    assert(addObserverEl, `Failed to find addObserver element for hooks "#${SELECTORS.info.containerId}"`);
    assert(shuffleObserverEl, `Failed to find shuffleObserver element for hooks "${SELECTORS.shuffle.buttonSelector}"`);
    assert(repeatObserverEl, `Failed to find repeatObserver element for hooks "${SELECTORS.repeat.buttonSelector}"`);
    assert(playbackObserverEl, `Failed to find playbackObserver element for hooks "${SELECTORS.playPause.buttonSelector}"`);
    assert(playbackTimeObserverEl, `Failed to find playbackTimeObserver element for hooks "#${SELECTORS.playback.sliderId}"`);
    assert(ratingObserverEl, `Failed to find ratingObserver element for hooks "${SELECTORS.rating.containerSelector}"`);
    // jscs:enable maximumLineLength

    // Bind our elements
    addObserver.observe(addObserverEl, {
      childList: true,
      subtree: true,
    });
    shuffleObserver.observe(shuffleObserverEl, {
      attributes: true,
    });
    repeatObserver.observe(repeatObserverEl, {
      attributes: true,
    });
    playbackObserver.observe(playbackObserverEl, {
      attributes: true,
    });
    playbackTimeObserver.observe(playbackTimeObserverEl, {
      attributes: true,
    });
    ratingObserver.observe(ratingObserverEl, {
      attributes: true,
      subtree: true,
    });
  },
};

// Expose selectors as a class property
GMusic.SELECTORS = SELECTORS;

// Export our constructor
module.exports = GMusic;
