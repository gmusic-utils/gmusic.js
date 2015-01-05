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
    browserUtils.execute(function playMusic () {

    });

    it('lists the music as playing', function () {

    });

    describe('and pause it', function () {
      it('lists the music as paused', function () {

      });

      describe('and when we clear the queue (aka the only way to stop)', function () {
        it('lists the music as stopped', function () {

        });
      });
    });
  });
});
