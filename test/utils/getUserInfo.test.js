import AsyncStorage from '@react-native-async-storage/async-storage';
import * as jwtDecode from 'jwt-decode';
import jwtDecodeUserMock from '../../mocks/jwt-decode';
import {getUserInfo} from '../../src/utils/getUserInfo';
import keys from '../../src/keys';
import * as oauth from '../../src/utils/oauth';

jest.mock('jwt-decode', () => {
  const jwtDecodeMock = () => ({
    appClientId: '6bc6b92e-6283-4ad0-939a-8f16072d2e7f',
    createdAt: '2020-12-14T18:45:28.306Z',
    email: 'fernando.colom@janis.im',
    exp: 1697285104,
    family_name: 'Colom',
    given_name: 'Fernando',
    isDev: true,
    iss: 'https://id.janisdev.in',
  });

  return jwtDecodeMock;
});

describe('getUserInfo', () => {
  describe('throws error with', () => {
    it('with no get oauth tokens', async () => {
      jest
        .spyOn(AsyncStorage, 'getItem')
        .mockReturnValueOnce(keys.OAUTH_TOKENS_KEY);

      try {
        await getUserInfo();
      } catch (error) {
        expect(error.message).toBe('Expired authentication tokens');
      }
    });

    it('with no get id token', async () => {
      jest
        .spyOn(AsyncStorage, 'getItem')
        .mockReturnValueOnce({example: 'example'});

      try {
        await getUserInfo();
      } catch (error) {
        expect(error.message).toBe('Expired authentication id token');
      }
    });
    it('obtains null oauthData or this is not an object', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockReturnValueOnce(null);

      try {
        await getUserInfo();
      } catch (error) {
        expect(error.message).toBe('Invalid authentication tokens types');
      }
    });

    it('get auth data throws an error', async () => {
      oauth.getAuthData = jest.fn().mockReturnValueOnce({
        error: 'refresh error message',
      });

      await expect(getUserInfo()).rejects.toThrowError('refresh error message');
    });
  });

  describe('returns with', () => {
    it('a correct response', async () => {
      const dataMock = {idToken: 'example'};
      oauth.getAuthData = jest.fn().mockReturnValueOnce({
        oauthTokens: dataMock,
      });
      jest.spyOn(jwtDecode, 'default');

      const response = await getUserInfo();
      expect(response).toEqual(jwtDecodeUserMock);
    });
  });
});
