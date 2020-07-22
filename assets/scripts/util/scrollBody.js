// scrollBody

import appState from '../util/appState';

function scrollBody(element, offset, duration, delay) {
  var headerOffset = $('.site-header').outerHeight();
  if (typeof offset === "undefined" || offset === null) {
    offset = headerOffset;
  }
  if (typeof duration === "undefined" || duration === null) {
    duration = 300;
  }

  if ($(element).length) {
    appState.isAnimating = true;
    element.velocity("scroll", {
      duration: duration,
      delay: delay,
      offset: -offset,
      complete: function(elements) {
        appState.isAnimating = false;
      }
    }, "easeOutSine");
  }
}

export default scrollBody