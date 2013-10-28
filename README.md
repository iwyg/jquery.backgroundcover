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
