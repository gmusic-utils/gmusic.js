// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');

// Start our tests
describe('A session with Google Music', function () {
  browserUtils.openMusic();

  browserUtils.execute(function getPlayPauseStatus () {
    return !!window.MusicAPI;
  });

  it('has a Google Music API', function () {
    expect(this.result).to.equal(true);
  });
});
