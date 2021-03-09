// internal
import { AMP_SENTINEL, EMBED_SIZE, INITIAL_MESSAGE } from './constants.js';
import { extend } from './utils.js';

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
		'*',
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
	window.addEventListener(
		'load',
		function load() {
			sendFrameHeight();

			window.removeEventListener('load', load, false);
		},
		false,
	);
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
	window.addEventListener('resize', () => sendFrameHeight(), false);
}

/**
 * Sets up an event listener for a message from the parent window that it is
 * now listening for messages from this iframe, and tells it the iframe's height
 * at that time. This makes it possible to delay observing an iframe (e.g. when
 * lazy loading) but trust the parent will get the current height ASAP.
 *
 * @returns {void}
 * @example
 *
 * // as soon as a Framer connects, tell the host page what the current height is
 * sendHeightOnFramerInit();
 */
function sendHeightOnFramerInit() {
	window.addEventListener(
		'message',
		function onInit(event) {
			const { data } = event;

			// if the sentinel and type matches, update our height
			if (data.sentinel === AMP_SENTINEL && data.type === INITIAL_MESSAGE) {
				// don't need it anymore
				window.removeEventListener('message', onInit, false);

				// send the current frame height
				sendFrameHeight();
			}
		},
		false,
	);
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
 * Automatically calls an `sendFrameHeight`, `sendHeightOnLoad`, `sendHeightOnResize`
 * and `sendHeightOnFramerInit`.
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
	sendHeightOnFramerInit();
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
