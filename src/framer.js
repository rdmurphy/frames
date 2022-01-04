import {
	AMP_SENTINEL,
	EMBED_SIZE,
	HEIGHT,
	INITIAL_MESSAGE,
	PYM_REGEX,
	PYM_SENTINEL,
} from './constants.js';

/**
 * Adds an event listener to an existing iframe for receiving height change
 * messages. Also tells the iframe that we're listening and requests the
 * initial height. Returns an `unobserve()` function for later removing the
 * listener.
 *
 * @param {HTMLIFrameElement} iframe the iframe to observe
 * @returns {() => void}
 * @example
 *
 * // grab a reference to an existing iframe
 * const iframe = document.getElementById('my-embed');
 *
 * // returns a `unobserve()` function if you need to stop listening
 * const unobserve = observeIframe(iframe);
 *
 * // later, if you need to disconnect from the iframe
 * unobserve();
 */
export function observeIframe(iframe) {
	/**
	 * @private
	 * @param {MessageEvent} event
	 * @returns {void}
	 */
	function processMessage(event) {
		// this message isn't from our created frame, stop here
		if (event.source !== iframe.contentWindow) {
			return;
		}

		const { data } = event;

		// if the sentinel and type matches, update our height
		if (data.sentinel === AMP_SENTINEL && data.type === EMBED_SIZE) {
			iframe.setAttribute(HEIGHT, data.height);
		} else if (typeof data === 'string' && data.slice(0, 3) === PYM_SENTINEL) {
			const [, , type, height] = data.split(PYM_REGEX);

			if (type === HEIGHT) {
				iframe.setAttribute(HEIGHT, height);
			}
		}
	}

	window.addEventListener('message', processMessage, false);

	// tell the iframe we've connected
	if (iframe.contentWindow) {
		iframe.contentWindow.postMessage(
			{ sentinel: AMP_SENTINEL, type: INITIAL_MESSAGE },
			'*',
		);
	}

	return function unobserve() {
		window.removeEventListener('message', processMessage, false);
	};
}

/**
 * @typedef {object} FramerOptions
 * @property {string | null} [src] the URL to set as the `src` of the iframe
 * @property {Record<string, string>} [attributes] any attributes to add to the iframe itself
 */

/**
 * The Framer function to be called in the host page. A wrapper around
 * interactions with a created iframe. Returns a `remove()` function for
 * disconnecting the event listener and removing the iframe from the DOM.
 *
 * @param {Element} container the containing DOM element for the iframe
 * @param {FramerOptions} options
 * @returns {{remove: () => void}}
 */
export function Framer(container, { attributes, src } = {}) {
	// create the iframe
	const iframe = document.createElement('iframe');

	// hook up our observer
	const unobserve = observeIframe(iframe);

	// set its source if provided
	if (src) {
		iframe.setAttribute('src', src);
	}

	// set some smart default attributes
	iframe.setAttribute('width', '100%');
	iframe.setAttribute('scrolling', 'no');
	iframe.setAttribute('marginheight', '0');
	iframe.setAttribute('frameborder', '0');

	if (attributes) {
		// apply any supplied attributes
		for (let key in attributes) {
			const value = attributes[key];

			iframe.setAttribute(key, value);
		}
	}

	// append it to the container
	container.appendChild(iframe);

	return {
		remove() {
			unobserve();
			container.removeChild(iframe);
		},
	};
}
