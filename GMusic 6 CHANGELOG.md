Changelog
---------

In general

* `Song` renamed to `Track` (*Google Play Music internally refers to things as tracks*)

### Playback

* `getPlaybackTime` renamed to `getCurrentTime`
* `setPlaybackTime` renamed to `setCurrentTime`
* `getSongInfo` renamed to `getCurrentTrack`
* Track's now have an `albumArt` prop instead of `art`
* New method `getTotalTime`
* New method `isPlaying`
* SELECTORS might have changed a bit due to new bindings
