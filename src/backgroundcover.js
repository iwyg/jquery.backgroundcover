(function (window, $, undefined) {
  'use strict';

  window.requestAnimFrame = (function () {
    return window.requestAnimationFrame  ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  }());

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

  function bindEvents(Ctrl, element) {
    var eH = element.width(), eW = element.height();
    (function loop() {
      var dirty = false, h = element.height(), w = element.width();
      if (h !== eH || w !== eW) {
        dirty = true;
        eH = h;
        eW = w;
      }
      if (dirty) {
        element.trigger('coverresize');
      }
      window.requestAnimFrame(loop);
    }());

    element.on('coverresize', function () {
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
        height: ih,
        width: iw
      };
      css[Ctrl.cPropX] = ml;
      css[Ctrl.cPropY] = mt;
      Ctrl.img.css(css);
    });
  }

  function BackgroundCover(element, src) {
    this.element = element;
    initImage(this, element);
    bindEvents(this, element);
  }

  $.fn.backgroundcover = function (src) {
    return this.each(function (index, element) {
      new BackgroundCover($(element), src);
    });
  };

}(this, this.jQuery));
