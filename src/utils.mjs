/**
 * A white-list of attributes to consider booleans for our purposes. Because
 * iframe attributes like "sandbox" actually mean something when they're an
 * empty string, we can't assume that means "true" across the board.
 *
 * @private
 * @type {Array}
 */
const booleans = ['allowfullscreen'];

/**
 * Searches an element's attributes and returns an Object of all the ones that
 * begin with a specified prefix. Each matching attribute name is returned
 * without the prefix.
 *
 * @private
 * @param  {Element} element
 * @param  {string} prefix
 * @return {object}
 */
function getMatchingAttributes(element, prefix) {
  // prepare the object to return
  const attrs = {};

  // grab all the attributes off the element
  const map = element.attributes;

  // get a count of the number of attributes
  const length = map.length;

  // get the prefix's length
  const prefixLength = prefix.length;

  // loop through the attributes
  for (let i = 0; i < length; i++) {
    // get each attribute key
    const key = map[i].name;

    // continue if the key begins with supplied prefix
    if (key.substr(0, prefixLength) === prefix) {
      // slice off the prefix to get the bare field key
      const field = key.slice(prefixLength);

      // grab the value associated with the key
      let value = map[i].value;

      if (booleans.indexOf(field) > -1) {
        value = true;
      }

      // add matching key to object
      attrs[field] = value;
    }
  }

  return attrs;
}

function extend(obj, props) {
  for (let i in props) obj[i] = props[i];
  return obj;
}

export { extend, getMatchingAttributes };
