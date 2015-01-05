// Load in our dependencies
var assert = require('assert');
var async = require('async');
var browser = require('wd').remote();

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
