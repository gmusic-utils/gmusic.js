# google-music.js

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
    - `ALL_SHUFFLE` will shuffle between all tracks
    - `NO_SHUFFLE` will play the tracks in the order they were added
    - We created constants named `Playback.ALL_SHUFFLE` or `Playback.NO_SHUFFLE`

#### `Playback.toggleShuffle()`
Toggle to between shuffle being active or inactive

#### `Playback.getRepeat()`
Retrieve the current setting for repeat

**Returns:**

- retVal `String` - Current setting for repeat (e.g. `LIST_REPEAT`, `SINGLE_REPEAT`, `NO_REPEAT`)
    - `LIST_REPEAT` will repeat the queue when it reaches the last song
    - `SINGLE_REPEAT` will repeat the current song indefinitely
    - `NO_REPEAT` will not repeat the queue
    - We created constants named `Playback.LIST_REPEAT`, `Playback.SINGLE_REPEAT`, `Playback.NO_REPEAT`

#### `Playback.changeRepeat(mode)`
Change the current setting for repeat

- mode `String` - Optional mode to change repeat to
    - If not specified, we will toggle to the next mode
        - The order is `NO_REPEAT`, `LIST_REPEAT`, `SINGLE_REPEAT`
    - Valid values are `NO_REPEAT`, `LIST_REPEAT`, `SINGLE_REPEAT`
        - See `Playback.getRepeat()` for meaning

#### `Playback.toggleVisualization()`
Trigger a visualization for the track. This is typically album art.

**This is an untested method.**

### Rating
`MusicAPI.Rating` exposes interfaces to the rating the current song.

#### `Rating.isStarsRatingSystem()`
Retrieve whether the rating system is star based or not (as opposed to thumbs which is the default).

**Returns:**

- retVal `Boolean` - Indicator for rating system being star based
    - If `true`, then it is star based. Otherwise, it is thumb based.

#### `Rating.getRating()`
Retrieve the rating for the current track.

**Returns:**

- retVal `String` - Rating for current song. This varies from 0 to 5
    - If 0, then there has been no rating
    - On a thumbs system, thumbs down is 1 and thumbs up is 5

#### `Rating.toggleThumbsUp()`
Switch between thumbs up and no thumbs up for the current track. If thumbs down was set, this will remove the thumbs down rating.

#### `Rating.toggleThumbsDown()`
Switch between thumbs down and no thumbs down for the current track. If thumbs up was set, this will remove the thumbs up rating.

#### `Rating.setStarRating(rating)`
Set the star rating for the current track

- rating `String` - Rating to set for the current track. This should be between 1 and 5

**This is an untested method**

### Extras
`MusicAPI.Extras` is a collection of utility functions for Google Music

#### `Extras.getSongURL()`
Retrieve the URL of the current song for sharing

**This is an untested method**

**Returns:**

- retVal `String` - URL for current song

### Hooks
Hooks are currently defined via defining and overriding on `window.GoogleMusicApp`.

```js
window.GoogleMusicApp.notifySong = function (title, artist, album, art, duration) {
};
```

#### `notifySong(title, artist, album, art, duration)`
Triggers when a song changes

```js
window.GoogleMusicApp.notifySong = function (title, artist, album, art, duration) {
};
```

- title `String` - Name of the song
- artist `String` - Artist of the song
- album `String` - Album of the song
- art `String` - URL for album art of the song
- duration `Number` - Seconds that the track will last for

#### `shuffleChanged(mode)`
Triggers when shuffle is toggled

```js
window.GoogleMusicApp.shuffleChanged = function (mode) {
};
```

- mode `String` - Mode that shuffle changed to
    - Values are consistent with `Playback.getShuffle()`

#### `repeatChanged(mode)`
Triggers when repeat is toggled

```js
window.GoogleMusicApp.repeatChanged = function (mode) {
};
```

- mode `String` - Mode that repeat changed to
    - Values are consistent with `Playback.getRepeat()`

#### `playbackChanged(mode)`
Triggers when a song is started, paused, or stopped

```js
window.GoogleMusicApp.playbackChanged = function (mode) {
};
```

- mode `String` - Phase that a song is in (e.g. 0, 1, 2)
    - 0 - Song is stopped
    - 1 - Song is paused
    - 2 - Song is playing
    - Values are available via `Playback.STOPPED`, `Playback.PAUSED`, and `Playback.PLAYING`

#### `playbackTimeChanged(currentTime, totalTime)`
Triggers when playback shifts

```js
window.GoogleMusicApp.playbackTimeChanged = function (currentTime, totalTime) {
};
```

- currentTime `Number` - Milliseconds of how far a track has progressed
- totalTime `Number` - Milliseconds of how long a track is

#### `ratingChanged(rating)`
Triggers when the current song is rated

```js
window.GoogleMusicApp.ratingChanged = function (rating) {
};
```

- rating `Number` - Rating the current song changed to
    - Consistent with values provided by `Rating.getRating()`

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via `npm run lint` and test via `npm test`.

### Testing
Currently, we require a personal Google account exclusively for testing. We are using the following songs (first 3 tracks):

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
