// Load in our dependencies
var assert = require('assert');
var browser = require('wd').remote();

// Control a browser
browser.init({browserName: 'chrome'}, function() {
  browser.get("http://admc.io/wd/test-pages/guinea-pig.html", function() {
    browser.title(function handleTitle (err, title) {
      // title.should.include('WD');
      console.log(title);
      browser.elementById('i am a link', function handleLink (err, el) {
        browser.clickElement(el, function() {
          /* jshint evil: true */
          browser.eval("window.location.href", function handleEval (err, href) {
            console.log(href);
            // href.should.include('guinea-pig2');
            browser.quit();
          });
        });
      });
    });
  });
});
