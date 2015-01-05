// Load in our dependencies
var assert = require('assert');
var async = require('async');
var browser = require('wd').remote();

// Dump cookies via node CLI
/*
node

// Inside of CLI
var browser = require('wd').remote();
browser.init({browserName: 'chrome'}, console.log);
// Wait for browser window to open
browser.get('https://play.google.com/music/listen', console.log);
// Wait for redirect to accounts.google.com
// Manually log in to page
// When you are logged in to Google Music, dump the output of the following into `cookies.json`
browser.allCookies(function (err, cookies) { console.log(JSON.stringify(cookies, null, 4))});
*/

// Downloaded music via musopen
// https://musopen.org/music/1333/wolfgang-amadeus-mozart/the-marriage-of-figaro-k-492/
// Credentials: musopen@mt2014.com / password

var cookies = require('./cookies');

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
        browser.title(function handleTitle (err, title) {
          console.log(title);
        });
      });
    });
      // // title.should.include('WD');
      // console.log(title);
      // browser.elementById('i am a link', function handleLink (err, el) {
      //   browser.clickElement(el, function() {
      //     /* jshint evil: true */
      //     browser.eval("window.location.href", function handleEval (err, href) {
            // console.log(href);
            // href.should.include('guinea-pig2');
            // browser.quit();
    //       });
    //     });
    //   });
    // });
  });
});
