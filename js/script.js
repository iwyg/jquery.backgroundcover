(function () {
  'use strict';

  var image = $('#bg1'),
  menu = $('footer').find('li'),
  cover;
  image.backgroundcover(null, {poll: false});
  cover = image.data('backgroundCover');

  function switchPosition(event) {
    event.preventDefault();
    cover.destroy();
    menu.removeClass('active');

    var pos = $(event.target).parent().addClass('active').end().data('pos');
    image.css('background-position', pos.y + ' ' + pos.x);
    image.backgroundcover(null, {poll: false});
    cover = image.data('backgroundCover');
  }
  $('.position').on('click', switchPosition);

}());
