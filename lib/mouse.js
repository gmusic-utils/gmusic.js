if (typeof window.Mouse === 'undefined') {
  window.Mouse = {
    clickAtLocation: function (element, pageX, pageY) {
      var ev = document.createEvent('MouseEvent');
      ev.initMouseEvent(
        'click',
        true /* bubble */,
        true /* cancelable */,
        window, null,
        pageX, pageY, pageX, pageY, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /*left*/,
        null
      );

      element.dispatchEvent(ev);
    }
  };
}
