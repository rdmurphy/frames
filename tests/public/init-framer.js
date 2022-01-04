import { Framer } from '/index.js';

window.framer = Framer(document.getElementById('iframe-container'), {
	src: '/send-frame-height-controller.html',
	attributes: { sandbox: 'allow-scripts allow-same-origin' },
});
