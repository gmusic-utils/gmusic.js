import assert from 'assert';

import GMusicNamespace from '../GMusicNamespace';
import Track from '../structs/Track';
import { controlsSelectors, playbackSelectors, nowPlayingSelectors } from '../constants/selectors';

export default class PlaybackNamespace extends GMusicNamespace {
  static ENUMS = {
    PlaybackStatus: {
      PLAYING: 'PLAYING',
      PAUSED: 'PAUSED',
      STOPPED: 'STOPPED',
    },
  };

  constructor(...args) {
    super(...args);

    this._mapSelectors(playbackSelectors);
    this._hookEvents();

    this.addMethod('getCurrentTime');
    this.addMethod('setCurrentTime');
    this.addMethod('getTotalTime');
    this.addMethod('getCurrentTrack');
    this.addMethod('isPlaying');
  }

  _hookEvents() {
    this._progressEl.addEventListener('value-change', () => {
      this.emit('change:playback-time', {
        current: this.getCurrentTime(),
        total: this.getTotalTime(),
      });
    });
  }

  _textContent(el, defaultText) {
    return el ? el.textContent || defaultText : defaultText;
  }

  getCurrentTime() {
    return this._progressEl.value;
  }

  setCurrentTime(milliseconds) {
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
      album: this._textContent(nowPlayingContainer.querySelector(nowPlayingSelectors.albumname), 'Unknown Album'),
      albumArt: (documet.querySelector(nowPlayingSelectors.albumArtId) || { src: null }).src,
      duration: this.getTotalTime(),
    });

    // DEV: The art may be a protocol-relative URL, so normalize it to HTTPS
    if (track.albumArt && track.albumArt.slice(0, 2) === '//') {
      track.albumArt = 'https:' + songInfo.art;
    }
    return track;
  }

  isPlaying() {
    return document.querySelector(controlsSelectors.playPause).classList.contains('playing');
  }

  getPlaybackState() {
    const playButton = document.querySelector(controlsSelectors.playPause);
    if (playButton.classList.contains('playing')) {
      return PlaybackNamespace.PlaybackStatus.PLAYING;
    }
    // Play/Pause element states:
    //   PLAYING: {__data__: {icon: 'av:pause-circle-filled'}, disabled: false}
    //   PAUSED: {__data__: {icon: 'av:sj:pause-circle-fill'}, disabled: false}
    //   STOPPED: {__data__: {icon: 'av:sj:play-circle-fill'}, disabled: true}
    if (!this.playback._playPauseEl.disabled) {
      if (this.playback._playPauseEl.__data__.icon === 'av:pause-circle-filled') {
        return GMusic.Playback.PLAYING;
      } else {
        return GMusic.Playback.PAUSED;
      }
    } else {
      return GMusic.Playback.STOPPED;
    }
  },

  // getSongInfo: function () {
  //   var songInfo = {
  //     title: this.doc.getElementById(SELECTORS.info.titleId).textContent || 'Unknown',
  //     artist: this.doc.getElementById(SELECTORS.info.artistId).textContent || 'Unknown',
  //     album: this.doc.querySelector(SELECTORS.info.albumSelector).textContent || 'Unknown',
  //     art: this.doc.getElementById(SELECTORS.info.albumArtId) || null,
  //     duration: this.doc.getElementById(SELECTORS.playback.sliderId).max
  //   };
  //   songInfo.art = (songInfo.art) ? songInfo.art.src : null;
  //
  //   // The art may be a protocol-relative URL, so normalize it to HTTPS
  //   if (songInfo.art && songInfo.art.slice(0, 2) === '//') {
  //     songInfo.art = 'https:' + songInfo.art;
  //   }
  //   return songInfo;
  // },

  // Playback functions
  // playPause: function () { this.playback._playPauseEl.click(); },
  // forward: function () { this.playback._forwardEl.click(); },
  // rewind: function () { this.playback._rewindEl.click(); },
  //
  // getShuffle: function () {
  //   if (this.playback._shuffleEl.classList.contains('active')) {
  //     return GMusic.Playback.ALL_SHUFFLE;
  //   } else {
  //     return GMusic.Playback.NO_SHUFFLE;
  //   }
  // },
  // setShuffle: function (mode) {
  //   assert(GMusic.Playback.SHUFFLE_MODES.indexOf(mode) !== -1,
  //     'Expected shuffle mode "' + mode + '" to be inside ' +
  //     JSON.stringify(GMusic.Playback.SHUFFLE_MODES) + ' but it wasn\'t');
  //   while (this.playback.getShuffle() !== mode) {
  //     this.playback.toggleShuffle();
  //   }
  // },
  // toggleShuffle: function () { this.playback._shuffleEl.click(); },
  //
  // getRepeat: function () {
  //   // Repeat element states:
  //   //   SINGLE_REPEAT: {classList: ['active'], __data__: {icon: 'av:repeat-one'}}
  //   //   LIST_REPEAT: {classList: ['active'], __data__: {icon: 'av:repeat'}}
  //   //   NO_REPEAT: {classList: [], __data__: {icon: 'av:repeat'}}
  //   if (this.playback._repeatEl.__data__.icon === 'av:repeat-one') {
  //     return GMusic.Playback.SINGLE_REPEAT;
  //   } else if (this.playback._repeatEl.classList.contains('active')) {
  //     return GMusic.Playback.LIST_REPEAT;
  //   } else {
  //     return GMusic.Playback.NO_REPEAT;
  //   }
  // },
  // setRepeat: function (mode) {
  //   assert(GMusic.Playback.REPEAT_MODES.indexOf(mode) !== -1,
  //     'Expected repeat mode "' + mode + '" to be inside ' +
  //     JSON.stringify(GMusic.Playback.REPEAT_MODES) + ' but it wasn\'t');
  //   while (this.playback.getRepeat() !== mode) {
  //     this.playback.toggleRepeat();
  //   }
  // },
  // toggleRepeat: function () { this.playback._repeatEl.click(); },
  //
  // // Taken from the Google Play Music page
  // toggleVisualization: function () {
  //   this.win.SJBpost('toggleVisualization');
  // }
}
