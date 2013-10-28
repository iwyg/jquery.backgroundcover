(function (window, $, undefined) {
  'use strict';

  /**
   * $.backgroundcover is a css3 shim for css background-size: cover
   *
   * (c) Thomas Appel 2013
   * @author Thomas Appel <mail@thomas-appel.com>
   * @license MIT
   */

  var defaults = {
    poll: true,
    destroy: undefined
  };

  // polyfill for requestAnimationFrame
  // @see https://gist.github.com/desandro/1866474
  var lastTime = 0;
  var prefixes = 'webkit moz ms o'.split(' ');
  // get unprefixed rAF and cAF, if present
  var requestAnimationFrame = window.requestAnimationFrame;
  var cancelAnimationFrame = window.cancelAnimationFrame;
  // loop through vendor prefixes and get prefixed rAF and cAF
  var prefix;
  for (var i = 0; i < prefixes.length; i++) {
    if (requestAnimationFrame && cancelAnimationFrame) {
      break;
    }
    prefix = prefixes[i];
    requestAnimationFrame = requestAnimationFrame || window[prefix + 'RequestAnimationFrame'];
    cancelAnimationFrame  = cancelAnimationFrame  || window[prefix + 'CancelAnimationFrame'] ||
      window[prefix + 'CancelRequestAnimationFrame'];
  }

  // fallback to setTimeout and clearTimeout if either request/cancel is not supported
  if (!requestAnimationFrame || !cancelAnimationFrame) {
    requestAnimationFrame = function (callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

    cancelAnimationFrame = function (id) {
      window.clearTimeout(id);
    };
  }

  function createImage(src) {
    return $('<img style="position:static;display:block;" src="' + src + '"/>');
  }

  function createContainer(img) {
    var container = $('<div style="position:absolute;z-index:-99999999;width:100%;height:100%;" class="background-cover-image"/>');
    container.append(img);
    return container;
  }

  function initImage(Ctrl, element, src) {
    var h, w, posX, posY, propX, propY, cPropX, cPropY, centerX, centerY;

    posX = element.css('backgroundPositionX');
    posY = element.css('backgroundPositionY');

    Ctrl.propX = propX = parseInt(posX, 10) === 100 ? 'right' : 'left';
    Ctrl.propY = propY = parseInt(posY, 10) === 100 ? 'bottom' : 'top';
    Ctrl.cPropX = cPropX = propX === 'right' ? 'marginRight' : 'marginLeft';
    Ctrl.cPropY = cPropX = propX === 'bottom' ? 'marginBottom' : 'marginTop';
    Ctrl.centerX = centerX = parseInt(posX, 10) === 50;
    Ctrl.centerY = centerY = parseInt(posY, 10) === 50;

    Ctrl.src = src ? src : element.css('backgroundImage').split(/(\(|\))/)[2];
    Ctrl.img = createImage(Ctrl.src);
    Ctrl.img.css(propX, posX);
    Ctrl.img.css(propY, posY);
    Ctrl.img.load(function () {
      Ctrl.imgH = h = Ctrl.img.prop('height');
      Ctrl.imgW = w = Ctrl.img.prop('width');
      Ctrl.mode = h < w ? 'landscape' : 'portrait';
      Ctrl.img.addClass(Ctrl.mode);
      Ctrl.ratio = w / h;
      Ctrl.ready = true;
      element.trigger('coverresize');
    });
    element.addClass('background-cover').css({
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: 'none'
    });
    Ctrl.container = createContainer(Ctrl.img);
    Ctrl.container.append(Ctrl.img);
    element.append(Ctrl.container);

  }

  function ratio(element) {
    return element.width() / element.height();
  }

  function getDestroyHandler(options) {
    return options.destroy ? ' ' + options.destroy : '';
  }

  function bindEvents(Ctrl, element) {
    var eH = element.width(), eW = element.height(),
    poll = function () {
      var dirty = false, h = element.height(), w = element.width();
      if (h !== eH || w !== eW) {
        dirty = true;
        eH = h;
        eW = w;
      }
      if (dirty) {
        element.trigger('coverresize');
      }
      if (element.parent().length) {
        Ctrl.poll = requestAnimationFrame(poll);
      }
    };

    if (Ctrl.options.poll) {
      poll();
    }

    if (!Ctrl.options.poll) {
      Ctrl.noPoll = function () {
        if (!element.parent().length) {
          Ctrl.destroy();
        }
        element.trigger('coverresize');
      };

      $(window).on('resize.backgroundcover orientationchange.backgroundcover', Ctrl.noPoll);
    }

    element.on('remove destroyed' + getDestroyHandler(Ctrl.options), function () {
      Ctrl.destroy();
    });

    element.on('coverresize resize', function () {
      var elemRatio = ratio(element),
      css, ih, iw,
      h = Ctrl.container.height(),
      w = Ctrl.container.width(),
      mt = 0,
      ml = 0;

      if (Ctrl.mode === 'landscape') {
        // container height larger than image height
        if (elemRatio < Ctrl.ratio) {
          ih = h;
          iw = h * Ctrl.ratio;
        } else {
          ih = w / Ctrl.ratio;
          iw = w;
        }
      }

      if (Ctrl.mode === 'portrait') {
        // container width larger than image width
        if (elemRatio > Ctrl.ratio) {
          ih = w / Ctrl.ratio;
          iw = w;
        } else {
          ih = h;
          iw = h * Ctrl.ratio;
        }
      }

      ml = Ctrl.centerX ? 0 - Math.round((iw - w) / 2) : 0;
      mt = Ctrl.centerY ? 0 - Math.round((ih - h) / 2) : 0;

      css = {
        height: Math.round(ih),
        width: Math.round(iw)
      };
      css[Ctrl.cPropX] = ml;
      css[Ctrl.cPropY] = mt;
      Ctrl.img.css(css);
    });
  }

  function unbindEvents(element, Ctrl) {
    element.off('coverresize resize orientationchange');
    element.off('remove destroyed' + getDestroyHandler(Ctrl.options));

    if (!Ctrl.options.poll) {
      $(window).off('resize.backgroundcover orientationchange.backgroundcover', Ctrl.noPoll);
    }
  }

  function BackgroundCover(element, src, options) {
    this.options = options;
    this.element = element;
    this.ready = false;

    initImage(this, element, src);
    bindEvents(this, element);
  }

  BackgroundCover.prototype = {
    destroy: function () {
      if (this.poll) {
        cancelAnimationFrame(this.poll);
      }

      unbindEvents(this.element, this);

      if (this.container.length) {
        this.container.empty().remove();
      }
    }
  };

  $.fn.backgroundcover = function (src, options) {
    var opts = $.extend({}, defaults, options || {});
    return this.each(function (index, element) {
      var el = $(element);
      el.data('backgroundCover', new BackgroundCover(el, src, opts));
    });
  };

}(this, this.jQuery));
