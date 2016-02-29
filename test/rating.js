// Load in dependencies
var expect = require('chai').expect;
var browserUtils = require('./utils/browser');
var browserMusicUtils = require('./utils/browser-music');

// Start our tests
describe('A track in Google Music', function () {
  browserUtils.openMusic({
    testName: 'Rating test',
    url: 'https://play.google.com/music/listen#/album//this-is-an-album-artist/this-is-an-album'
  });
  browserUtils.execute(function setupHooks () {
    window.ratingCount = 0;
    window.gmusic.on('change:rating', function ratingChanged (rating) {
      window.ratingCount += 1;
    });
  });
  browserUtils.execute(function playViaApi () {
    window.gmusic.playback.playPause();
    window.gmusic.playback.toggleRepeat(window.GMusic.Playback.SINGLE_REPEAT);
  });
  browserMusicUtils.waitForPlaybackStart();

  describe('when \'thumbs up\'-ed', function () {
    browserUtils.execute(function resetRating () {
      window.gmusic.rating.resetRating();
    });
    browserUtils.execute(function thumbsUpTrack () {
      window.gmusic.rating.toggleThumbsUp();
    });
    browserUtils.execute(function thumbsUpTrack () {
      return window.gmusic.rating.getRating();
    });

    it('has a high rating', function () {
      expect(this.result).to.equal('5');
    });

    describe('when switched to neutral', function () {
      browserUtils.execute(function thumbsUpTrack () {
        window.gmusic.rating.toggleThumbsUp();
      });
      browserUtils.execute(function thumbsUpTrack () {
        return window.gmusic.rating.getRating();
      });

      it('has no rating', function () {
        expect(this.result).to.equal('0');
      });

      describe('when a rating is set via `setRating`', function () {
        browserUtils.execute(function setRating () {
          window.gmusic.rating.setRating('5');
        });
        browserUtils.execute(function setRating () {
          return window.gmusic.rating.getRating();
        });
        it('becomes set', function () {
          expect(this.result).to.equal('5');
        });

        describe('and when set again', function () {
          browserUtils.execute(function setRating () {
            window.gmusic.rating.setRating('5');
          });
          browserUtils.execute(function setRating () {
            return window.gmusic.rating.getRating();
          });

          it('remains set', function () {
            expect(this.result).to.equal('5');
          });
        });
      });
    });

    describe('when reset', function () {
      browserUtils.execute(function resetRating () {
        window.gmusic.rating.resetRating();
      });
      browserUtils.execute(function getRating () {
        return window.gmusic.rating.getRating();
      });

      it('has no rating', function () {
        expect(this.result).to.equal('0');
      });
    });
  });

  describe('when \'thumbs down\'-ed', function () {
    browserUtils.execute(function resetRating () {
      window.gmusic.rating.resetRating();
    });
    browserUtils.execute(function thumbsDownTrack () {
      // DEV: Warning this will skip to next track
      window.gmusic.rating.toggleThumbsDown();
    });
    // DEV: Wait for the next track to start
    browserMusicUtils.waitForPlaybackStart();
    browserUtils.execute(function thumbsDownTrack () {
      return window.gmusic.rating.getRating();
    });

    it('has a low rating', function () {
      expect(this.result).to.equal('1');
    });

    describe('a hook result', function () {
      browserUtils.execute(function getHookResult () {
        return window.ratingCount;
      });

      it('was triggered', function () {
        expect(this.result).to.be.at.least(2);
      });
    });
  });
});
