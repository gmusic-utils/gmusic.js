# gmusic.js changelog
6.1.0 - Add new methods `isPodcast`, `forwardThirty`, `rewindTen` to allow controlling podcast content.

6.0.0 - `playback.getPlaybackTime` renamed to `playback.getCurrentTime`, `playback.setPlaybackTime` renamed to `playback.setCurrentTime`, `playback.getSongInfo` renamed to `playback.getCurrentTrack`, `extras.getSongURL` renamed to `extras.getTrackURL`, `art` property has become `albumArt`, new method `playback.getTotalTime`, new method `playback.isPlaying`, SELECTORS might have changed a bit so be careful

5.0.0 - Added new methods `playback.setShuffle`, `playback.setRepeat`, `playback.getSongInfo`, and `playback.getPlaybackState`. Also modified `setRepeat` to handle the old functionality of `toggleRepeat` which now only toggles states. Added new documentation for methods.

4.2.1 - Repaired i18n support by removing English only strings via @ jostrander in #39 and #40

4.2.0 - Adjusted hooks to only fire when actual changes occur

4.1.1 - Added CHANGELOG update verification

4.1.0 - Integrated Browserstack to test suite, added `resetRating`, and fixed up failing one-offs

4.0.4 - Corrected documentation of the `change:playback-time` event

4.0.3 - Corrected license in package.json to SPDX

4.0.2 - Documented release process

4.0.1 - Removed branch whitelist from `.travis.yml`

4.0.0 - Renamed repository from `google-music` to `gmusic.js`

3.3.4 - Integrated Travis CI

3.3.3 - Added missing `webdriver-manager-update` command/docs and added `npm run test-windows`

3.3.2 - Added CONTRIBUTING.md as part of resolving #13

3.3.1 - Corrected selectors for title/album art via @MarshallOfSound in #15

3.3.0 - Fixed up one-offs in test suite and resolved errors from #12

3.2.0 - Added assertions for elements and made selectors cross-version

3.1.1 - Added `foundry` for release

3.1.0 - Removed duplicate events from `change:playback` event and fixed "Stop" detection

3.0.0 - Updated integration to handle Material design release

2.0.5 - Fixed `package.main` reference

2.0.4 - Moved from `setStarRating` to `setRating`, renamed `changeRepeat` to `toggleRepeat`, and moved `notifySong` to provide duration in millseconds

2.0.3 - Moved to EventEmitter for hooks

2.0.2 - Refactored internals, moved constants as class properties

2.0.1 - Fixed style issues and moved all method keys to lower case for OOP consistency

2.0.0 - Moved to constructor and off of `window` to support `node-webkit`

1.2.0 - Added build scripts for `bower` and vanilla JS

1.1.0 - Completed tests and fixed bug in `Rating.getRating()`

1.0.0 - Initial release
