// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');
var browserMusicUtils = require('./utils/browser-music');

// Start our tests
describe('A Google Music instance playing music (via manual click)', function () {
  browserUtils.openMusic();
  browserMusicUtils.playAnything();
  browserMusicUtils.waitForPlaybackStart();

  describe('when paused via our API', function () {
    browserUtils.execute(function pauseViaApi () {
      window.googleMusic.playback.playPause();
    });
    browserMusicUtils.waitForPlaybackPause();

    it('is paused', function () {
      // Would not run if `browserMusicUtils.waitForPlaybackPause()` failed
    });

    describe('when played via our API', function () {
      browserUtils.execute(function pauseViaApi () {
        window.googleMusic.playback.playPause();
      });
      browserMusicUtils.waitForPlaybackStart();

      it('is playing', function () {
        // Would not run if `browserMusicUtils.waitForPlaybackPause()` failed
      });

      describe('playing the next track', function () {
        browserUtils.execute(function getCurrentTrack () {
          var selectors = window.GoogleMusic.SELECTORS;
          return document.getElementById(selectors.info.titleId).textContent;
        });
        before(function saveCurrentTrack () {
          this.track = this.result;
        });
        browserUtils.execute(function moveToNextTrack () {
          window.googleMusic.playback.forward();
        });
        browserUtils.execute(function getNewTrack () {
          var selectors = window.GoogleMusic.SELECTORS;
          return document.getElementById(selectors.info.titleId).textContent;
        });
        after(function cleanup () {
          delete this.track;
        });

        it('changes songs', function () {
          var newTrack = this.result;
          expect(newTrack).to.not.equal(this.track);
        });

        describe('playing the previous track', function () {
          browserUtils.execute(function moveToPreviousTrack () {
            window.googleMusic.playback.rewind();
          });
          browserUtils.execute(function getNewTrack () {
            var selectors = window.GoogleMusic.SELECTORS;
            return document.getElementById(selectors.info.titleId).textContent;
          });

          it('goes back to the original song', function () {
            var originalTrack = this.result;
            expect(originalTrack).to.equal(this.track);
          });
        });
      });
    });
  });
});

describe('A Google Music instance not playing music', function () {
  browserUtils.openMusic();
  browserUtils.execute(function getPlaybackNothing () {
    return window.googleMusic.playback.getPlaybackTime();
  });
  browserUtils.execute(function setupHooks () {
    window.googleMusic.on('change:playback-time', function playbackTimeChanged (playbackInfo) {
      window.playbackTimeChanged = true;
    });
  });

  // Currently we return 0 but that isn't accurate. We should return 0.
  // TODO: Should we expect this as a proper use case?
  it.skip('has no time for playback', function () {
    expect(this.result).to.equal(null);
  });

  describe('playing music', function () {
    browserMusicUtils.playAnything();
    browserMusicUtils.waitForPlaybackStart();
    browserUtils.execute(function getPlaybackStart () {
      return window.googleMusic.playback.getPlaybackTime();
    });

    it('is within the 0 to 10 seconds of playback', function () {
      expect(this.result).to.be.at.least(0);
      expect(this.result).to.be.lessThan(10e3);
    });

    // TODO: Repair library to support `setPlaybackTime`
    describe.skip('when seeked to middle of a track', function () {
      browserUtils.execute(function getPlaybackStart () {
        window.googleMusic.playback.setPlaybackTime(60e3);
      });
      browserUtils.execute(function getPlaybackMiddle () {
        return window.googleMusic.playback.getPlaybackTime();
      });

      it('is within 10 seconds of new playback', function () {
        expect(this.result).to.be.at.least(50e3);
        expect(this.result).to.be.lessThan(70e3);
      });

      describe('a playback time hook', function () {
        browserUtils.execute(function getPlaybackMiddle () {
          return window.playbackTimeChanged;
        });

        it('has been triggered', function () {
          expect(this.result).to.equal(true);
        });
      });
    });
  });
});

describe('A Google Music instance', function () {
  browserUtils.openMusic();
  browserUtils.execute(function setupHooks () {
    window.googleMusic.on('change:repeat', function repeatChanged (mode) {
      window.repeatChanged = true;
    });
    window.googleMusic.on('change:shuffle', function shuffleChanged (mode) {
      window.shuffleChanged = true;
    });
  });

  describe('when we toggle shuffle', function () {
    browserUtils.execute(function getShuffleMode () {
      return window.googleMusic.playback.getShuffle();
    });
    before(function saveFirstShuffle () {
      this.firstShuffle = this.result;
    });
    after(function cleanup () {
      delete this.firstShuffle;
    });
    browserUtils.execute(function moveToNextTrack () {
      window.googleMusic.playback.toggleShuffle();
    });

    it('goes to the next mode', function () {
      var secondShuffle = this.result;
      expect(secondShuffle).to.not.equal(this.firstShuffle);
    });

    describe('a shuffle hook', function () {
      browserUtils.execute(function getShuffleHookResults () {
        return window.shuffleChanged;
      });

      it('was triggered', function () {
        expect(this.result).to.equal(true);
      });
    });
  });

  describe('when we toggle repeat', function () {
    browserUtils.execute(function getShuffleMode () {
      return window.googleMusic.playback.getRepeat();
    });
    before(function saveFirstRepeat () {
      this.repeat = this.result;
    });
    after(function cleanup () {
      delete this.repeat;
    });
    browserUtils.execute(function moveToNextTrack () {
      window.googleMusic.playback.toggleRepeat();
    });

    it('goes to the next mode', function () {
      var nextRepeat = this.result;
      expect(nextRepeat).to.not.equal(this.repeat);
    });

    describe('a repeat hook', function () {
      browserUtils.execute(function getRepeatHookResults () {
        return window.repeatChanged;
      });

      it('was triggered', function () {
        expect(this.result).to.equal(true);
      });
    });
  });
});
