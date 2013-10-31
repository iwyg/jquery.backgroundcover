(function (window, $, undefined) {
  'use strict';

  /**
   * $.backgroundcover is a css3 shim for css background-size: cover
   *
   * (c) Thomas Appel 2013
   * @author Thomas Appel <mail@thomas-appel.com>
   * @license MIT
   */

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

  var defaults = {
    poll: false,
    destroy: undefined,
    x: undefined,
    y: undefined
  };

  var IMG_LANDSCAPE = 'landscape';
  var IMG_PORTRAIT  = 'portrait';

  /**
   * @private
   */
  function createImage() {
    var _img = new Image(), img = $(_img);
    img.css({
      position: 'absolute',
      display: 'block'
    });
    return img;
    //return $('<img style="position:absolute; display:block;/>');
  }

  /**
   * @private
   */
  function createContainer(img) {
    var container = $('<div style="position:absolute;z-index:-99999999;width:100%;height:100%;" class="background-cover-image"/>');
    container.append(img);
    return container;
  }

  /**
   * @private
   */
  function initImage(Ctrl, element, src) {
    var h, w, posXY, posX, posY, propX, propY, cPropX, cPropY, centerX, centerY;

    posXY = element.css('background-position').split(' ');
    posX = Ctrl.options.x ? Ctrl.options.x : posXY[0];
    posY = Ctrl.options.y ? Ctrl.options.y : posXY[1];

    Ctrl.props.propX = propX = parseInt(posX, 10) === 100 ? 'right' : 'left';
    Ctrl.props.propY = propY = parseInt(posY, 10) === 100 ? 'bottom' : 'top';
    Ctrl.props.cPropX = cPropX = propX === 'right' ? 'marginRight' : 'marginLeft';
    Ctrl.props.cPropY = cPropY = propY === 'bottom' ? 'bottom' : 'top';
    Ctrl.props.centerX = centerX = parseInt(posX, 10) === 50;
    Ctrl.props.centerY = centerY = parseInt(posY, 10) === 50;

    Ctrl.inlineBg = element[0].style.backgroundImage === '';
    Ctrl.src = src ? src : element.css('background-image').split(/(\(|\))/)[2].replace(new RegExp('\\"', 'gi'), '');
    Ctrl.img = createImage();
    Ctrl.img.css(propX, 0);
    Ctrl.img.css(propY, 0);

    Ctrl.img.load(function () {
      Ctrl.imgH = h = Ctrl.img.prop('height');
      Ctrl.imgW = w = Ctrl.img.prop('width');
      Ctrl.mode = h < w ? IMG_LANDSCAPE : IMG_PORTRAIT;
      Ctrl.img.addClass(Ctrl.mode);
      Ctrl.props.ratio = w / h;
      Ctrl.ready = true;
      element.trigger('coverresize');
    }).attr('src', Ctrl.src);

    element.addClass('background-cover').css({
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: 'none'
    });

    Ctrl.container = createContainer(Ctrl.img);
    Ctrl.container.append(Ctrl.img);

    element.append(Ctrl.container);

  }

  /**
   * @private
   */
  function ratio(element) {
    return element.width() / element.height();
  }

  /**
   * @private
   */
  function getDestroyHandler(options) {
    return options.destroy ? ' ' + options.destroy : '';
  }

  /**
   * @private
   */
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

    element.on('remove destroyed' + getDestroyHandler(Ctrl.options), $.proxy(Ctrl, Ctrl.destroy));
    element.on('coverresize resize', $.proxy(null, resizeImage, Ctrl, element));
  }

  /**
   * @private
   */
  function resizeImage(Ctrl, element) {
    var elemRatio = ratio(element),
    css, ih, iw,
    h = Ctrl.container.height(),
    w = Ctrl.container.width(),
    mt = 0,
    ml = 0;

    if (Ctrl.mode === IMG_LANDSCAPE) {
      // container height larger than image height
      if (elemRatio < Ctrl.props.ratio) {
        ih = h;
        iw = h * Ctrl.props.ratio;
      } else {
        ih = w / Ctrl.props.ratio;
        iw = w;
      }
    }

    if (Ctrl.mode === IMG_PORTRAIT) {
      // container width larger than image width
      if (elemRatio > Ctrl.ratio) {
        ih = w / Ctrl.ratio;
        iw = w;
      } else {
        ih = h;
        iw = h * Ctrl.ratio;
      }
    }

    ml = Ctrl.props.centerX ? 0 - Math.round((iw - w) / 2) : 0;
    mt = Ctrl.props.centerY ? 0 - Math.round((ih - h) / 2) : 0;

    css = {
      height: Math.round(ih),
      width: Math.round(iw)
    };
    css[Ctrl.props.cPropX] = ml;
    css[Ctrl.props.cPropY] = mt;
    Ctrl.img.css(css);
  }

  /**
   * @private
   */
  function unbindEvents(element, Ctrl) {
    element.off('coverresize resize orientationchange');
    element.off('remove destroyed' + getDestroyHandler(Ctrl.options));

    if (!Ctrl.options.poll) {
      $(window).off('resize.backgroundcover orientationchange.backgroundcover', Ctrl.noPoll);
    }
  }

  function BackgroundCover(element, src, options) {

    this.props = {};

    this.img   = {};

    this.options = options;
    this.element = element;
    this.ready = false;

    this.inlineBg = false;

    initImage(this, element, src);
    bindEvents(this, element);
  }

  BackgroundCover.prototype = {

    props : {},

    destroy: function () {
      if (this.poll) {
        cancelAnimationFrame(this.poll);
      }

      unbindEvents(this.element, this);

      if (this.inlineBg) {
        this.element.css({backgroundImage: 'url(' + this.src + ')'});
      } else {
        this.element.css('background-image', '');
      }

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
