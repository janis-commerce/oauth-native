/**
 * @name asyncWrap
 * @description wrapper to handle promises responses and erros
 * @private
 * @param {promise} promise - promise to handle response
 * @returns {promise} - resolves Array with response and error items.
 * @example const [res, error] = await asyncWrap(myPromise());
 */
export const asyncWrap = (promise) =>
  promise
    .then((data) => [data, undefined])
    .catch((error) => Promise.resolve([undefined, error]));
