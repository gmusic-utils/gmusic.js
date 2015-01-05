// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');

// Start our tests
describe('A new session with Google Music', function () {
  browserUtils.openMusic();
  browserUtils.execute(function getPlayPauseStatus () {
    return !!window.MusicAPI;
  });

  it('has a Google Music API', function () {
    expect(this.result).to.equal(true);
  });

  it.skip('is not playing any music', function () {

  });

  describe.skip('when we are playing music', function () {
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
