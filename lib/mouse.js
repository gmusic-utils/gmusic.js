// Define our constructor
function Mouse(win) {
  // Save window for later
  this.win = win;
}
Mouse.prototype = {
  clickAtLocation: function (element, pageX, pageY) {
    // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
    var ev = new MouseEvent('click', {
      // Metadata for event
      bubbles: true,
      cancelable: true,
      view: this.win,

      // Coordinates
      screenX: pageX,
      screenY: pageY,
      clientX: pageX,
      clientY: pageY,

      // Information about action
      button: 0 // left click
    });
    element.dispatchEvent(ev);
  }
};

// Expose our constructor
module.exports = Mouse;
