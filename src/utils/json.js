/**
 * @name parseJson
 * @description - function to parse json to object
 * @private
 * @param {object} json - object on json format
 * @returns {object} - parsed object
 */
export const parseJson = (json) => {
  try {
    if (typeof json === 'object') return json;

    return JSON.parse(json);
  } catch (error) {
    return {};
  }
};

/**
 * @name stringifyJson
 * @description - function to stringify an object
 * @private
 * @param {object} obj - object to stringify
 * @returns {object} - json string
 */
export const stringifyJson = (obj) => {
  if (!obj || typeof obj !== 'object') return '';

  return JSON.stringify(obj);
};
