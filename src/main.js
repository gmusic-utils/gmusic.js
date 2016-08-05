import GMusic from './gmusic';
import Track from './structs/Track';

GMusic.Track = Track;

if (typeof global.define === 'function' && global.define.amd) {
  global.define('gmusic.js', [], () => GMusic);
} else if (typeof module === 'object' && module.exports) {
  module.exports = GMusic;
} else {
  window.GMusic = GMusic;
}
