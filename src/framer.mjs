import {
  AMP_SENTINEL,
  EMBED_SIZE,
  FRAME_INITIALIZED_ATTRIBUTE,
  FRAME_SRC_ATTRIBUTE,
} from './constants.mjs';

const frames = new Set();

/**
 * The Framer object to be called in the parent page.
 *
 * @param {object} options options used to prepare the iframe
 * @param {Element} options.element the containing DOM element for the iframe
 * @param {string} options.url the URL to set as the `src` of the iframe
 * @param {boolean} [options.allowfullscreen] toggles the `allowfullscreen` attribute
 * @param {boolean} [options.allowpaymentrequest] toggles the `allowpaymentrequest` attribute
 * @param {string} [options.name] sets the `name` attribute
 * @param {string} [options.referrerpolicy] sets the `referrerpolicy` attribute
 * @param {string} [options.sandbox] sets the `sandbox` attribute
 */
class Framer {
  constructor({
    allowfullscreen = false,
    allowpaymentrequest = false,
    element,
    name,
    referrerpolicy,
    sandbox = 'allow-scripts',
    url,
  }) {
    this.element = element;
    this.url = url;
    this.allowfullscreen = allowfullscreen;
    this.allowpaymentrequest = allowpaymentrequest;
    this.name = name;
    this.referrerpolicy = referrerpolicy;
    this.sandbox = sandbox;
    this.isLoaded = false;
    this.queue = [];

    this.processMessage_ = this.processMessage_.bind(this);
    window.addEventListener('message', this.processMessage_, false);

    this.createIframe_();

    frames.add(this);
  }

  /**
   * Creates the iframe element and sets the source of the iframe.
   *
   * @private
   * @returns {void}
   */
  createIframe_() {
    const iframe = (this.iframe = document.createElement('iframe'));
    const sA = iframe.setAttribute;

    iframe.onload = () => {
      this.isLoaded = true;
      const queue = this.queue;

      while (queue.length) {
        const message = queue.shift();
        this.sendMessage(message[0], message[1]);
      }
    };

    sA('src', this.url);
    sA('width', '100%');
    sA('scrolling', 'no');
    sA('marginheight', '0');
    sA('frameborder', '0');
    sA(FRAME_INITIALIZED_ATTRIBUTE, '');

    if (this.allowfullscreen) {
      sA('allowfullscreen', '');
    }

    if (this.allowpaymentrequest) {
      sA('allowpaymentrequest', '');
    }

    if (this.name) {
      sA('name', name);
    }

    if (this.referrerpolicy) {
      sA('referrerpolicy', this.referrerpolicy);
    }

    sA('sandbox', this.sandbox);

    this.element.appendChild(iframe);
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

    if (data.sentinel === AMP_SENTINEL && data.type === EMBED_SIZE) {
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

function autoInitFrames() {
  const matches = document.querySelectorAll(
    `[${FRAME_SRC_ATTRIBUTE}]:not([${FRAME_INITIALIZED_ATTRIBUTE}])`
  );

  for (const element of matches) {
    new Framer({
      element,
      url: element.getAttribute(FRAME_SRC_ATTRIBUTE),
      sandbox: 'allow-scripts allow-same-origin',
    });
  }
}

export { autoInitFrames, frames, Framer };
