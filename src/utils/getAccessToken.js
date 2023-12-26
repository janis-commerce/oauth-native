import {getAuthData} from './oauth';

/**
 * @name getAccessToken
 * @description Function to return accessToken of oauth
 * @returns {string} accessToken
 */
export const getAccessToken = async () => {
  try {
    const data = await getAuthData();
    const {oauthTokens} = data || {};

    if (!oauthTokens || !Object.keys(oauthTokens).length)
      throw new Error('cant get oauth tokens');

    const {accessToken = ''} = oauthTokens;

    if (!accessToken || typeof accessToken !== 'string')
      throw new Error('cant get accessToken');

    return accessToken;
  } catch (error) {
    return Promise.reject(error);
  }
};
