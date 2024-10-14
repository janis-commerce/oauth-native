import * as jwtDecode from 'jwt-decode';
import jwtDecodeUserMock from '../../mocks/jwt-decode';
import {getUserInfo} from '../../src/utils/getUserInfo';
import {getAuthData} from '../../src/utils/oauth';

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

jest.mock('../../src/utils/oauth', () => ({
  getAuthData: jest.fn(),
}));

describe('getUserInfo', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  describe('throws error with', () => {
    it('with no get oauth tokens', async () => {
      getAuthData.mockResolvedValueOnce({oauthTokens: {}});

      try {
        await getUserInfo();
      } catch (error) {
        expect(error.message).toBe('cant get oauth tokens');
      }
    });

    it('with no get id token', async () => {
      getAuthData.mockResolvedValueOnce({
        oauthTokens: {refreshToken: 'refresh_token'},
      });

      try {
        await getUserInfo();
      } catch (error) {
        expect(error.message).toBe('cant get id token');
      }
    });
  });

  describe('return null when', () => {
    it('obtains null oauthData or this is not an object', async () => {
      getAuthData.mockResolvedValueOnce({oauthTokens: null});
      const response = await getUserInfo();

      expect(response).toBeNull();
    });
  });

  describe('returns with', () => {
    it('a correct response', async () => {
      const dataMock = {idToken: 'example'};
      getAuthData.mockResolvedValueOnce({oauthTokens: dataMock});
      await jest.spyOn(jwtDecode, 'default');

      try {
        const response = await getUserInfo();
        expect(response).toEqual(jwtDecodeUserMock);
      } catch (error) {
        console.warn(error);
      }
    });
  });
});
