#!/usr/bin/env node
// Load our dependencies
var assert = require('assert');
var fs = require('fs');

// Load in our CHANGELOG
var content = fs.readFileSync('CHANGELOG.md');

// Verify we have a tag to find
var version = process.env.FOUNDRY_VERSION;
assert(version, 'Expected `env.FOUNDRY_VERSION` to be defined but it was not');

// Verify our tag is present in the CHANGELOG
// e.g. `1.2.3 - Hello world` (single line)
// e.g. `**1.2.3**\n- Hello world\n- Goodbye moon` (multi-line)
// DEV: `1.2.3` -> `/\n[^0-9]*1\.2\.3/`
var versionRegExp = new RegExp('\n[^0-9]*' + version.replace(/\./g, '\\.'));
if (!versionRegExp.test(content)) {
  throw new Error('Expected `CHANGELOG.md` to contain "' + version + '" but it wasn\'t found. ' +
    'Please verify we added `CHANGELOG` notes before releasing.');
}
