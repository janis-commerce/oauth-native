import AsyncStorage from '@react-native-async-storage/async-storage';
import {storeTokensCache, parseExpirationDate} from '../../src/utils/oauth';
import keys from '../../src/keys';

describe('OAuth Utils', () => {
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
});
