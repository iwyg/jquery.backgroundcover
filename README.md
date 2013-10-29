# Simple Polyfill for CSS3 *backgroundSize: cover*

## Requirements 

- jQuery 1.9.\* or higher

## Demo

Demo page is available [here](http://iwyg.github.io/jquery.backgroundcover/).

## Usage

`$.backgroundcover` respects the `background-position` properties of your element as well.

### css
```css
.background-image {
	background-image: url(path/to/image.jpg);
	background-position: center center;
	background-repeat: no-repeat;
	/* you'd normally also set background-size here */
}
```
### html
```html
<div class="background-image"></div>
```

### js
```js
// apply `backgroundcover` to an element that has a background image:
$('.background-image').backgroundcover();

// or to an element without background image by setting the image source
// explicitly:
$('.my-div').backgroundcover('path/to/image.jpg');

// you may also pass options:

// setting `poll` to false will stop polling the element for size change
// and instead only resizes the image on window resize events. `poll` is set to
// `true`by default.
$('.my-div').backgroundcover('path/to/image.jpg', {poll: false});

// you can also add your custom destroy events, e.g. for angular you'd add
// '$destroy'
$('.my-div').backgroundcover('path/to/image.jpg', {destroy: 'destroyevent'});
```

## Note

`backgroundcover` will not test your browser's capability for backgroundSize:cover`, hence it is recommended to use a library like [Modernizr][1] and a custom test. e.g: 

```js
Modernizr.testStyles(
  '#modernizr',
  function (elem, rule) {
    var style = Modernizr.prefixed('backgroundSize');
    elem.style[style] = 'cover';
    Modernizr.addTest('backgroundsizecover', (elem.style[style] === 'cover'))
  }
);
```

[1]: http://modernizr.com/
