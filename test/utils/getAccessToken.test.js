import {getAccessToken} from '../../src/utils/getAccessToken';
import * as oauth from '../../src/utils/oauth';

describe('getAccessToken', () => {
  describe('reject with error', () => {
    it.each([null, undefined, 'test', {}, false, true, {oauthTokens: {}}])(
      'error - invalid oauthTokens object',
      async (invalidAuthData) => {
        oauth.getAuthData = jest.fn().mockReturnValueOnce(invalidAuthData);

        await expect(getAccessToken()).rejects.toThrowError(
          'Expired authentication tokens',
        );
      },
    );

    it.each([null, undefined, {}, false, true, {oauthTokens: {}}])(
      'error - invalid accessToken',
      async (invalidAccessToken) => {
        oauth.getAuthData = jest.fn().mockReturnValueOnce({
          oauthTokens: {accessToken: invalidAccessToken},
        });

        await expect(getAccessToken()).rejects.toThrowError(
          'Expired authentication access token',
        );
      },
    );
  });

  it('returns the accessToken', async () => {
    oauth.getAuthData = jest.fn().mockReturnValueOnce({
      oauthTokens: {
        accessToken: 'test123',
      },
    });

    const accessToken = await getAccessToken();

    expect(accessToken).toBe('test123');
  });
});
