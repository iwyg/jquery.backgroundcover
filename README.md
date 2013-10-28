# Simple Polifill for css3 *backgroundSize: cover*

## Requirements: 

- jQuery 1.9.* or higher

## Usage

`$.backgroundcover` respects the `background-position` properties of your element as well.

```css
.background-image {
	background-image: url(path/to/image.jpg);
	background-position: center center;
	background-repeat: no-repeat;
	/* you'd normally also set background-size here */
}
```

```html
<div class="background-image"></div>
```

```js
// apply to an element that has a background image:
$('.background-image').backgroundcover();

// oe to an element without background image by setting the image source
// explicitly:
$('.my-div').backgroundcover('path/to/image.jpg');
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
