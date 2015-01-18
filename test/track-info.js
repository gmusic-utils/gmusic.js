// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');
var browserMusicUtils = require('./utils/browser-music');

// Start our tests
describe('A Google Music instance playing no music', function () {
  // Load up 'Unknown Album - Unknown Artist'
  browserUtils.openMusic({
    killBrowser: false,
    url: 'https://play.google.com/music/listen#/album'
  });

  // TODO: We should navigate to a specific album and play the first song
  it.skip('has no artist/track info', function () {
    // Placeholder for linter
  });

  describe('when we are playing music', function () {
    it('has the artist/track info', function () {
      // Placeholder for linter
    });
  });
});
