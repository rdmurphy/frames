// for the host or parent page
export { Framer, observeIframe } from './framer.js';
export { autoInitFrames } from './auto.js';

// for the frame or child page
export {
	initFrame,
	initFrameAndPoll,
	sendFrameHeight,
	sendHeightOnLoad,
	sendHeightOnPoll,
	sendHeightOnResize,
} from './frames.js';
