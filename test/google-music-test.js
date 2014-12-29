// Load in our dependencies
var assert = require('assert');
var browser = require('wd').remote();

// Open Google Music
browser.init({browserName: 'chrome'}, function() {
  browser.get('https://play.google.com/music/listen', function() {
    browser.title(function handleTitle (err, title) {
      console.log(title);
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
