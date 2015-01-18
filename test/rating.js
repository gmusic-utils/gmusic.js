// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');
var browserMusicUtils = require('./utils/browser-music');

// Start our tests
// TODO: Test doesn't exist due to difficulty of testing
describe.skip('An unrated track in Google Music', function () {
  it('has no rating', function () {
    // Placeholder for linter
  });
});

describe('A track in Google Music', function () {
  // Load up 'Unknown Album - Unknown Artist'
  browserUtils.openMusic({
    killBrowser: false,
    url: 'https://play.google.com/music/listen#/album'
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
    before(function waitForRatingChange (done) {
      setTimeout(done, 1000);
    });
    browserUtils.execute(function thumbsDownTrack () {
      return window.MusicAPI.Rating.getRating();
    });

    it('has a low rating', function () {
      expect(this.result).to.equal(1);
    });
  });

  describe('when \'thumbs up\'-ed', function () {
    browserUtils.execute(function thumbsUpTrack () {
      window.MusicAPI.Rating.toggleThumbsUp();
    });
    before(function waitForRatingChange (done) {
      setTimeout(done, 1000);
    });
    browserUtils.execute(function thumbsUpTrack () {
      return window.MusicAPI.Rating.getRating();
    });

    it('has a high rating', function () {
      expect(this.result).to.equal(5);
    });
  });
});
