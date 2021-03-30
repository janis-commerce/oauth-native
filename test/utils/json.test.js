import {parseJson, stringifyJson} from '../../src/utils/json';

describe('JSON utils', () => {
  describe('parseJson', () => {
    it('must return same object if param is a valid object', () => {
      expect(parseJson({a: 1, b: 2})).toEqual({a: 1, b: 2});
    });

    it('must return object if a valid json is passed ', () => {
      expect(parseJson('{"a": 1, "b": 2}')).toEqual({a: 1, b: 2});
    });

    it('must return empty object if invalid json is passed ', () => {
      expect(parseJson('asd')).toEqual({});
    });
  });

  describe('stringifyJson', () => {
    it('must return json if a valid obj is passed ', () => {
      expect(stringifyJson({a: 1, b: 2})).toEqual(`{"a":1,"b":2}`);
    });

    it('must return empty string if obj param is not defined or is not an object', () => {
      expect(stringifyJson()).toBe('');
    });

    it('must return empty string if obj param is not defined or is not an object', () => {
      expect(stringifyJson(123)).toBe('123');
    });

    it('must return same string if obj param is a string yet', () => {
      expect(stringifyJson('asd')).toBe('asd');
    });
  });
});
