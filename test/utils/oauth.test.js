import AsyncStorage from '@react-native-async-storage/async-storage';
import {refresh} from 'react-native-app-auth';
import {
  storeTokensCache,
  parseExpirationDate,
  getTokensCache,
  refreshAuthToken,
} from '../../src/utils/oauth';
import keys from '../../src/keys';

describe('OAuth Utils', () => {
  beforeEach(() => {
    AsyncStorage.clear();
  });

  describe('parseExpirationDate', () => {
    it('must parse string date to miliseconds number', () => {
      const stringDate = 'Mon Mar 22 2021 19:50:19 GMT-0300';
      const expectedMiliseconds = 1616453419000;

      expect(parseExpirationDate(stringDate)).toBe(expectedMiliseconds);
    });
  });

  describe('storeTokensCache', () => {
    it('must save tokens data on async storage', async () => {
      const tokensMock = {
        accessTokenExpirationDate: 'Mon Mar 22 2021 20:08:27 GMT-0300',
        tokenType: 'Bearer',
        expiresIn: 172799,
        scope: 'openid profile email oms:order:read',
        accessToken: 'access-token-1',
        idToken: 'id-token-1',
      };

      const stringifiedMock = JSON.stringify(tokensMock);

      const res = await storeTokensCache(tokensMock);

      expect(res).toBe(true);
      expect(AsyncStorage.setItem).toBeCalledWith(
        keys.OAUTH_TOKENS_KEY,
        stringifiedMock,
      );
    });

    it(`must return error if accessTokenExpirationDate doesn't exists`, async () => {
      try {
        const tokensMock = {};

        await storeTokensCache(tokensMock);
      } catch (error) {
        expect(error).not.toBeUndefined();
      }
    });

    it('must return error if oauthTokens is undefined', async () => {
      try {
        await storeTokensCache();
      } catch (error) {
        expect(error).not.toBeUndefined();
      }
    });
  });

  describe('getTokensCache', () => {
    it('must get tokens data from async storage', async () => {
      AsyncStorage.setItem(keys.OAUTH_TOKENS_KEY, JSON.stringify({a: 1, b: 2}));
      AsyncStorage.setItem(
        keys.OAUTH_TOKENS_EXPIRATION_KEY,
        JSON.stringify(12341234),
      );

      const res = await getTokensCache();

      expect(res).toEqual({
        expiration: '12341234',
        oauthTokens: {
          a: 1,
          b: 2,
        },
      });

      expect(AsyncStorage.getItem).toBeCalledWith(keys.OAUTH_TOKENS_KEY);
      expect(AsyncStorage.getItem).toBeCalledWith(
        keys.OAUTH_TOKENS_EXPIRATION_KEY,
      );
    });

    it('must return null tokens and expiration if there is nothing on async storage', async () => {
      const expected = {expiration: null, oauthTokens: null};

      const res = await getTokensCache();

      expect(res).toEqual(expected);
    });
  });

  describe('refreshAuthToken', () => {
    it('must call "refresh" fn with params from package', () => {
      const config = {
        issuer: 'https://app.example.com',
        clientId: 'c1e2e8d5-ccea-47aa-9075-f9741fe11452',
        redirectUrl: 'example/callback',
        scopes: ['openid', 'profile', 'email', 'offline_access'],
        serviceConfiguration: {
          authorizationEndpoint: 'https://app.example.com/oauth/authorize',
          tokenEndpoint: 'https://app.example.com/2.0/token',
        },
      };

      refreshAuthToken('refresh-token-1', config);
      expect(refresh).toBeCalledWith(config, {refreshToken: 'refresh-token-1'});
    });

    it('must catch error if refreshToken param is undefined', async () => {
      try {
        await refreshAuthToken(undefined, {a: 1, b: 2});
      } catch (error) {
        expect(error).not.toBeUndefined();
      }
    });

    it('must catch error if config param is undefined', async () => {
      try {
        await refreshAuthToken('refresh-token-1', undefined);
      } catch (error) {
        expect(error).not.toBeUndefined();
      }
    });
  });
});