// Load in dependencies
var assert = require('assert');
var fs = require('fs');
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

// Define helpers for interacting with the browser
// Open Google Music
browser.init({browserName: 'chrome'}, function () {
  browser.get('https://play.google.com/music/listen', function () {
    async.forEach(cookies, function setCookies (cookie, cb) {
      // If the cookie is not for .google.com, skip it
      if (cookie.domain !== '.google.com') {
        process.nextTick(cb);
      // Otherwise, set it
      } else {
        browser.setCookie(cookie, cb);
      }
    }, function handleSetCookies (err) {
      // If there was an error, throw it
      if (err) {
        throw err;
      }

      // Otherwise, navigate back to Google Music
      browser.get('https://play.google.com/music/listen', function () {
        // Load in the scripts in order
        // https://github.com/kbhomes/radiant-player-mac/blob/83f3622977f7b4b3f451422f9b025b03fb385ad6/radiant-player-mac/AppDelegate.m#L874-L894
        var scripts = [
          __dirname + '/../lib/main.js',
          __dirname + '/../lib/keyboard.js',
          __dirname + '/../lib/mouse.js'
        ];
        async.map(scripts, function loadScript (filepath, cb) {
          fs.readFile(filepath, 'utf8', cb);
        }, function handleScriptContents (err, scriptContents) {
          // If there was an error, throw it
          if (err) {
            throw err;
          }

          // Otherwise, eval each script in order
          async.forEachSeries(scriptContents, function evalScript (scriptContent, cb) {
            browser.execute(scriptContent, cb);
          }, function handleEvals (err) {
            // If there was an error, throw it
            if (err) {
              throw err;
            }

            // Otherwise, continue
            browser.title(function handleTitle (err, title) {
              console.log(title);
            });
          });
        });
      });
    });
  });
});
