// packages
import mitt from 'mitt';

// internal
import { EMBED_SIZE, SENTINEL } from './constants.mjs';

/**
 * Gets the height of the current document's body. Uses offsetHeight to ensure
 * that margins are accounted for.
 *
 * @private
 * @returns {number}
 */
function getDocumentHeight() {
  return document.documentElement.offsetHeight;
}

/**
 * A wrapper around postMessage to normalize the message body. Automatically
 * includes the sentinel value.
 *
 * @param {string} type Type of message being sent
 * @param {Object} [data] Any additional data to send
 * @returns {void}
 * @example
 *
 * sendMessage('send-trigger', { info: 'important' });
 *
 * // parent page recieves the following:
 * // {
 * //   sentinel: '<value>',
 * //   type: 'send-trigger',
 * //   info: 'important',
 * // }
 */
function sendMessage(type, data = {}) {
  window.parent.postMessage(
    {
      sentinel: SENTINEL,
      type,
      ...data,
    },
    '*'
  );
}

/**
 * Sets up an event listener for the resize event that sends the new frame
 * height to the parent.
 *
 * @returns {void}
 * @example
 *
 * // every time the frame is resized, tell the parent page what its new height is
 * sendHeightOnResize();
 */
function sendHeightOnResize() {
  window.addEventListener('resize', () => sendFrameHeight());
}

/**
 * Sets up an event listener for the load event that sends the new frame
 * height to the parent. Automatically removes itself once fired.
 *
 * @returns {void}
 * @example
 *
 * // once the frame's load event is fired, tell the parent page its new height
 * sendHeightOnLoad();
 */
function sendHeightOnLoad() {
  window.addEventListener('load', function cb(event) {
    sendFrameHeight();

    event.currentTarget.removeEventListener(event.type, cb);
  });
}

/**
 * Sends height updates to the parent page on an interval.
 *
 * @param {number} [delay] How long to set the interval
 * @returns {void}
 * @example
 *
 * // will call sendFrameHeight every 500ms
 * sendHeightOnPoll();
 *
 * // will call sendFrameHeight every 250ms
 * sendHeightOnPoll(250);
 */
function sendHeightOnPoll(delay = 500) {
  setInterval(sendFrameHeight, delay);
}

/**
 * Sends the current document's height or provided value to the parent window
 * using postMessage.
 *
 * @param {number} [height] The height to pass to the parent page, is determined automatically if not passed
 * @returns {void}
 * @example
 *
 * // Uses the document's height to tell the parent frame
 * sendFrameHeight();
 *
 * // Pass a height you've determined in another way
 * sendFrameHeight(500);
 *
 */
function sendFrameHeight(height = getDocumentHeight()) {
  sendMessage(EMBED_SIZE, { height });
}

/**
 * Creates an observable that listens for messages from the parent page. Only
 * needed for specialized cases. Automatically validates against the sentinel
 * value.
 *
 * @returns {Mitt} An instance of `mitt`
 * @example
 *
 * const observer = createMessageListener();
 *
 * observer.on('special-message', data => {
 *   console.log(data); // the message from the parent page
 * });
 */
function createMessageListener() {
  const observer = mitt();

  function fn(event) {
    const { data } = event;

    if (data.type == null || data.sentinel !== SENTINEL) return;

    observer.emit(data.type, data);
  }

  window.addEventListener('message', fn);

  return observer;
}

/**
 * A helper for running the usual functions for setting up a frame.
 *
 * Automatically calls sendFrameHeight, sendHeightOnLoad and sendHeightOnResize.
 *
 * @returns {void}
 * @example
 *
 * initFrame();
 */
function initFrame() {
  sendFrameHeight();
  sendHeightOnLoad();
  sendHeightOnResize();
}

/**
 * Initializes a frame, then sets up a poll to continue to update on an interval.
 *
 * @param {number} [delay] An optional delay to pass to sendHeightOnPoll
 * @returns {void}
 * @example
 *
 * // calls initFrame, then calls sendHeightOnPoll
 * initFrameThenPoll();
 */
function initFrameThenPoll(delay) {
  initFrame();
  sendHeightOnPoll(delay);
}

export {
  createMessageListener,
  initFrame,
  initFrameThenPoll,
  sendFrameHeight,
  sendHeightOnLoad,
  sendHeightOnPoll,
  sendHeightOnResize,
  sendMessage,
};
