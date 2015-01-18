// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');
var browserMusicUtils = require('./utils/browser-music');

// Start our tests
describe('A Google Music instance playing no music', function () {
  browserUtils.openMusic({
    killBrowser: false,
    url: 'https://play.google.com/music/listen#/album//this-is-an-album-artist/this-is-an-album'
  });

  // TODO: This behavior doesn't currently exist =(
  it.skip('has no artist/track info', function () {
    // Placeholder for linter
  });

  describe('when we are playing music', function () {
    browserUtils.execute(function setupPlaybackWatcher () {
      window.GoogleMusicApp = {
        playbackChanged: function saveSong (title, artist, album, art, duration) {
          window.song = {
            title: title,
            artist: artist,
            album: album,
            art: art,
            duration: duration
          };
        }
      };
    });
    browserUtils.execute(function playViaApi () {
      window.MusicAPI.Playback.playPause();
    });
    browserMusicUtils.waitForPlaybackStart();
    browserUtils.execute(function playViaApi () {
      return window.song;
    });

    it('has the artist/track info', function () {
      expect(this.song).to.have.property('title', 'this-is-a-title');
      expect(this.song).to.have.property('artist', 'this-is-a-artist');
      expect(this.song).to.have.property('album', 'this-is-a-album');
      expect(this.song).to.have.property('art');
      expect(this.song.art).to.have.match(/^https?:\/\//);
      expect(this.song).to.have.property('duration');
      expect(this.song.duration).to.be.a('number');
    });
  });
});
