import { Framer } from './framer.js';
import { getMatchingAttributes } from './utils.js';
import { FRAME_AUTO_INITIALIZED, FRAME_SRC } from './constants.js';

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
