function Keyboard(win) {
  // Save window for later
  this.win = win;
}
// Define constants
Keyboard.KEY_UP = 0x26;
Keyboard.KEY_DOWN = 0x28;
// Define methods
Keyboard.prototype = {
  sendKey: function (element, key) {
    var ev = this.win.document.createEvent('Events');
    ev.initEvent('keydown', true, true);
    ev.keyCode = key;
    ev.which = key;

    element.dispatchEvent(ev);
  }
};

// Export Keyboard constructor
module.exports = Keyboard;
