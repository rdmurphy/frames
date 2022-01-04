import { observeIframe } from '/index.js';

window.unobserve = observeIframe(document.querySelector('iframe'));
