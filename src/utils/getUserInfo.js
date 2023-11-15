import jwtDecode from 'jwt-decode';
import {getAuthData} from './oauth';

/**
 * @name getUserInfo
 * @description - returns user data information without depending on a context.
 * @private
 * @param {object} - object with user authorization/login tokens
 * @returns {object} - user data object
 */
export const getUserInfo = async () => {
  try {
    const {oauthTokens} = await getAuthData();

    if (!Object.keys(oauthTokens).length)
      throw new Error('cant get oauth tokens');

    const {idToken = ''} = oauthTokens;

    if (!idToken) throw new Error('cant get id token');

    return jwtDecode(idToken);
  } catch (error) {
    return Promise.reject(error);
  }
};
