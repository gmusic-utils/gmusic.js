var assert = require('assert');
var webdriver = require('selenium-webdriver');

describe('Google Search', function() {
  it('should work', function() {
    var driver = new webdriver.Builder().build();

    var searchBox = driver.findElement(webdriver.By.name('q'));
    searchBox.sendKeys('webdriver');
    searchBox.getAttribute('value').then(function(value) {
      assert.equal(value, 'webdriver');
    });

    driver.quit();
  });
});
