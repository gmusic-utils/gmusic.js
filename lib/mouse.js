// Define our constructor
function Mouse(win) {
  // Save window for later
  this.win = win;
}
Mouse.prototype = {
  clickAtLocation: function (element, pageX, pageY) {
    var ev = this.win.document.createEvent('MouseEvent');
    ev.initMouseEvent(
      'click',
      true, // bubble
      true, // cancelable
      this.win, null,
      pageX, pageY, pageX, pageY, // coordinates
      false, false, false, false, // modifier keys
      0, // left
      null
    );

    element.dispatchEvent(ev);
  }
};

// Expose our constructor
module.exports = Mouse;
