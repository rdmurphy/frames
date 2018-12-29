import { getMatchingAttributes } from './utils.mjs';
import {
  AMP_SENTINEL,
  EMBED_SIZE,
  FRAME_PREFIX,
  FRAME_AUTO_INITIALIZED_ATTRIBUTE,
  FRAME_SRC_ATTRIBUTE,
} from './constants.mjs';

/**
 * The Framer object to be called in the host page. Effectively a wrapper around
 * interactions with an embedded iframe.
 *
 * @param {object} options options used to prepare the iframe
 * @param {Element} options.container the containing DOM element for the iframe
 * @param {string} options.src the URL to set as the `src` of the iframe
 * @param {boolean} [options.allowfullscreen] toggles the `allowfullscreen` attribute
 * @param {string} [options.name] sets the `name` attribute
 * @param {string} [options.referrerpolicy] sets the `referrerpolicy` attribute
 * @param {string} [options.sandbox] sets the `sandbox` attribute
 */
class Framer {
  constructor({
    allowfullscreen = false,
    container,
    name,
    referrerpolicy,
    sandbox = 'allow-scripts',
    src,
  }) {
    this.container = container;
    this.src = src;
    this.allowfullscreen = allowfullscreen;
    this.name = name;
    this.referrerpolicy = referrerpolicy;
    this.sandbox = sandbox;

    this.processMessage_ = this.processMessage_.bind(this);
    window.addEventListener('message', this.processMessage_, false);

    this.createIframe_();
  }

  /**
   * Removes event listeners and removes the iframe from the container.
   *
   * @returns {void}
   * @example
   *
   * const framer = new Framer(...);
   * // tears down the Framer
   * framer.remove();
   */
  remove() {
    window.removeEventListener('message', this.processMessage_, false);
    this.container.removeChild(this.iframe);
    // important to de-reference the iframe so it can be GC'ed
    this.iframe = null;
  }

  /**
   * Creates the iframe element and sets the source of the iframe.
   *
   * @private
   * @returns {void}
   */
  createIframe_() {
    const iframe = (this.iframe = document.createElement('iframe'));

    iframe.setAttribute('src', this.src);
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('marginheight', '0');
    iframe.setAttribute('frameborder', '0');

    if (this.allowfullscreen) {
      iframe.setAttribute('allowfullscreen', '');
    }

    if (this.name) {
      iframe.setAttribute('name', name);
    }

    if (this.referrerpolicy) {
      iframe.setAttribute('referrerpolicy', this.referrerpolicy);
    }

    iframe.setAttribute('sandbox', this.sandbox);

    this.container.appendChild(iframe);
  }

  /**
   * Receives a message from the frame. Checks to make sure it is only listening
   * to the iframe it created, and that the sentinel value and type matches.
   *
   * @private
   * @param {Event} event
   * @returns {void}
   */
  processMessage_(event) {
    // this message isn't from our created frame, stop here
    if (event.source !== this.iframe.contentWindow) return;

    const { data } = event;

    // if the sentinel and type matches, update our height
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
}

/**
 * Automatically initializes any frames that have not already been
 * auto-activated.
 *
 * @returns {Array} An array of all the created Framers
 * @example
 *
 * // sets up all frames that have not been initialized yet
 * autoInitFrames();
 */
function autoInitFrames() {
  const elements = document.querySelectorAll(
    `[${FRAME_SRC_ATTRIBUTE}]:not([${FRAME_AUTO_INITIALIZED_ATTRIBUTE}])`
  );

  const activated = [];

  for (let i = 0; i < elements.length; i++) {
    const container = elements[i];

    const attributes = getMatchingAttributes(container, FRAME_PREFIX);
    container.setAttribute(FRAME_AUTO_INITIALIZED_ATTRIBUTE, '');

    activated.push(
      new Framer({
        container,
        ...attributes,
      })
    );
  }

  return activated;
}

export { autoInitFrames, Framer };
