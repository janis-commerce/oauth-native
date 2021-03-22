import {asyncWrap} from '../../src/utils/promises';

const promiseMock = (haveError = false) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!haveError) return resolve(true);

      return reject(new Error('Some error has ocurred'));
    }, 200);
  });

describe('Promises utils', () => {
  describe('asyncWrap function', () => {
    test('must return an array with a "true" response, and undefined error', async () => {
      const wrappedResponse = await asyncWrap(promiseMock());

      expect(wrappedResponse).toEqual([true, undefined]);
    });

    test('must return an array with a undefined response, and some error object', async () => {
      const wrappedResponse = await asyncWrap(promiseMock(true));

      expect(wrappedResponse[0]).toBeUndefined();
      expect(typeof wrappedResponse[1]).toBe('object');
    });
  });
});
