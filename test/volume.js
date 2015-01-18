// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');

// Start our tests
describe('Google Music', function () {
  browserUtils.openMusic();
  browserUtils.execute(function getVolume () {
    return window.MusicAPI.Volume.getVolume();
  });

  it('has a volume amount', function () {
    expect(this.result).to.be.a('number');
    expect(this.result).to.be.at.least(0);
    expect(this.result).to.be.at.most(100);
  });

  describe('when volume is increased', function () {
    before(function saveOldVolume () {
      this.volume = this.result;
    });
    after(function cleanup () {
      delete this.volume;
    });
    browserUtils.execute(function getNewVolume () {
      return window.MusicAPI.Volume.increaseVolume(10);
    });
    browserUtils.execute(function getNewVolume () {
      return window.MusicAPI.Volume.getVolume();
    });

    it('has an increased volume', function () {
      var newVolume = this.result;
      expect(newVolume).to.equal(
    });

    describe('when volume is decreased', function () {
      it('has the original volume', function () {
        // Placeholder for linter
      });

      describe('when volume is set to 0', function () {
        it('has a volume of 0', function () {
          // Placeholder for linter
        });

        describe('when volume is set to 50', function () {
          it('has a volume of 50', function () {
            // Placeholder for linter
          });
        });
      });
    });
  });
});
