// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');
var browserMusicUtils = require('./utils/browser-music');

// Start our tests
describe.skip('An unrated track in Google Music', function () {
  it('has no rating', function () {
    // Placeholder for linter
  });
});

describe.skip('A track in Google Music', function () {
  browserUtils.openMusic({killBrowser: false});

  describe('when \'thumbs up\'-ed', function () {
    it('has a high rating', function () {
      // Placeholder for linter
    });
  });

  describe('when \'thumbs down\'-ed', function () {
    it('has a low rating', function () {
      // Placeholder for linter
    });
  });
});
