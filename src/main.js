import GMusic from './gmusic';

if (typeof global.define === 'function' && global.define.amd) {
  global.define('jquery', [], () => GMusic);
} else if (typeof global.module === 'object' && module.exports) {
  module.exports = GMusic;
} else {
  window.GMusic = GMusic;
}
