// Load in dependencies
var expect = require('chai').expect;
var asserters = require('wd/lib/asserters');
var browserUtils = require('./utils/browser');
var browserMusicUtils = require('./utils/browser-music');

// Start our tests
describe('A new session with Google Music', function () {
  browserUtils.openMusic({
    testName: 'Play / Pause status test'
  });

  // TODO: Currently there is no default state, fix that
  it.skip('is not playing any music', function () {
    // Placeholder for linter
  });

  describe('when we are playing music', function () {
    browserUtils.execute(function setupPlaybackWatcher () {
      window.gmusic.on('change:playback', function saveMode (mode) {
        window.playbackMode = mode;
      });
    });
    browserMusicUtils.playAnything();
    browserMusicUtils.waitForPlaybackStart();
    browserUtils.execute(function getPlaybackState () {
      return window.playbackMode;
    });

    it('lists the music as playing', function () {
      expect(this.result).to.equal(2 /* PLAYING */);
    });

    describe('and pause it', function () {
      before(function pausePlayback (done) {
        // Find and click the play/pause button
        var browser = this.browser;
        browser.elementByCssSelector('[data-id=play-pause]', function handleElement (err, el) {
          // If there was an error, callback with it
          if (err) {
            return done(err);
          }

          // Otherwise, click our element
          el.click(done);
        });
      });
      browserMusicUtils.waitForPlaybackPause();
      browserUtils.execute(function getPlaybackState () {
        return window.playbackMode;
      });

      it('lists the music as paused', function () {
        expect(this.result).to.equal(1 /* PAUSED */);
      });

      describe('and when we clear the queue (aka the only way to stop)', function () {
        before(function openQueue (done) {
          // Find and open the music queue
          var browser = this.browser;
          browser.elementByCssSelector('[data-id=queue]', function handleElement (err, el) {
            // If there was an error, callback with it
            if (err) {
              return done(err);
            }

            // Otherwise, click our element
            el.click(done);
          });
        });
        before(function waitForVisibleClearQueue (done) {
          // Find and wait for the clear queue button to be visible
          var browser = this.browser;
          browser.waitForElementByCssSelector('[data-id=clear-queue]', asserters.isVisible.assert, 2000, 100, done);
        });
        before(function waitABit (done) {
          // DEV: We need to wait for some reason between visibility and being able to click =(
          setTimeout(done, 500);
        });
        before(function clearQueue (done) {
          // Find and click the clear queue button
          var browser = this.browser;
          browser.elementByCssSelector('[data-id=clear-queue]', function handleElement (err, el) {
            // If there was an error, callback with it
            if (err) {
              return done(err);
            }

            // Otherwise, click our element
            el.click(done);
          });
        });
        browserUtils.execute(function getPlaybackState () {
          return window.playbackMode;
        });

        it('lists the music as stopped', function () {
          expect(this.result).to.equal(0 /* STOPPED */);
        });
      });
    });
  });
});
