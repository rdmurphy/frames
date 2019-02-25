<h1 align="center">
  @newswire/frames
</h1>
<p align="center">
  <a href="https://www.npmjs.org/package/@newswire/frames"><img src="https://badgen.net/npm/v/@newswire/frames" alt="npm"></a>
  <a href="https://david-dm.org/rdmurphy/frames"><img src="https://badgen.net/david/dep/rdmurphy/frames" alt="dependencies"></a>
  <a href="https://unpkg.com/@newswire/frames/dist/index.umd.js"><img src="https://badgen.net/badgesize/gzip/https://unpkg.com/@newswire/frames/dist/index.umd.js" alt="gzip size"></a>
  <a href="https://unpkg.com/@newswire/frames/dist/index.umd.js"><img src="https://badgen.net/badgesize/brotli/https://unpkg.com/@newswire/frames/dist/index.umd.js" alt="brotli size"></a>
  <a href="https://packagephobia.now.sh/result?p=@newswire/frames"><img src="https://badgen.net/packagephobia/install/@newswire/frames" alt="install size"></a>
</p>

`@newswire/frames` is a [greenfield](https://en.wikipedia.org/wiki/Greenfield_project) take on responsive iframes in the spirit of [Pym.js](http://blog.apps.npr.org/pym.js/).

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

const framer = new Framer({ container, src });
// Now the iframe has been added to the page and is listening for height changes notifications from within the iframe
```

A popular feature of Pym.js was the ability to automatically initialize embeds that had matching attibutes on their container elements. `@newswire/frames` also includes this capability.

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

If you're needing to pass any of the other options to `Framer` when you're automatically creating the embeds, you can add matching data attributes that the initializer will pick up and pass along.

```html
<div
  data-frame-src="https://i-am-an-embed/"
  data-frame-sandbox="allow-scripts allow-same-origin"
></div>
```

### From the **embedded** page (_frame_ or _child_)

While the code to setup the host page is similar to Pym's `Parent` class, the methods for making the iframed page communicate with the host page are a little different.

Want to set it and forget it? You can import a function that sets up listeners and sends the initial height of the frame's content.

```js
import { initFrame } from '@newswire/frames';

// 1. Sends the initial frame's content height
// 2. Sets up an one-time istener to send the height on load
// 3. Sets up a listener to send the height every time the frame resizes
initFrame();
```

You can also automatically set up long polling for height changes as well.

```js
import { initFrameAndPoll } from '@newswire/frames';

// 1. Sends the initial frame's content height
// 2. Sets up an one-time listener to send the height on load
// 3. Sets up a listener to send the height every time the frame resizes
// 4. Sets up an interval to send a new height update every 300ms
initFrameAndPoll();
```

Alternatively, you can set and use function independently depending on the needs of your frame's content.

```js
import {
  sendFrameHeight,
  sendHeightOnLoad,
  sendHeightOnResize,
  sendHeightOnPoll,
} from '@newswire/frames';

// 1. Sends the initial frame's content height
sendFrameHeight();

// 2. Sets up an one-time listener to send the height on load
sendHeightOnLoad();

// 3. Sets up a listener to send the height every time the frame resizes
sendHeightOnResize();

// 4. Sets up an interval to send a new height update every 150ms
sendHeightOnPoll(150);

// 1-3 is identical to initFrame()! 1-4 is identical to initFrameAndPoll()!
```

Typically using `initFrame()` will be enough, but if you have code that will potentially change the height of the frame's content (like with an `<input>` or `<button>` press) and would rather not use polling, you can use `sendFrameHeight()` to manually recalculate and send an update to the parent page.

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

- [Framer](#framer)
  - [Parameters](#parameters)
  - [remove](#remove)
    - [Examples](#examples)
- [autoInitFrames](#autoinitframes)
  - [Examples](#examples-1)
- [sendFrameHeight](#sendframeheight)
  - [Parameters](#parameters-1)
  - [Examples](#examples-2)
- [sendHeightOnLoad](#sendheightonload)
  - [Examples](#examples-3)
- [sendHeightOnResize](#sendheightonresize)
  - [Examples](#examples-4)
- [sendHeightOnPoll](#sendheightonpoll)
  - [Parameters](#parameters-2)
  - [Examples](#examples-5)
- [initFrame](#initframe)
  - [Examples](#examples-6)
- [initFrameAndPoll](#initframeandpoll)
  - [Parameters](#parameters-3)
  - [Examples](#examples-7)

### Framer

The Framer object to be called in the host page. Effectively a wrapper around
interactions with an embedded iframe.

#### Parameters

- `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** options used to prepare the iframe
  - `options.allowfullscreen` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** toggles the `allowfullscreen` attribute (optional, default `false`)
  - `options.container` **[Element](https://developer.mozilla.org/docs/Web/API/Element)** the containing DOM element for the iframe
  - `options.name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** sets the `name` attribute
  - `options.referrerpolicy` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** sets the `referrerpolicy` attribute
  - `options.sandbox` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** sets the `sandbox` attribute (optional, default `'allow-scripts'`)
  - `options.src` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** the URL to set as the `src` of the iframe

#### remove

Removes event listeners and removes the iframe from the container.

##### Examples

```javascript
const framer = new Framer(...);
// tears down the Framer
framer.remove();
```

Returns **void**

### autoInitFrames

Automatically initializes any frames that have not already been
auto-activated.

#### Examples

```javascript
// sets up all frames that have not been initialized yet
autoInitFrames();
```

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** An array of all the created Framers

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

Automatically calls an sendFrameHeight, sendHeightOnLoad and sendHeightOnResize.

#### Examples

```javascript
initFrame();
```

Returns **void**

### initFrameAndPoll

Initializes a frame, then sets up a poll to continue to update on an interval.

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
