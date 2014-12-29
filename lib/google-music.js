// Load in all of the corresponding files
require('./appbar');
require('./keyboard');
require('./main');
require('./mouse');
require('./navigation');

// Export their info
module.exports = {
  appbar: window.GMAppBar,
  keyboard: window.Keyboard,
  music: window.MusicAPI,
  mouse: window.Mouse,
  navigation: window.GMNavigation
};
