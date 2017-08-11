import assert from 'assert';

import GMusicNamespace from '../GMusicNamespace';
import Track from '../structs/Track';
import { controlsSelectors, playbackSelectors, nowPlayingSelectors, podcastSelectors } from '../constants/selectors';

export default class PlaybackNamespace extends GMusicNamespace {
  static ENUMS = {
    PlaybackStatus: {
      STOPPED: 0,
      PAUSED: 1,
      PLAYING: 2,
    },
    ShuffleStatus: {
      ALL_SHUFFLE: 'ALL_SHUFFLE',
      NO_SHUFFLE: 'NO_SHUFFLE',
    },
    RepeatStatus: {
      LIST_REPEAT: 'LIST_REPEAT',
      NO_REPEAT: 'NO_REPEAT',
      SINGLE_REPEAT: 'SINGLE_REPEAT',
    },
  };

  constructor(...args) {
    super(...args);

    this._audioElem = document.querySelectorAll('audio')[1];
    this._setupExtraFeelingLuckyButton();
    this._mapSelectors(playbackSelectors);
    this._hookEvents();

    this.addMethods([
      'getCurrentTime', 'setCurrentTime', 'getTotalTime', 'getCurrentTrack', 'isPlaying', 'getPlaybackState', 'playPause',
      'rewind', 'forward', 'getShuffle', 'setShuffle', 'toggleShuffle', 'getRepeat', 'setRepeat', 'toggleRepeat', 'toggleVisualization',
      'isPodcast', 'forwardThirty', 'rewindTen', 'startFeelingLucky',
    ]);
  }

  _setupExtraFeelingLuckyButton() {
    this.iflButton = document.createElement('gpm-ifl-button');
    this.iflButton.style.display = 'none';
    document.body.append(this.iflButton);
  }

  _textContent(el, defaultText) {
    return el ? el.textContent || defaultText : defaultText;
  }

  getCurrentTime() {
    return Math.round(this._audioElem.currentTime * 1000);
  }

  setCurrentTime(milliseconds) {
    this._audioElem.currentTime = milliseconds / 1000;

    // Update the UI as well
    this._progressEl.value = milliseconds;
    // DEV: Dispatch a new change event to simulate user interaction
    this._progressEl.dispatchEvent(new window.UIEvent('change'));
  }

  getTotalTime() {
    return this._progressEl.max;
  }

  getCurrentTrack() {
    const nowPlayingContainer = document.querySelector(nowPlayingSelectors.nowPlayingContainer);
    const track = new Track({
      id: null,
      title: this._textContent(nowPlayingContainer.querySelector(nowPlayingSelectors.title), 'Unknown Title'),
      artist: this._textContent(nowPlayingContainer.querySelector(nowPlayingSelectors.artistName), 'Unknown Artist'),
      album: this._textContent(nowPlayingContainer.querySelector(nowPlayingSelectors.albumName), 'Unknown Album'),
      albumArt: (document.querySelector(nowPlayingSelectors.albumArt) || { src: null }).src,
      duration: this.getTotalTime(),
    });

    // DEV: The art may be a protocol-relative URL, so normalize it to HTTPS
    if (track.albumArt && track.albumArt.slice(0, 2) === '//') {
      track.albumArt = `https:${track.albumArt}`;
    }
    return track;
  }

  isPlaying() {
    return document.querySelector(controlsSelectors.playPause).classList.contains('playing');
  }

  getPlaybackState() {
    const playButton = document.querySelector(controlsSelectors.playPause);

    if (playButton.classList.contains('playing')) {
      return PlaybackNamespace.ENUMS.PlaybackStatus.PLAYING;
    }
    // Play/Pause element states:
    //   PLAYING: {__data__: {icon: 'av:pause-circle-filled'}, disabled: false}
    //   PAUSED: {__data__: {icon: 'av:sj:pause-circle-fill'}, disabled: false}
    //   STOPPED: {__data__: {icon: 'av:sj:play-circle-fill'}, disabled: true}
    if (!playButton.disabled) {
      if (playButton.__data__.icon === 'av:pause-circle-filled') {
        return PlaybackNamespace.ENUMS.PlaybackStatus.PLAYING;
      }
      return PlaybackNamespace.ENUMS.PlaybackStatus.PAUSED;
    }
    return PlaybackNamespace.ENUMS.PlaybackStatus.STOPPED;
  }

  playPause() {
    document.querySelector(controlsSelectors.playPause).click();
  }

  forward() {
    document.querySelector(controlsSelectors.forward).click();
  }

  rewind() {
    document.querySelector(controlsSelectors.rewind).click();
  }

  getShuffle() {
    if (document.querySelector(controlsSelectors.shuffle).classList.contains('active')) {
      return PlaybackNamespace.ENUMS.ShuffleStatus.ALL_SHUFFLE;
    }
    return PlaybackNamespace.ENUMS.ShuffleStatus.NO_SHUFFLE;
  }

  setShuffle(mode) {
    assert(Object.keys(PlaybackNamespace.ENUMS.ShuffleStatus).indexOf(mode) !== -1,
      `Expected shuffle mode "${mode}" to be inside ${JSON.stringify(Object.keys(PlaybackNamespace.ENUMS.ShuffleStatus))} but it wasn't`);
    while (this.getShuffle() !== mode) {
      this.toggleShuffle();
    }
  }

