(function () {
  'use strict';

  function preload(src, ready) {
    var img = new Image();
    $(img).load(ready).attr('src', src)
  }

  function switchPosition(event) {
    event.preventDefault();
    cover.destroy();
    menu.removeClass('active');

    var pos = $(event.target).parent().addClass('active').end().data('pos');
    image.css('background-position', pos.y + ' ' + pos.x);
    image.backgroundcover(null, {poll: false});
    cover = image.data('backgroundCover');
  }

  var image = $('#bg1'),
  menu = $('footer').find('li'),
  cover;
  image.css({opacity: 0});

  preload('landscape.jpg', function () {
    image.animate({opacity: 1}, 600);
  });

  image.backgroundcover(null, {poll: false});
  cover = image.data('backgroundCover');

  $('.position').on('click', switchPosition);

}());
