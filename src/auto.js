import { Framer } from './framer.js';
import {
	FRAME_ATTRIBUTE_PREFIX,
	FRAME_AUTO_INITIALIZED,
	FRAME_SRC,
} from './constants.js';

/**
 * @private
 * @type {number}
 */
const prefixLength = FRAME_ATTRIBUTE_PREFIX.length;

/**
 * Searches an element's attributes and returns an Object of all the ones that
 * begin with our prefix. Each matching attribute name is returned
 * without the prefix.
 *
 * @private
 * @param  {Element} element
 * @return {{[key: string]: string }}
 */
function getMatchingAttributes(element) {
	// prepare the object to return
	/** @type {{[key: string]: string }} */
	const attrs = {};

	// grab all the attributes off the element
	const map = element.attributes;

	// get a count of the number of attributes
	const length = map.length;

	// loop through the attributes
	for (let i = 0; i < length; i++) {
		// get each attribute key
		const key = map[i].name;

		// continue if the key begins with supplied prefix
		if (key.substr(0, prefixLength) === FRAME_ATTRIBUTE_PREFIX) {
			// slice off the prefix to get the bare field key
			const field = key.slice(prefixLength);

			// grab the value associated with the key
			const value = map[i].value;

			// add matching key to object
			attrs[field] = value;
		}
	}

	return attrs;
}

/**
 * Automatically initializes any frames that have not already been
 * auto-activated.
 *
 * @example
 * // sets up all frames that have not been initialized yet
 * autoInitFrames();
 */
export function autoInitFrames() {
	const elements = document.querySelectorAll(
		`[${FRAME_SRC}]:not([${FRAME_AUTO_INITIALIZED}])`,
	);

	for (let i = 0; i < elements.length; i++) {
		const container = elements[i];

		const src = container.getAttribute(FRAME_SRC);
		const attributes = getMatchingAttributes(container);
		container.setAttribute(FRAME_AUTO_INITIALIZED, '');

		Framer(container, { attributes, src });
	}
}
