import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import {parseJson} from './json';
import keys from '../keys';

/**
 * @name getUserInfo
 * @description - returns user data information without depending on a context.
 * @private
 * @param {object} - object with user authorization/login tokens
 * @returns {object} - user data object
 */
export const getUserInfo = async () => {
  try {
    const getStorageTokens = await AsyncStorage.getItem(keys.OAUTH_TOKENS_KEY);
    const oauthTokens = parseJson(getStorageTokens) || {};

    if (!Object.keys(oauthTokens).length) throw Error('cant get oauth tokens');

    const {idToken = ''} = oauthTokens;

    if (!idToken) throw Error('cant get id token');

    return jwtDecode(idToken);
  } catch (error) {
    return Promise.reject(error);
  }
};
