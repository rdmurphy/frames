<h1 align="center">
  @newswire/frames
</h1>
<p align="center">
  <a href="https://www.npmjs.org/package/@newswire/frames"><img src="https://badgen.net/npm/v/@newswire/frames" alt="npm"></a>
  <a href="https://unpkg.com/@newswire/frames/dist/index.umd.js"><img src="https://badgen.net/badgesize/gzip/https://unpkg.com/@newswire/frames/dist/index.umd.js" alt="gzip size"></a>
  <a href="https://unpkg.com/@newswire/frames/dist/index.umd.js"><img src="https://badgen.net/badgesize/brotli/https://unpkg.com/@newswire/frames/dist/index.umd.js" alt="brotli size"></a>
  <a href="https://packagephobia.now.sh/result?p=@newswire/frames"><img src="https://badgen.net/packagephobia/install/@newswire/frames" alt="install size"></a>
</p>

`@newswire/frames` is a minimalistic take on responsive iframes in the spirit of [Pym.js](http://blog.apps.npr.org/pym.js/).

## Key features

- 🐜 **1 kilobyte** gzipped for both parent and frame code
- 🌴 **Tree-shakable** by default - import only what you need to achieve responsiveness
- ⚡️ **Speaks [AMP](https://www.ampproject.org)** and is compatible with [`amp-iframe`](https://www.ampproject.org/docs/reference/components/amp-iframe)

## Supported browsers

| Browser                        | Supported |
| ------------------------------ | --------- |
| Safari                         | ✅        |
| Mozilla Firefox                | ✅        |
| Google Chrome                  | ✅        |
| Opera                          | ✅        |
| Microsoft Edge                 | ✅        |
| Internet Explorer 11           | ✅        |
| Internet Explorer 10 and lower | ⛔️       |

## Installation

`@newswire/frames` is available via `npm`.

```sh
npm install @newswire/frames
```

You can also use it directly via [unpkg.com](https://unpkg.com/).

```html
<script src="https://unpkg.com/@newswire/frames/dist/index.umd.js"></script>
<!-- Now available at `window.newswireFrames` -->
```

You can also import it as a module via unpkg!

```html
<script type="module">
	import * as frames from 'https://unpkg.com/@newswire/frames/dist/index.mjs';

	frames.autoInitFrames();
</script>
```

## Usage

### From the **host** page (_framer_ or _parent_)

The page that contains the embeds needs to use the `Framer` class to set up instances for each embed.

Assume we have the following markup in our HTML:

```html
<div id="embed-container">Loading...</div>
```

Then, in our script:

```js
import { Framer } from '@newswire/frames';

const container = document.getElementById('embed-container');
const src = 'https://i-am-an-embed/';
const attributes = { sandbox: 'allow-scripts allow-same-origin' };

const framer = new Framer(container, { src, atttributes });
// Now the iframe has been added to the page and is listening for height changes notifications from within the iframe
```

It is also possible to observe existing iframes on a page if the content of the frames are compatible with `@newswire/frames`. This is handy if you already have your own method to dynamically add iframes to the page, or are using a custom method to lazy load them and don't need the heavy hand of `Framer`.

```js
import { observeIframe } from '@newswire/frames';

// grab a reference to an existing iframe
const iframe = document.getElementById('my-embed');

// returns a `unobserve()` function if you need to stop listening
const unobserve = observeIframe(iframe);

// later, if you need to disconnect from the iframe
unobserve();
```

Pym.js had the ability to automatically initialize embeds that had matching attibutes on their container elements — `@newswire/frames` can do this as well.

Assume we have the following markup in our HTML:

```html
<div data-frame-src="https://i-am-an-embed/"></div>
<div data-frame-src="https://i-am-an-embed-too/"></div>
<div data-frame-src="https://i-am-an-embed-three/"></div>
```

Then in our script, we can skip the fanfare of setting up a `Framer` for each one and use the `data-frame-src` attribute to find them.

```js
import { autoInitFrames } from '@newswire/frames';

// looks for any elements with `data-frame-src` that haven't been initialized yet, and sets them up
autoInitFrames();
```

If you're needing to pass any of the other options to `Framer` when you're automatically creating the embeds, you can add attributes that the initializer will pick up and pass along using the `data-frame-attribute-*` prefix.

```html
<div
	data-frame-src="https://i-am-an-embed/"
	data-frame-attribute-sandbox="allow-scripts allow-same-origin"
></div>

<!-- This creates... -->
<iframe src="https://i-am-an-embed/" sandbox="allow-scripts allow-same-origin">
</iframe>
```

### From the **embedded** page (_frame_ or _child_)

While the code to setup the host page is similar to Pym's `Parent` class, the methods for making the iframed page communicate with the host page are a little different.

Want to set it and forget it? You can import a function that sets up listeners and sends the initial height of the frame's content.

```js
import { initFrame } from '@newswire/frames';

// 1. Sends the initial frame's content height
// 2. Sets up an one-time istener to send the height on load
// 3. Sets up a listener to send the height every time the frame resizes
// 4. Sets up an event listener that sends the height once the parent window begins watching
initFrame();
```

You can also automatically set up long polling for height changes as well.

```js
import { initFrameAndPoll } from '@newswire/frames';

// 1. Sends the initial frame's content height
// 2. Sets up an one-time listener to send the height on load
// 3. Sets up a listener to send the height every time the frame resizes
// 4. Sets up an event listener that sends the height once the parent window begins watching
// 5. Sets up an interval to send a new height update every 300ms
initFrameAndPoll();
```

Alternatively, you can set and use function independently depending on the needs of your frame's content.

```js
import {
	sendFrameHeight,
	sendHeightOnLoad,
	sendHeightOnResize,
	sendHeightOnPoll,
	sendHeightOnFramerInit,
} from '@newswire/frames';

// 1. Sends the initial frame's content height
sendFrameHeight();

// 2. Sets up an one-time listener to send the height on load
sendHeightOnLoad();

// 3. Sets up a listener to send the height every time the frame resizes
sendHeightOnResize();

// 4. Sets up an event listener that sends the height once the parent window begins watching
sendHeightOnFramerInit();

// 5. Sets up an interval to send a new height update every 150ms
sendHeightOnPoll(150);

// 1-4 is identical to initFrame()! 1-5 is identical to initFrameAndPoll()!
```

Typically using `initFrame()` will be enough, but if you have code that will potentially change the height of the frame's content (like with an `<input>` or `<button>` press) and would rather not use polling, you can use `sendFrameHeight()` to manually recalculate and send an update to the parent page.

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

- [observeIframe](#observeiframe)
  - [Parameters](#parameters)
  - [Examples](#examples)
- [FramerOptions](#frameroptions)
  - [Properties](#properties)
- [Framer](#framer)
  - [Parameters](#parameters-1)
- [autoInitFrames](#autoinitframes)
  - [Examples](#examples-1)
- [sendFrameHeight](#sendframeheight)
  - [Parameters](#parameters-2)
  - [Examples](#examples-2)
- [sendHeightOnLoad](#sendheightonload)
  - [Examples](#examples-3)
- [sendHeightOnResize](#sendheightonresize)
  - [Examples](#examples-4)
- [sendHeightOnFramerInit](#sendheightonframerinit)
  - [Examples](#examples-5)
- [sendHeightOnPoll](#sendheightonpoll)
  - [Parameters](#parameters-3)
  - [Examples](#examples-6)
- [initFrame](#initframe)
  - [Examples](#examples-7)
- [initFrameAndPoll](#initframeandpoll)
  - [Parameters](#parameters-4)
  - [Examples](#examples-8)

### observeIframe

Adds an event listener to an existing iframe for receiving height change
messages. Also tells the iframe that we're listening and requests the
initial height. Returns an `unobserve()` function for later removing the
listener.

#### Parameters

- `iframe` **[HTMLIFrameElement](https://developer.mozilla.org/docs/Web/API/HTMLIFrameElement)** the iframe to observe

#### Examples

```javascript
// grab a reference to an existing iframe
const iframe = document.getElementById('my-embed');

// returns a `unobserve()` function if you need to stop listening
const unobserve = observeIframe(iframe);

// later, if you need to disconnect from the iframe
unobserve();
```

### FramerOptions

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

#### Properties

- `src` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | null)?** the URL to set as the `src` of the iframe
- `attributes` **Record<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>?** any attributes to add to the iframe itself

### Framer

The Framer function to be called in the host page. A wrapper around
interactions with a created iframe. Returns a `remove()` function for
disconnecting the event listener and removing the iframe from the DOM.

#### Parameters

- `container` **[Element](https://developer.mozilla.org/docs/Web/API/Element)** the containing DOM element for the iframe
- `options` **[FramerOptions](#frameroptions)** (optional, default `{}`)

  - `options.attributes`
  - `options.src`

### autoInitFrames

Automatically initializes any frames that have not already been
auto-activated.

#### Examples

```javascript
// sets up all frames that have not been initialized yet
autoInitFrames();
```

### sendFrameHeight

Sends the current document's height or provided value to the host window
using postMessage.

#### Parameters

- `height` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** The height to pass to the host page, is determined automatically if not passed (optional, default `getDocumentHeight()`)

#### Examples

```javascript
// Uses the document's height to tell the host page
sendFrameHeight();

// Pass a height you've determined in another way
sendFrameHeight(500);
```

Returns **void**

### sendHeightOnLoad

Sets up an event listener for the load event that sends the new frame
height to the host. Automatically removes itself once fired.

#### Examples

```javascript
// once the frame's load event is fired, tell the host page its new height
sendHeightOnLoad();
```

Returns **void**

### sendHeightOnResize

Sets up an event listener for the resize event that sends the new frame
height to the host.

#### Examples

```javascript
// every time the frame is resized, tell the host page what its new height is
sendHeightOnResize();
```

Returns **void**

### sendHeightOnFramerInit

Sets up an event listener for a message from the parent window that it is
now listening for messages from this iframe, and tells it the iframe's height
at that time. This makes it possible to delay observing an iframe (e.g. when
lazy loading) but trust the parent will get the current height ASAP.

#### Examples

```javascript
// as soon as a Framer connects, tell the host page what the current height is
sendHeightOnFramerInit();
```

Returns **void**

### sendHeightOnPoll

Sends height updates to the host page on an interval.

#### Parameters

- `delay` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** How long to set the interval (optional, default `300`)

#### Examples

```javascript
// will call sendFrameHeight every 300ms
sendHeightOnPoll();

// will call sendFrameHeight every 150ms
sendHeightOnPoll(150);
```

Returns **void**

### initFrame

A helper for running the standard functions for setting up a frame.

Automatically calls an `sendFrameHeight`, `sendHeightOnLoad`, `sendHeightOnResize`
and `sendHeightOnFramerInit`.

#### Examples

```javascript
initFrame();
```

Returns **void**

### initFrameAndPoll

Calls `initFrame` to setup a frame, then initializes a poller to continue to update on an interval.

#### Parameters

- `delay` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** An optional custom delay to pass to sendHeightOnPoll

#### Examples

```javascript
// calls initFrame, then calls sendHeightOnPoll
initFrameAndPoll();
```

Returns **void**

## License

MIT
