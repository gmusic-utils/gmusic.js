// Load in dependencies
var Asserter = require('wd/lib/asserters').Asserter;

// Define our helpers
exports.waitForPlaybackStart = function () {
  before(function waitForPlaybackStart (done) {
    // Wait for playback slider to move
    // DEV: This is intentionally different from play-pause button which is library behavior
    var sliderValue;
    this.browser.waitFor(new Asserter(function checkSlider (browser, cb) {
      browser.elementById('slider', function handleElement (err, el) {
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
    }), 2000, 100, done);
  });
};
