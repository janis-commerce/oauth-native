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
  if (!expirationDate) return null;

  return Date.parse(expirationDate);
};

/**
 * @name isExpired
 * @description - function to verify a expiration date
 * @private
 * @param {string|number} expiration - expiration number in hours
 * @returns {boolean} - true if is expired
 */
export const isExpired = (expiration) => {
  if (!expiration || Number.isNaN(Number(expiration))) return true;

  return Date.now() >= Number(expiration);
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
 * @private
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
    return Promise.reject(reason);
  }
};

/**
 * @name getLoginObj
 * @description - get login obj info
 * @private
 * @param {object} tokens - oauth tokens
 * @returns {object} - object with user login data
 */
export const getLoginObj = (tokens) => ({
  isLogged: !!tokens,
  oauthTokens: tokens || {},
});

/**
 * @name getAuthData
 * @description - function to get user tokens
 * @private
 * @returns {object} - object with user authorization/login tokens
 */
export const getAuthData = async (config = {}) => {
  try {
    const {oauthTokens, expiration} = await getTokensCache();

    const {refreshToken = ''} = oauthTokens || {};

    if (refreshToken && isExpired(expiration)) {
      const newTokens = await refreshAuthToken(refreshToken, config);

      return getLoginObj(newTokens);
    }

    return getLoginObj(oauthTokens);
  } catch (error) {
    return getLoginObj();
  }
};

/**
 * @name clearAuthorizeTokens
 * @description - clear user tokens from async storage
 * @private
 * @returns {boolean} - true if tokens was cleared, false if some error has ocurred
 */
export const clearAuthorizeTokens = async () => {
  try {
    await AsyncStorage.removeItem(keys.OAUTH_TOKENS_KEY);
    await AsyncStorage.removeItem(keys.OAUTH_TOKENS_EXPIRATION_KEY);

    return true;
  } catch (reason) {
    return false;
  }
};
