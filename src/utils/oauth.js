import AsyncStorage from '@react-native-async-storage/async-storage';
import keys from '../keys';
// import {authorize, refresh} from 'react-native-app-auth';

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
      JSON.stringify(oauthTokens),
    );

    await AsyncStorage.setItem(
      keys.OAUTH_TOKENS_EXPIRATION_KEY,
      JSON.stringify(expiration),
    );

    return true;
  } catch (error) {
    return Promise.reject(error);
  }
};
