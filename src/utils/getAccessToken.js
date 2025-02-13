import {getAuthData} from './oauth';

/**
 * @name getAccessToken
 * @description Function to return accessToken of oauth
 * @returns {Promise<string>} accessToken
 */
export const getAccessToken = async () => {
  try {
    const {oauthTokens = {}, error} = await getAuthData();

    if (error) throw new Error(error);

    if (oauthTokens?.constructor !== Object)
      throw new Error('Invalid authentication tokens types');

    if (!Object.keys(oauthTokens).length)
      throw new Error('Expired authentication tokens');

    const {accessToken = ''} = oauthTokens;

    if (!accessToken || typeof accessToken !== 'string')
      throw new Error('Expired authentication access token');

    return accessToken;
  } catch (error) {
    return Promise.reject(error);
  }
};
