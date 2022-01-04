# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Tests! Of everything!

- The act of "observing" an iframe has been broken out of the `Framer` class into its own function — `observeIframe`! This makes it possible to observe `@newswire/frames` compatible-iframes that have been created independent of this library. This means it is now possible to use your own code to create iframes (perhaps lazy load them with `IntersectionObserver`!), have them added via your CMS/templating engine, etc.

It's important to remember however that this method **does not** add any attributes to the existing iframe. It just sets up the observer and stops there. This means it's on you to use CSS or other methods to style the iframe. (Set width to `100%`, etc.)

```js
// grab a reference to an existing iframe, assuming there's already a "src" on this
const iframe = document.getElementById('my-embed');

// returns a `unobserve()` function if you need to stop listening
const unobserve = observeIframe(iframe);

// later, if you need to disconnect from the iframe
unobserve();
```

As the example shows above, you can _also_ now disable the observer using the `unobserve` function `observeIframe` returns. Unlike the `remove()` method on `Framer`, this will **not** remove the iframe from the DOM.

- On the frames side there is a new method for notifying the parent `Framer` of an embed's size - `sendHeightOnFramerInit`. Once an iframe is observed (with either `observeIframe` or `Framer`), the parent page will notify the iframe it is now ready to receive height updates. In response, the iframe will send a message back to the parent `Framer` with the initial height of the iframe. This should help get the correct iframe height to the parent page sooner.

`sendHeightOnFramerInit` has been added to both `initFrame` and `initFrameAndPoll`.

### Changed

- `Framer` still exists but its interface has changed. Because the `container` was never optional it is now the first expected parameter when creating a new instance. The second paremter is now an object with two optional properties - `src` and `attributes`. `src` does what you expect and sets the `src` attribute on the iframe, but the `attributes` object is the new way to configure any other attributes on the `iframe` that's created. It's now just a convienient way to loop over an object and call `setAttribute`.

Why the change? The most common request to this library has been to add additional attributes that `Framer` can apply to the iframe it creates. (Or the ability to _not_ set one, [like `src`](https://github.com/rdmurphy/frames/pull/6)!) Instead of having to add support to `Framer` for every attribute you want to set on the iframe, it's now just a matter of adding a new property to the `attributes` object.

- `Framer` is no longer a class and instead just a function that returns an object. It was never really intended to be subclassed and this makes it a bit more compact when bundled, but it is still compatible with `new` if you prefer that.

- The auto loader now expects attributes to be set on containers using the `data-frame-attribute-` prefix. This is to match the new way of passing attributes to `Framer`.

```html
<!-- NO LONGER WORKS -->
<div data-frame-src="embed.html" data-frame-sandbox="allow-scripts"></div>

<!-- THIS WORKS! -->
<div
	data-frame-src="embed.html"
	data-frame-attribute-sandbox="allow-scripts"
></div>
```

## [0.3.1] - 2019-02-25

### Fixed

- Previous release did not actually contain changes. 😣

## [0.3.0] - 2019-02-25

### Added

- Added support for `title` attribute.

### Changed

- The name of the library for the UMD build is now `newswireFrames` instead of `frames`. This change was necessary to prevent a clash with the native [`Window.frames`](https://developer.mozilla.org/en-US/docs/Web/API/Window/frames).

## [0.2.0] - 2019-02-12

### Changed

- We no longer use [spread in object literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#Spread_in_object_literals), which was adding an [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) call in the compiled library. This breaks `@newswire/frames` in IE 11. We've moved to a tiny built-in extend implementation that restores IE 11 support.

## [0.1.0] - 2018-12-30

### Added

- Initial release!
