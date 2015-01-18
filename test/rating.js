// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');
var browserMusicUtils = require('./utils/browser-music');

// Start our tests
describe('A track in Google Music', function () {
  browserUtils.openMusic({
    url: 'https://play.google.com/music/listen#/album//this-is-an-album-artist/this-is-an-album'
  });
  browserUtils.execute(function setupHooks () {
    window.GoogleMusicApp = {
      ratingChanged: function (rating) {
        window.rating = rating;
      }
    };
  });
  browserUtils.execute(function playViaApi () {
    window.MusicAPI.Playback.playPause();
  });
  browserMusicUtils.waitForPlaybackStart();

  describe('when \'thumbs down\'-ed', function () {
    // DEV: Warning this will skip to next track
    browserUtils.execute(function thumbsDownTrack () {
      window.MusicAPI.Rating.toggleThumbsDown();
    });
    browserUtils.execute(function thumbsDownTrack () {
      return window.MusicAPI.Rating.getRating();
    });

    it('has a low rating', function () {
      expect(this.result).to.equal('1');
    });

    describe('a hook result', function () {
      browserUtils.execute(function thumbsDownTrack () {
        return window.rating;
      });

      it('was triggered', function () {
        expect(this.result).to.equal('1');
      });
    });
  });

  describe('when \'thumbs up\'-ed', function () {
    browserUtils.execute(function thumbsUpTrack () {
      window.MusicAPI.Rating.toggleThumbsUp();
    });
    browserUtils.execute(function thumbsUpTrack () {
      return window.MusicAPI.Rating.getRating();
    });

    it('has a high rating', function () {
      expect(this.result).to.equal('5');
    });

    describe('when switched to neutral', function () {
      browserUtils.execute(function thumbsUpTrack () {
        window.MusicAPI.Rating.toggleThumbsUp();
      });
      browserUtils.execute(function thumbsUpTrack () {
        return window.MusicAPI.Rating.getRating();
      });

      it('has no rating', function () {
        expect(this.result).to.equal('0');
      });
    });
  });
});
