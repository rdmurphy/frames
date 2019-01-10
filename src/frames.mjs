// internal
import { AMP_SENTINEL, EMBED_SIZE } from './constants.mjs';
import { extend } from './utils.mjs';

/**
 * A wrapper around postMessage to normalize the message body. Automatically
 * includes the AMP sentinel value.
 *
 * @private
 * @param {string} type Type of message being sent
 * @param {Object} [data] Any additional data to send
 * @returns {void}
 */
function sendMessage(type, data = {}) {
  window.parent.postMessage(
    extend({ sentinel: AMP_SENTINEL, type }, data),
    '*'
  );
}

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
 * Sends the current document's height or provided value to the host window
 * using postMessage.
 *
 * @param {number} [height] The height to pass to the host page, is determined automatically if not passed
 * @returns {void}
 * @example
 *
 * // Uses the document's height to tell the host page
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
 * Sets up an event listener for the load event that sends the new frame
 * height to the host. Automatically removes itself once fired.
 *
 * @returns {void}
 * @example
 *
 * // once the frame's load event is fired, tell the host page its new height
 * sendHeightOnLoad();
 */
function sendHeightOnLoad() {
  window.addEventListener('load', function cb() {
    sendFrameHeight();

    window.removeEventListener('load', cb);
  });
}

/**
 * Sets up an event listener for the resize event that sends the new frame
 * height to the host.
 *
 * @returns {void}
 * @example
 *
 * // every time the frame is resized, tell the host page what its new height is
 * sendHeightOnResize();
 */
function sendHeightOnResize() {
  window.addEventListener('resize', () => sendFrameHeight());
}

/**
 * Sends height updates to the host page on an interval.
 *
 * @param {number} [delay] How long to set the interval
 * @returns {void}
 * @example
 *
 * // will call sendFrameHeight every 300ms
 * sendHeightOnPoll();
 *
 * // will call sendFrameHeight every 150ms
 * sendHeightOnPoll(150);
 */
function sendHeightOnPoll(delay = 300) {
  setInterval(sendFrameHeight, delay);
}

/**
 * A helper for running the standard functions for setting up a frame.
 *
 * Automatically calls an sendFrameHeight, sendHeightOnLoad and sendHeightOnResize.
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
 * @param {number} [delay] An optional custom delay to pass to sendHeightOnPoll
 * @returns {void}
 * @example
 *
 * // calls initFrame, then calls sendHeightOnPoll
 * initFrameAndPoll();
 */
function initFrameAndPoll(delay) {
  initFrame();
  sendHeightOnPoll(delay);
}

export {
  initFrame,
  initFrameAndPoll,
  sendFrameHeight,
  sendHeightOnLoad,
  sendHeightOnPoll,
  sendHeightOnResize,
};
