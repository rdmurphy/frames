import { EMBED_SIZE, SENTINEL } from './constants.mjs';

/**
 * The Framer object to be called in the parent page.
 *
 * @param {Element} element the containing DOM element for the iframe
 * @param {string} url the URL to set as the `src` of the iframe
 * @param {object} [options] optional options to be set on the iframe
 * @param {boolean} [options.allowfullscreen] toggles the `allowfullscreen` attribute
 * @param {boolean} [options.allowpaymentrequest] toggles the `allowpaymentrequest` attribute
 * @param {string} [options.name] sets the `name` attribute
 * @param {string} [options.referrerpolicy] sets the `referrerpolicy` attribute
 * @param {string} [options.sandbox] sets the `sandbox` attribute
 */
class Framer {
  constructor(
    element,
    url,
    {
      allowfullscreen = false,
      allowpaymentrequest = false,
      name,
      referrerpolicy,
      sandbox = 'allow-scripts',
    } = {}
  ) {
    this.element = element;
    this.url = url;
    this.allowfullscreen = allowfullscreen;
    this.allowpaymentrequest = allowpaymentrequest;
    this.name = name;
    this.referrerpolicy = referrerpolicy;
    this.sandbox = sandbox;
    this.iframe = null;
    this.isLoaded = false;
    this.queue = [];

    this.processMessage_ = this.processMessage_.bind(this);
    window.addEventListener('message', this.processMessage_, false);

    this.createIframe_();
  }

  /**
   * Creates the iframe element and sets the source of the iframe.
   *
   * @private
   * @returns {void}
   */
  createIframe_() {
    this.iframe = document.createElement('iframe');

    this.iframe.onload = () => {
      this.isLoaded = true;
      const queue = this.queue;

      while (queue.length) {
        const message = queue.shift();
        this.sendMessage(message[0], message[1]);
      }
    };

    this.iframe.setAttribute('src', this.url);
    this.iframe.setAttribute('width', '100%');
    this.iframe.setAttribute('scrolling', 'no');
    this.iframe.setAttribute('marginheight', '0');
    this.iframe.setAttribute('frameborder', '0');

    if (this.allowfullscreen) {
      this.iframe.setAttribute('allowfullscreen', '');
    }

    if (this.allowpaymentrequest) {
      this.iframe.setAttribute('allowpaymentrequest', '');
    }

    if (this.name) {
      this.iframe.setAttribute('name', name);
    }

    if (this.referrerpolicy) {
      this.iframe.setAttribute('referrerpolicy', this.referrerpolicy);
    }

    this.iframe.setAttribute('sandbox', this.sandbox);

    this.element.appendChild(this.iframe);
  }

  /**
   * Receives a message from the iframe. Checks to make sure it is only listening
   * to the iframe it created.
   *
   * @private
   * @param {Event} event
   * @returns {void}
   */
  processMessage_(event) {
    if (event.source !== this.iframe.contentWindow) return;

    const { data } = event;

    if (data.sentinel !== SENTINEL) return;

    if (data.type === EMBED_SIZE) {
      this.setIframeHeight_(data.height);
    }
  }

  /**
   * Sets the iframe's height.
   *
   * @private
   * @param {number} height
   * @returns {void}
   */
  setIframeHeight_(height) {
    this.iframe.setAttribute('height', height);
  }

  /**
   * Sends an arbitrary message to the iframe.
   *
   * @param {string} type
   * @param {object} [data]
   * @example
   *
   * framer.sendMessage('send-trigger', { info: 'important' });
   *
   * // the frame recieves the following:
   * // {
   * //   sentinel: '<value>',
   * //   type: 'send-trigger',
   * //   info: 'important',
   * // }
   */
  sendMessage(type, data = {}) {
    if (!this.isLoaded) {
      this.queue.push([type, data]);
    } else {
      this.iframe.contentWindow.postMessage(
        {
          sentinel: SENTINEL,
          type,
          ...data,
        },
        '*'
      );
    }
  }
}

export { Framer };
