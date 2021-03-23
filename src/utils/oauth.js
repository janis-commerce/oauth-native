import AsyncStorage from '@react-native-async-storage/async-storage';
import {refresh, authorize} from 'react-native-app-auth';
import keys from '../keys';
import {parseJson, stringifyJson} from './json';

/**
 * @name parseExpirationDate
 * @description function to parse a string date to miliseconds number
 * @private
 * @param {string} expirationDate - date in string format
 * @returns {number} miliseconds
 */
export const parseExpirationDate = (expirationDate) => {
  if (!expirationDate || typeof expirationDate !== 'string') return null;

  return Date.parse(expirationDate);
};

/**
 * @name storeTokensCache
 * @description - save user tokens on local device memory (async storage)
 * @private
 * @param {object} oauthTokens object with oauth tokens
 * @returns {promise} - resolves with true if data was saved or reject with error if something was failed
 */
export const storeTokensCache = async (oauthTokens) => {
  try {
    const {accessTokenExpirationDate = ''} = oauthTokens || {};
    const expiration = parseExpirationDate(accessTokenExpirationDate);

    if (!expiration)
      throw new Error('oauthTokens.accessTokenExpirationDate is required');

    await AsyncStorage.setItem(
      keys.OAUTH_TOKENS_KEY,
      stringifyJson(oauthTokens),
    );

    await AsyncStorage.setItem(
      keys.OAUTH_TOKENS_EXPIRATION_KEY,
      stringifyJson(expiration),
    );

    return true;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * @name getTokensCache
 * @description - get user tokens from local device memory (async storage)
 * @private
 * @returns {promise} - resolve an object with tokens data and expiration
 */
export const getTokensCache = async () => {
  const res = await AsyncStorage.getItem(keys.OAUTH_TOKENS_KEY);

  const expiration = await AsyncStorage.getItem(
    keys.OAUTH_TOKENS_EXPIRATION_KEY,
  );

  const oauthTokens = parseJson(res);

  return {oauthTokens, expiration};
};

/**
 * @name refreshAuthToken
 * @description function to get new valid token from refresh token
 * @private
 * @param {string} refreshToken
 * @param {object} config - object with react-native-app-auth package config
 * @returns {promise} resolves with new valid tokens
 */
export const refreshAuthToken = async (refreshToken = '', config = {}) => {
  try {
    if (!refreshToken) throw new Error('refreshToken param is required');

    if (!config || !Object.keys(config).length)
      throw new Error('config param is required');

    const newAuthState = await refresh(config, {
      refreshToken,
    });

    storeTokensCache(newAuthState);

    return newAuthState;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * @name userAuthorize
 * @description - function to initialize user authorization flow
 * @param {object} config - object with react-native-app-auth package config
 * @returns {promise} - resolves with user tokens
 */
export const userAuthorize = async (config = {}) => {
  try {
    if (!config || !Object.keys(config).length)
      throw new Error('config param is required');

    const authState = await authorize(config);

    storeTokensCache(authState);

    return authState;
  } catch (reason) {
    console.log('userAuthorize error', reason);
    return Promise.reject(reason);
  }
};
