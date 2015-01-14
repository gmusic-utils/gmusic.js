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

// Resolve the browser scripts
// https://github.com/kbhomes/radiant-player-mac/blob/83f3622977f7b4b3f451422f9b025b03fb385ad6/radiant-player-mac/AppDelegate.m#L874-L894
// TODO: Use bundled script instead of these one-offs
var scripts = [
  fs.readFileSync(__dirname + '/../../lib/main.js', 'utf8'),
  fs.readFileSync(__dirname + '/../../lib/keyboard.js', 'utf8'),
  fs.readFileSync(__dirname + '/../../lib/mouse.js', 'utf8')
];

// Define helpers for interacting with the browser
exports.openMusic = function (options) {
  // Fallback our options and default URL
  options = options || {};
  var url = options.url || 'https://play.google.com/music/listen';

  // Execute many async steps
  before(function startBrowser () {
    this.browser = wd.remote();
    // DEV: To debug selenium interactions
    //   Enable thes line
    // global.browser = this.browser;
    //    and run the following inside of a `node` repl
    // process.exit = function () {};
    // process.argv = ['node', '_mocha', '--timeout', '10000'];
    // require('mocha/bin/_mocha');
    //    when mocha is completed, access `browser` as a Selenium session
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
  before(function evalScripts (done) {
    var browser = this.browser;
    async.forEachSeries(scripts, function evalScript (script, cb) {
      browser.execute(script, cb);
    }, done);
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
    console.log(args);
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
