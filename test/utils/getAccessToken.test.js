import {getAccessToken} from '../../src/utils/getAccessToken';
import * as oauth from '../../src/utils/oauth';

describe('getAccessToken', () => {
  describe('reject with error', () => {
    it('when get auth data fails', async () => {
      oauth.getAuthData = jest.fn().mockReturnValueOnce({
        oauthTokens: {},
        error: 'refresh error message',
      });

      await expect(getAccessToken()).rejects.toThrowError(
        'refresh error message',
      );
    });
    it.each([null, 'test', false, true])(
      'error - invalid oauthTokens object',
      async (invalidAuthData) => {
        oauth.getAuthData = jest
          .fn()
          .mockReturnValueOnce({oauthTokens: invalidAuthData});

        await expect(getAccessToken()).rejects.toThrowError(
          'Invalid authentication tokens types',
        );
      },
    );

    it('error - expired authentication tokens', async () => {
      oauth.getAuthData = jest.fn().mockReturnValueOnce({
        oauthTokens: undefined,
        error: null,
      });

      await expect(getAccessToken()).rejects.toThrowError(
        'Expired authentication tokens',
      );
    });
    it.each([null, false, true])(
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

    it('error - expired authentication access token when oauthTokens not contains accessToken data', async () => {
      oauth.getAuthData = jest.fn().mockReturnValueOnce({
        oauthTokens: {mockedToken: 'mockedToken'},
      });

      await expect(getAccessToken()).rejects.toThrowError(
        'Expired authentication access token',
      );
    });
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
