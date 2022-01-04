import { observeIframe } from './framer.js';

class NewswireFrameElement extends HTMLElement {
	constructor() {
		super();

		this.src = this.getAttribute('src');
	}

	get iframe() {
		if (this.firstElementChild instanceof HTMLIFrameElement) {
			return this.firstElementChild;
		} else {
			return null;
		}
	}

	connectedCallback() {
		if (this.iframe === null) {
			const iframe = document.createElement('iframe');
			iframe.src = this.src;
			iframe.setAttribute('width', '100%');
			iframe.setAttribute('scrolling', 'no');
			iframe.setAttribute('marginheight', '0');
			iframe.setAttribute('frameborder', '0');
			this.appendChild(iframe);
		}

		this.unobserve = observeIframe(this.iframe);
	}

	disconnectedCallback() {
		this.unobserve();
	}
}

export default NewswireFrameElement;

if (!window.customElements.get('newswire-frame')) {
	window.customElements.define('newswire-frame', NewswireFrameElement);
}
