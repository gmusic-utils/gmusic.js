# google-music.js [![Build status](https://travis-ci.org/twolfson/google-music.png?branch=master)](https://travis-ci.org/twolfson/google-music)

Browser-side JS library for controlling [Google Music][].

[Google Music]: https://play.google.com/music/

This was built as part of [google-music-webkit][], a [node-webkit][] wrapper around [Google Music][]. It was forked from [radiant-player-mac@v1.3.1][], developed and created by [Sajid Anwar][] and [James Fator][] to make it reusable and well tested.

[google-music-webkit]: https://github.com/twolfson/google-music-webkit
[node-webkit]: https://github.com/rogerwang/node-webkit
[radiant-player-mac@v1.3.1]: https://github.com/kbhomes/radiant-player-mac/tree/v1.3.1
[Sajid Anwar]: https://github.com/kbhomes/
[James Fator]: http://jamesfator.com/

## Getting Started
Install the module with: `npm install google-music`

```js
// Load google music onto `window`
void require('google-music');

// Access volume
window.MusicAPI.Volume.getVolume(); // 50 (ranges from 0 to 100)
```

Currently, there is no AMD, UMD, or vanilla build of `google-music.js`. If you would like to see one, please create an issue.

## Documentation
`google-music.js` exposes its API on `window.MusicAPI`.

### Volume
`MusicAPI.Volume` exposes interfaces to the volume controls of Google Music. Volume can range from 0 to 100.

#### `Volume.getVolume()`
Retrieve the current volume setting

**Returns:**

- retVal `Number` - Integer from 0 to 100 representing volume

#### `Volume.getVolume()`
Retrieve the current volume setting

**Returns:**

- retVal `Number` - Integer from 0 to 100 representing volume

#### `Volume.setVolume(vol)`
Change the volume setting

- vol `Number` - Integer to set volume to

#### `Volume.increaseVolume(amount)`
Raise the volume by an amount

- amount `Number` - Optional number to raise volume by
    - For example, if volume is 50 and amount is 5, then the volume will change to 55
    - If we exceed 100 when adding new values, volume will stop at 100
    - By default, this is 1

#### `Volume.decreaseVolume(amount)`
Lower the volume by an amount

- amount `Number` - Optional number to lower volume by
    - For example, if volume is 50 and amount is 5, then the volume will change to 45
    - If we exceed 0 when subtracting new values, volume will stop at 0
    - By default, this is 1

### Playback
`MusicAPI.Playback` exposes interfaces to the state of music playback and its behavior (e.g. shuffle).

#### `Playback.getPlaybackTime()`
Retrieve the current progress in a song

**Returns:**

- retVal `Number` - Integer representing milliseconds from the start of the song

#### `Playback.setPlaybackTime(milliseconds)`
Jump the current song to a time

- milliseconds `Number` - Integer representing milliseconds to jump the current track to

#### `Playback.playPause()`
Toggle between play and pause for the current song

**This will not work if there are no songs in the queue.**

#### `Playback.forward()`
Move to the next song

#### `Playback.rewind()`
Move to the previous song

#### `Playback.getShuffle()`
Retrieve the status of shuffle

**Returns:**

- retVal `String` - Current state of shuffle (e.g. `ALL_SHUFFLE`, `NO_SHUFFLE`)
    - This can be `Playback.ALL_SHUFFLE` or `Playback.NO_SHUFFLE`
    - TODO: Verify these are the states

#### `Playback.toggleShuffle()`
Toggle to between shuffle being active or inactive

// TODO: Document window.playbackChanged and similar along with their constants

## Untested
These are methods which are difficult to test as they require enabling a Google Music labs setting or visual queue.

- toggleVisualization
- getRating
- getSongURL
- setStarRating

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via `npm run lint` and test via `npm test`.

### Testing
Currently, we require a personal Google account exclusively for testing. It should be entirely empty except for a single track for Google Music. We are using:

> Credentials: musopen@mt2014.com / password

https://musopen.org/music/1333/wolfgang-amadeus-mozart/the-marriage-of-figaro-k-492/

> Music cannot be uploaded via webdriver instance nor incognito window
>
> If you don't want to contaminate your personal account, create a new user profile in Chrome.

Once your Google account is registered and the music is uploaded, extract the cookies for our test suite via:

```
# Enter into the node CLI
node

# Inside of the CLI, dump our cookies
var browser = require('wd').remote();
browser.init({browserName: 'chrome'}, console.log);
// Wait for browser window to open
browser.get('https://play.google.com/music/listen', console.log);
// Wait for redirect to accounts.google.com
// Manually log in to page
// When you are logged in to Google Music, dump the output of the following into `test/cookies.json`
browser.allCookies(function (err, cookies) { fs.writeFileSync('test/cookies.json', JSON.stringify(cookies, null, 4), 'utf8'); });
```

Finally, we can run the test suite:

```bash
# Start up a Selenium server
npm run webdriver-manager-start &

# Run our tests
npm test
```

## Donating
Support this project and [others by twolfson][gratipay] via [gratipay][].

[![Support via Gratipay][gratipay-badge]][gratipay]

[gratipay-badge]: https://cdn.rawgit.com/gratipay/gratipay-badge/2.x.x/dist/gratipay.png
[gratipay]: https://www.gratipay.com/twolfson/

## License
All files were originally licensed at `5ccfa7b3c7bc5231284f8e42c6a2f2e7fe1e1532` under the MIT license. This can be viewed its [`LICENSE.md`][]. It has been renamed to [LICENSE-MIT][] for ease of disambiguity.

[`LICENSE.md`]: https://github.com/twolfson/google-music.js/blob/5ccfa7b3c7bc5231284f8e42c6a2f2e7fe1e1532/LICENSE.md
[LICENSE-MIT]: LICENSE-MIT

After this commit, all alterations made by Todd Wolfson and future contributors are released to the Public Domain under the [UNLICENSE][].

[UNLICENSE]: UNLICENSE
