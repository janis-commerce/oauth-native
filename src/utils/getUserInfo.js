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
    const {oauthTokens = {}, error} = await getAuthData();

    if (error) throw new Error(error);

    if (oauthTokens?.constructor !== Object)
      throw new Error('Invalid authentication tokens types');

    if (!Object.keys(oauthTokens).length)
      throw new Error('Expired authentication tokens');

    const {idToken = ''} = oauthTokens;

    if (!idToken) throw new Error('Expired authentication id token');

    return jwtDecode(idToken);
  } catch (error) {
    return Promise.reject(error);
  }
};
