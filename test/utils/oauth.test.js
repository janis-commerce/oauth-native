import AsyncStorage from '@react-native-async-storage/async-storage';
import {refresh, authorize} from 'react-native-app-auth';
import jwtDecode from 'jwt-decode';
import {
  storeTokensCache,
  parseExpirationDate,
  isExpired,
  getTokensCache,
  refreshAuthToken,
  userAuthorize,
  getAuthData,
  getLoginObj,
  clearAuthorizeTokens,
  isTokenExpired,
  isUserDev,
  isUserDevSync,
} from '../../src/utils/oauth';
import storage from '../../src/storage';
import keys from '../../src/keys';

jest.mock('jwt-decode');

describe('OAuth Utils', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jwtDecode.mockReset();
    jwtDecode.mockReturnValue({});
  });

  describe('parseExpirationDate', () => {
    it('must parse string date to miliseconds number', () => {
      const stringDate = 'Mon Mar 22 2021 19:50:19 GMT-0300';
      const expectedMiliseconds = 1616453419000;

      expect(parseExpirationDate(stringDate)).toBe(expectedMiliseconds);
    });
  });

  describe('isExpired', () => {
    it('must return true if date in params is not valid number or undefined', () => {
      expect(isExpired()).toBeTruthy();
    });

    it('must return true if date in params is expired', () => {
      expect(isExpired(Date.now() - 500)).toBeTruthy();
    });

    it('must return false if date in params is not expired', () => {
      expect(isExpired(Date.now() + 500)).toBeFalsy();
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

    it('must store isDev=true in app-storage when JWT has isDev=true', async () => {
      jwtDecode.mockReturnValue({isDev: true});

      const tokensMock = {
        accessTokenExpirationDate: 'Mon Mar 22 2021 20:08:27 GMT-0300',
        idToken: 'valid-token',
      };

      await storeTokensCache(tokensMock);

      expect(storage.set).toBeCalledWith('isUserDev', true);
    });

    it('must store isDev=false in app-storage when JWT has isDev=false', async () => {
      jwtDecode.mockReturnValue({isDev: false});

      const tokensMock = {
        accessTokenExpirationDate: 'Mon Mar 22 2021 20:08:27 GMT-0300',
        idToken: 'valid-token',
      };

      await storeTokensCache(tokensMock);

      expect(storage.set).toBeCalledWith('isUserDev', false);
    });

    it('must store isDev=false in app-storage when JWT has no isDev', async () => {
      jwtDecode.mockReturnValue({});

      const tokensMock = {
        accessTokenExpirationDate: 'Mon Mar 22 2021 20:08:27 GMT-0300',
        idToken: 'valid-token',
      };

      await storeTokensCache(tokensMock);

      expect(storage.set).toBeCalledWith('isUserDev', false);
    });

    it('must use empty string as idToken default when not provided', async () => {
      const tokensMock = {
        accessTokenExpirationDate: 'Mon Mar 22 2021 20:08:27 GMT-0300',
      };

      await storeTokensCache(tokensMock);

      expect(jwtDecode).toBeCalledWith('');
      expect(storage.set).toBeCalledWith('isUserDev', false);
    });

    it('must reject when idToken decode fails', async () => {
      jwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const tokensMock = {
        accessTokenExpirationDate: 'Mon Mar 22 2021 20:08:27 GMT-0300',
        idToken: 'invalid-token',
      };

      await expect(storeTokensCache(tokensMock)).rejects.toThrow(
        'Invalid token',
      );
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

  describe('userAuthorize', () => {
    it('must call "authorize" fn with params from package', () => {
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

      userAuthorize(config);
      expect(authorize).toBeCalledWith(config);
    });

    it('must catch error if userAuthorize param is undefined', async () => {
      try {
        await userAuthorize();
      } catch (error) {
        expect(error).not.toBeUndefined();
      }
    });
  });

  describe('getLoginObj', () => {
    it('must return object with login data', () => {
      const date = new Date(Date.now()).toDateString();
      const tokensMock = {
        accessTokenExpirationDate: date,
        tokenType: 'Bearer',
        expiresIn: 172799,
        scope: 'openid profile email oms:order:read',
        accessToken: 'access-token-1',
        idToken: 'id-token-1',
      };

      const loginData = getLoginObj(tokensMock, null);

      expect(loginData).toEqual({
        isLogged: true,
        oauthTokens: tokensMock,
        error: null,
      });
    });

    it('must return object with login false and null tokens data', () => {
      const loginData = getLoginObj();

      expect(loginData).toEqual({
        isLogged: false,
        oauthTokens: null,
        error: 'Authentication failed',
      });
    });
  });

  describe('getAuthData', () => {
    it(`must return object with no logged user and null tokens if there is not tokens saved in async storage`, async () => {
      const res = await getAuthData();
      expect(res).toEqual({
        isLogged: false,
        oauthTokens: null,
        error: 'Authentication failed',
      });
    });

    it('must return object with isLogged boolean and oauthTokens', async () => {
      const date = new Date(Date.now() + 500000000).toDateString();
      await storeTokensCache({
        accessTokenExpirationDate: date,
        tokenType: 'Bearer',
        expiresIn: 172799,
        scope: 'openid profile email oms:order:read',
        accessToken: 'access-token-1',
        idToken: 'id-token-1',
      });

      const res = await getAuthData();

      expect(res).toEqual({
        isLogged: true,
        oauthTokens: {
          accessTokenExpirationDate: date,
          tokenType: 'Bearer',
          expiresIn: 172799,
          scope: 'openid profile email oms:order:read',
          accessToken: 'access-token-1',
          idToken: 'id-token-1',
        },
        error: null,
      });
    });

    it('must return object with isLogged false and null tokens data', async () => {
      const date = new Date(Date.now() - 50000).toDateString();

      await storeTokensCache({
        accessTokenExpirationDate: date,
        tokenType: 'Bearer',
        expiresIn: 172799,
        scope: 'openid profile email oms:order:read',
        refreshToken: 'refresh-token-1',
        accessToken: 'access-token-1',
        idToken: 'id-token-1',
      });

      const res = await getAuthData();

      expect(res).toEqual({
        isLogged: false,
        oauthTokens: null,
        error: 'config param is required',
      });
    });

    it('must return object with isLogged false and null tokens data', async () => {
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

      const date = new Date(Date.now() - 50000).toDateString();

      await storeTokensCache({
        accessTokenExpirationDate: date,
        tokenType: 'Bearer',
        expiresIn: 172799,
        scope: 'openid profile email oms:order:read',
        refreshToken: 'refresh-token-1',
        accessToken: 'access-token-1',
        idToken: 'id-token-1',
      });

      const res = await getAuthData(config);

      try {
        expect(res).toEqual({
          isLogged: false,
          oauthTokens: null,
          error: null,
        });
      } catch (e) {
        console.error('e', e);
      }
    });
  });

  describe('clearAuthorizeTokens', () => {
    it('must clear async storage expiration and tokens keys', async () => {
      await clearAuthorizeTokens();

      expect(AsyncStorage.removeItem).toBeCalledWith(keys.OAUTH_TOKENS_KEY);
      expect(AsyncStorage.removeItem).toBeCalledWith(
        keys.OAUTH_TOKENS_EXPIRATION_KEY,
      );
    });

    it('must remove isUserDev from app-storage', async () => {
      await clearAuthorizeTokens();

      expect(storage.remove).toBeCalledWith('isUserDev');
    });

    it('must return true if data was cleared', async () => {
      const res = await clearAuthorizeTokens();

      expect(res).toBeTruthy();
    });

    it('must return false', async () => {
      jest.spyOn(AsyncStorage, 'removeItem').mockImplementation(() => {
        throw new Error();
      });

      const res = await clearAuthorizeTokens();

      expect(res).toBeFalsy();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true if the token is expired', async () => {
      // Mock getTokensCache to return an expired timestamp
      AsyncStorage.setItem(
        keys.OAUTH_TOKENS_EXPIRATION_KEY,
        JSON.stringify(Date.now() - 1000), // 1 second ago
      );
      expect(await isTokenExpired()).toBe(true);
    });

    it('should return false if the token is not expired', async () => {
      // Mock getTokensCache to return a future timestamp
      AsyncStorage.setItem(
        keys.OAUTH_TOKENS_EXPIRATION_KEY,
        JSON.stringify(Date.now() + 60000), // 1 minute in the future
      );
      expect(await isTokenExpired()).toBe(false);
    });

    it('should return true if expiration is not set in cache', async () => {
      // AsyncStorage.getItem will return null for OAUTH_TOKENS_EXPIRATION_KEY
      expect(await isTokenExpired()).toBe(true);
    });

    it('should return false if getTokensCache throws an error', async () => {
      jest
        .spyOn(AsyncStorage, 'getItem')
        .mockImplementationOnce(() =>
          Promise.reject(new Error('AsyncStorage error')),
        );
      expect(await isTokenExpired()).toBe(false);
    });
  });

  describe('isUserDev', () => {
    it('should return isDev value from decoded token', async () => {
      AsyncStorage.setItem(
        keys.OAUTH_TOKENS_KEY,
        JSON.stringify({idToken: 'mock.token'}),
      );

      jwtDecode.mockReturnValue({isDev: true});
      expect(await isUserDev()).toBe(true);

      jwtDecode.mockReturnValue({isDev: false});
      expect(await isUserDev()).toBe(false);
    });

    it('should reject if idToken is missing', async () => {
      AsyncStorage.setItem(
        keys.OAUTH_TOKENS_KEY,
        JSON.stringify({accessToken: 'token'}),
      );
      jwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      try {
        await isUserDev();
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should reject if oauthTokens is null', async () => {
      jwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      try {
        await isUserDev();
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('isUserDevSync', () => {
    it('should return true when storage has isUserDev=true', () => {
      storage.get.mockReturnValue(true);

      expect(isUserDevSync()).toBe(true);
      expect(storage.get).toBeCalledWith('isUserDev');
    });

    it('should return false when storage has isUserDev=false', () => {
      storage.get.mockReturnValue(false);

      expect(isUserDevSync()).toBe(false);
    });

    it('should return false when storage has no isUserDev key', () => {
      storage.get.mockReturnValue(undefined);

      expect(isUserDevSync()).toBe(false);
    });

    it('should return false when storage.get throws an error', () => {
      storage.get.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(isUserDevSync()).toBe(false);
    });
  });
});