  toggleShuffle() {
    document.querySelector(controlsSelectors.shuffle).click();
  }

  getRepeat() {
    const repeatEl = document.querySelector(controlsSelectors.repeat);
    // Repeat element states:
    //   SINGLE_REPEAT: {classList: ['active'], __data__: {icon: 'av:repeat-one'}}
    //   LIST_REPEAT: {classList: ['active'], __data__: {icon: 'av:repeat'}}
    //   NO_REPEAT: {classList: [], __data__: {icon: 'av:repeat'}}
    if (repeatEl.__data__.icon === 'av:repeat-one') {
      return PlaybackNamespace.ENUMS.RepeatStatus.SINGLE_REPEAT;
    } else if (repeatEl.classList.contains('active')) {
      return PlaybackNamespace.ENUMS.RepeatStatus.LIST_REPEAT;
    }
    return PlaybackNamespace.ENUMS.RepeatStatus.NO_REPEAT;
  }

  setRepeat(mode) {
    assert(Object.keys(PlaybackNamespace.ENUMS.RepeatStatus).indexOf(mode) !== -1,
      `Expected repeat mode "${mode}" to be inside ${JSON.stringify(Object.keys(PlaybackNamespace.ENUMS.RepeatStatus))} but it wasn't`);
    while (this.getRepeat() !== mode) {
      this.toggleRepeat();
    }
  }

  toggleRepeat() {
    document.querySelector(controlsSelectors.repeat).click();
  }

  isPodcast() {
    return document.querySelector(podcastSelectors.podcast).classList.contains('podcast');
  }

  rewindTen() {
    const elPodcastRwd = document.querySelector(controlsSelectors.rewindTen);
    if (elPodcastRwd) {
      elPodcastRwd.click();
    }
  }

  forwardThirty() {
    const elPodcastFwd = document.querySelector(controlsSelectors.forwardThirty);
    if (elPodcastFwd) {
      elPodcastFwd.click();
    }
  }

  // Taken from the Google Play Music page
  toggleVisualization() {
    window.SJBpost('toggleVisualization'); // eslint-disable-line
  }

  startFeelingLucky() {
    this.iflButton.click();
  }

  _hookEvents() {
    // Playback Time Event
    this._audioElem.addEventListener('timeupdate', () => {
      this.emit('change:playback-time', {
        current: this.getCurrentTime(),
        total: this.getTotalTime(),
      });
    });

    // Change Track Event
    let lastTrack;
    new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        for (let i = 0; i < m.addedNodes.length; i++) {
          // DEV: We can encounter a text node, verify we have a `classList` to assert against
          const target = m.addedNodes[i];
          if (target.classList && target.classList.contains('now-playing-info-wrapper')) {
            const currentTrack = this.getCurrentTrack();
            // Make sure that this is the first of the notifications for the
            // insertion of the song information elements.
            if (!currentTrack.equals(lastTrack)) {
              this.emit('change:track', currentTrack);

              lastTrack = currentTrack;
            }
          }
        }
      });
    }).observe(document.querySelector(nowPlayingSelectors.nowPlayingContainer), {
      childList: true,
      subtree: true,
    });

    // Change Shuffle Event
    let lastShuffle;
    new MutationObserver((mutations) => {
      const shuffleTouched = mutations.some((m) => m.target.dataset.id === 'shuffle');

      if (!shuffleTouched) return;

      const newShuffle = this.getShuffle();
      if (lastShuffle !== newShuffle) {
        lastShuffle = newShuffle;
        this.emit('change:shuffle', newShuffle);
      }
    }).observe(document.querySelector(controlsSelectors.shuffle), {
      attributes: true,
    });

    // Change Repeat Event
    let lastRepeat;
    new MutationObserver((mutations) => {
      const repeatTouched = mutations.some((m) => m.target.dataset.id === 'repeat');

      if (!repeatTouched) return;

      const newRepeat = this.getRepeat();
      if (lastRepeat !== newRepeat) {
        lastRepeat = newRepeat;
        this.emit('change:repeat', newRepeat);
      }
    }).observe(document.querySelector(controlsSelectors.repeat), {
      attributes: true,
    });

    // Play/Pause Event
    let lastMode;
    new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.target.dataset.id === 'play-pause') {
          const currentMode = this.getPlaybackState();

          // If the mode has changed, then update it
          if (currentMode !== lastMode) {
            this.emit('change:playback', currentMode);
            lastMode = currentMode;
          }
        }
      });
    }).observe(document.querySelector(controlsSelectors.playPause), {
      attributes: true,
    });

    // Podcast Event
    const elPodcastFwd = document.querySelector(controlsSelectors.forwardThirty);
    if (elPodcastFwd) {
      let lastIsPodcast;
      new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          if (m.target.dataset.id === 'forward-30') {
            const currentIsPodcast = this.isPodcast();

            // If the mode has changed, then update it
            if (currentIsPodcast !== lastIsPodcast) {
              this.emit('change:podcast', currentIsPodcast);
              lastIsPodcast = currentIsPodcast;
            }
          }
        });
      }).observe(elPodcastFwd, {
        attributes: true,
      });
    }
  }
}
