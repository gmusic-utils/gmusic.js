// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');

// Start our tests
describe('Google Music', function () {
  browserUtils.openMusic({
    testName: 'Volume control test'
  });
  browserUtils.execute(function getVolume () {
    return window.gmusic.volume.getVolume();
  });

  it('has a volume amount', function () {
    expect(this.result).to.be.a('number');
    expect(this.result).to.be.at.least(0);
    expect(this.result).to.be.at.most(100);
  });

  describe('when volume is set to 50', function () {
    browserUtils.execute(function getNewVolume () {
      return window.gmusic.volume.setVolume(50);
    });
    browserUtils.execute(function getNewVolume () {
      return window.gmusic.volume.getVolume();
    });

    it('has a volume of 50', function () {
      expect(this.result).to.equal(50);
    });

    describe('when volume is increased', function () {
      browserUtils.execute(function getNewVolume () {
        return window.gmusic.volume.increaseVolume(10);
      });
      browserUtils.execute(function getNewVolume () {
        return window.gmusic.volume.getVolume();
      });

      it('has an increased volume', function () {
        expect(this.result).to.equal(60);
      });

      describe('when volume is decreased', function () {
        browserUtils.execute(function getNewVolume () {
          return window.gmusic.volume.decreaseVolume(10);
        });
        browserUtils.execute(function getNewVolume () {
          return window.gmusic.volume.getVolume();
        });

        it('has the original volume', function () {
          expect(this.result).to.equal(50);
        });
      });
    });

    // DEV: This is necessary to verify `setVolume` works and isn't the original setting only
    describe('when volume is set to 0', function () {
      browserUtils.execute(function getNewVolume () {
        return window.gmusic.volume.setVolume(0);
      });
      browserUtils.execute(function getNewVolume () {
        return window.gmusic.volume.getVolume();
      });

      it('has a volume of 0', function () {
        expect(this.result).to.equal(0);
      });
    });
  });
});
