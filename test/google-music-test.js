// Load in dependencies
var assert = require('assert');
var googleMusic = require('../');

// Start our tests
describe('google-music', function () {
  it('returns awesome', function () {
    assert.strictEqual(googleMusic(), 'awesome');
  });
});
