// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');

// Start our tests
describe('A new session with Google Music', function () {
  browserUtils.openMusic({killBrowser: false});
  browserUtils.execute(function getPlayPauseStatus () {
    return !!window.MusicAPI;
  });

  it('has a Google Music API', function () {
    expect(this.result).to.equal(true);
  });

  it.skip('is not playing any music', function () {

  });

  describe('when we are playing music', function () {
    browserUtils.execute(function setupPlaybackWatcher () {
      window.GoogleMusicApp = {
        playbackChanged: function saveMode (mode) {
          window.playbackMode = mode;
        }
      };
    });
    // before(function waitForABit (done) {
    //   setTimeout(done, 5000);
    // });
    before(function playMusic (done) {
      // Find and click the I'm Feeling Lucky mix
      var browser = this.browser;
      browser.elementByCssSelector('[data-type=imfl]', function handleElement (err, elArr) {
        // If there was an error, callback with it
        if (err) {
          return done(err);
        }

        // Otherwise, hover the element
        var el = elArr[0];
        browser.moveTo(el, 10, 10, function handleHover (err) {
          // If there was an error, callback with it
          if (err) {
            return done(err);
          }

          // Otherwise, click our element
          browser.click(el, done);
        });
      });
    });
    // TODO: Should we wait for playback to start?
    browserUtils.execute(function playMusic () {
      return window.playbackMode;
    });

    it('lists the music as playing', function () {
      console.log(this.result);
      expect(this.result).to.equal(2 /* PLAYING */);
    });

    describe.skip('and pause it', function () {
      it('lists the music as paused', function () {

      });

      describe('and when we clear the queue (aka the only way to stop)', function () {
        it('lists the music as stopped', function () {

        });
      });
    });
  });
});
