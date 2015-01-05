// Load in all of the corresponding files
require('./keyboard');
require('./main');
require('./mouse');

// Export their info
module.exports = {
  keyboard: window.Keyboard,
  music: window.MusicAPI,
  mouse: window.Mouse,
};
