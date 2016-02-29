// Load in dependencies
var asserters = require('wd/lib/asserters');
var Asserter = asserters.Asserter;

// Define our helpers
exports.playAnything = function () {
  before(function playAnythingFn (done) {
    // Find and click the I'm Feeling Lucky mix
    var browser = this.browser;
    browser.waitForElementByCssSelector('[data-id=shuffle-my-library]', asserters.isDisplayed,
        10000, 100, function handleElement (err, el) {
      // If there was an error, callback with it
      if (err) {
        return done(err);
      }

      // Otherwise, click our element
      el.click(done);
    });
  });
};

exports.waitForPlaybackStart = function () {
  before(function waitForPlaybackStartFn (done) {
    // Wait for playback slider to move
    // DEV: This is intentionally different from play-pause button which is library behavior
    var sliderValue;
    this.browser.waitFor(new Asserter(function checkSlider (browser, cb) {
      browser.elementById('material-player-progress', function handleElement (err, el) {
        // If there was an error, callback with it
        if (err) {
          return cb(err);
        }

        // Otherwise, get the slide value
        browser.getAttribute(el, 'aria-valuenow', function handleValue (err, val) {
          // If there was an error, callback with it
          if (err) {
            return cb(err);
          }

          // Otherwise, if there is a value, it's non-negative (e.g. not zero), and it has changed, return true
          if (val && parseInt(val, 10) && sliderValue !== val) {
            return cb(null, true);
          }

          // Otherwise, save the value and return false
          sliderValue = val;
          return cb(null, false);
        });
      });
    }), 10000, 100, done);
  });
};

exports.waitForPlaybackPause = function () {
  before(function waitForPlaybackPauseFn (done) {
    // Wait for playback slider to stop moving
    var sliderValue;
    this.browser.waitFor(new Asserter(function checkSlider (browser, cb) {
      browser.elementById('material-player-progress', function handleElement (err, el) {
        // If there was an error, callback with it
        if (err) {
          return cb(err);
        }

        // Otherwise, get the slide value
        browser.getAttribute(el, 'aria-valuenow', function handleValue (err, val) {
          // If there was an error, callback with it
          if (err) {
            return cb(err);
          }

          // Otherwise, if there is a value, it's non-negative (e.g. not zero), and it has changed, return true
          if (val && parseInt(val, 10) && sliderValue === val) {
            return cb(null, true);
          }

          // Otherwise, save the value and return false
          sliderValue = val;
          return cb(null, false);
        });
      });
    }), 10000, 100, done);
  });
};
