/* jshint maxparams: false */
// For now, allow too many parameters to handle hook

// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');
var browserMusicUtils = require('./utils/browser-music');

// Start our tests
describe('A Google Music instance playing no music', function () {
  browserUtils.openMusic({
    testName: 'Track info test',
    url: 'https://play.google.com/music/listen#/album//this-is-an-album-artist/this-is-an-album'
  });

  // TODO: This behavior doesn't currently exist =(
  it.skip('has no artist/track info', function () {
    // Placeholder for linter
  });

  describe('when we are playing music', function () {
    browserUtils.execute(function setupSongWatcher () {
      window.gmusic.on('change:song', function saveSong (song) {
        window.song = song;
      });
    });
    browserUtils.execute(function playViaApi () {
      window.gmusic.playback.playPause();
    });
    browserMusicUtils.waitForPlaybackStart();
    browserUtils.execute(function playViaApi () {
      return window.song;
    });

    it('has the artist/track info', function () {
      expect(this.result).to.have.property('title', 'this-is-a-name');
      expect(this.result).to.have.property('artist', 'this-is-an-artist');
      expect(this.result).to.have.property('album', 'this-is-an-album');
      expect(this.result).to.have.property('art');
      expect(this.result.art).to.have.match(/^https?:\/\//);
      expect(this.result).to.have.property('duration');
      expect(this.result.duration).to.be.a('number');
    });
  });
});
