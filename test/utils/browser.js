// Load in dependencies
var assert = require('assert');
var fs = require('fs');
var functionToString = require('function-to-string');
var async = require('async');
var wd = require('wd');

// Resolve cookies with helpful messaging
var cookiesJson;
try {
  cookiesJson = fs.readFileSync(__dirname + '/../cookies.json');
} catch (err) {
  throw new Error('Could not read `test/cookies.json`. Please make sure it exists. ' +
      'If it doesn\'t, follow the steps in https://github.com/twolfson/google-music.js#testing');
}
var cookies = JSON.parse(cookiesJson);

// Resolve the compiled script
var script = fs.readFileSync(__dirname + '/../../dist/google-music.js', 'utf8');

// Define helpers for interacting with the browser
exports.openMusic = function (options) {
  // Fallback our options and default URL
  // DEV: We choose the Artists page because it has a "Shuffle" button
  //   In non-paid Google Music, there is a 15 second ad that plays for I'm Feeling Lucky radio
  //   "Shuffle artists" is a much better and faster alternative
  options = options || {};
  var url = options.url || 'https://play.google.com/music/listen#/artists';

  // Execute many async steps
  before(function startBrowser () {
    this.browser = wd.remote();
    global.browser = this.browser;
  });
  before(function openBrowser (done) {
    this.browser.init({browserName: 'chrome'}, done);
  });
  before(function navigateToMusicBeforeLogin (done) {
    this.browser.get(url, done);
  });
  before(function handleLoginViaCookies (done) {
    var browser = this.browser;
    async.forEach(cookies, function setCookies (cookie, cb) {
      // If the cookie is not for .google.com, skip it
      // DEV: As discovered by Burp suite's repeater, we only need `SID`, `HSID`, `SSID` but this is simpler
      if (cookie.domain !== '.google.com') {
        process.nextTick(cb);
      // Otherwise, set it
      } else {
        browser.setCookie(cookie, cb);
      }
    }, done);
  });
  before(function navigateToMusicAfterLogin (done) {
    this.browser.get(url, done);
  });
  before(function loadGoogleMusicConstructor (done) {
    this.browser.execute(script, done);
  });
  exports.execute(function startGoogleMusicApi () {
    window.googleMusic = new window.GoogleMusic(window);
  });

  // If we want to want to kill the session, clean it up
  // DEV: This is useful for inspecting state of a session
  var killBrowser = options.killBrowser === undefined ? true : options.killBrowser;
  if (killBrowser) {
    after(function killBrowserFn (done) {
      this.browser.quit(done);
    });
  }
  after(function cleanup () {
    delete this.browser;
  });
};

// Helper to assert we have a browser started always
exports.assertBrowser = function () {
  before(function assertBrowser () {
    assert(this.browser, '`this.browser` is not defined. Please make sure `browserUtils.openMusic()` has been run.');
  });
};

// TODO: Consider creating `mocha-wd`
exports.execute = function () {
  // Save arguments in an array
  var args = [].slice.call(arguments);

  // If the first argument is a function, coerce it to a string
  var evalFn = args[0];
  if (typeof evalFn === 'function') {
    args[0] = functionToString(evalFn).body;
  }

  // Run the mocha bindings
  exports.assertBrowser();
  before(function runExecute (done) {
    // Add on a callback to the arguments
    var that = this;
    args.push(function handleResult (err, result) {
      // Save the result and callback
      that.result = result;
      done(err);
    });

    // Execute our request
    this.browser.execute.apply(this.browser, args);
  });
  after(function cleanup () {
    delete this.result;
  });
};
