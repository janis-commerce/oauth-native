import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import {getSession, setSession, clearSession} from '../../src/utils/session';
import keys from '../../src/keys';

const keychainOptions = {service: keys.OAUTH_TOKENS_KEY};
const session = {oauthTokens: {accessToken: 'token'}, expiration: '12341234'};
const emptySession = {oauthTokens: null, expiration: null};

const saveKeychainSession = (value) =>
  Keychain.setGenericPassword(
    keys.OAUTH_TOKENS_KEY,
    JSON.stringify(value),
    keychainOptions,
  );

const saveAsyncStorageSession = async () => {
  await AsyncStorage.setItem(
    keys.OAUTH_TOKENS_KEY,
    JSON.stringify(session.oauthTokens),
  );
  await AsyncStorage.setItem(
    keys.OAUTH_TOKENS_EXPIRATION_KEY,
    session.expiration,
  );
};

const keychainError = (code) => Object.assign(new Error(code), {code});

describe('Session', () => {
  beforeEach(async () => {
    await clearSession();
    await AsyncStorage.clear();
  });

  describe('getSession', () => {
    it('must get the session from keychain', async () => {
      await saveKeychainSession(session);

      expect(await getSession()).toEqual(session);
      expect(Keychain.getGenericPassword).toBeCalledWith(keychainOptions);
    });

    it('must return an empty session if there is nothing stored', async () => {
      expect(await getSession()).toEqual(emptySession);
    });

    it('must read keychain only once and then serve from memory', async () => {
      await saveKeychainSession(session);

      await getSession();
      expect(await getSession()).toEqual(session);
      expect(Keychain.getGenericPassword).toBeCalledTimes(1);
    });

    it('must retry a failed keychain read once', async () => {
      await saveKeychainSession(session);
      Keychain.getGenericPassword.mockRejectedValueOnce(
        keychainError('E_KEYSTORE_ACCESS_ERROR'),
      );

      expect(await getSession()).toEqual(session);
      expect(Keychain.getGenericPassword).toBeCalledTimes(2);
    });

    it('must reject if the retry fails too, and read again on the next call', async () => {
      await saveKeychainSession(session);
      const error = keychainError('E_KEYSTORE_ACCESS_ERROR');
      Keychain.getGenericPassword
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error);

      await expect(getSession()).rejects.toBe(error);
      expect(await getSession()).toEqual(session);
    });
  });

  describe('AsyncStorage session migration', () => {
    it('must move the session to keychain and remove it from async storage', async () => {
      await saveAsyncStorageSession();

      expect(await getSession()).toEqual(session);
      expect(Keychain.setGenericPassword).toBeCalledWith(
        keys.OAUTH_TOKENS_KEY,
        JSON.stringify(session),
        keychainOptions,
      );
      expect(await AsyncStorage.getItem(keys.OAUTH_TOKENS_KEY)).toBeNull();
      expect(
        await AsyncStorage.getItem(keys.OAUTH_TOKENS_EXPIRATION_KEY),
      ).toBeNull();
    });

    it('must remove a leftover async storage session when keychain has one', async () => {
      await saveKeychainSession(session);
      await saveAsyncStorageSession();

      expect(await getSession()).toEqual(session);
      expect(await AsyncStorage.getItem(keys.OAUTH_TOKENS_KEY)).toBeNull();
      expect(
        await AsyncStorage.getItem(keys.OAUTH_TOKENS_EXPIRATION_KEY),
      ).toBeNull();
    });

    it('must still return the keychain session if the leftover cleanup fails', async () => {
      await saveKeychainSession(session);
      AsyncStorage.multiRemove.mockRejectedValueOnce(new Error('fail'));

      expect(await getSession()).toEqual(session);
    });

    it('must keep async storage and use the old session if the keychain write fails', async () => {
      await saveAsyncStorageSession();
      Keychain.setGenericPassword.mockRejectedValueOnce(
        keychainError('E_CRYPTO_FAILED'),
      );

      expect(await getSession()).toEqual(session);
      expect(await AsyncStorage.getItem(keys.OAUTH_TOKENS_KEY)).toBe(
        JSON.stringify(session.oauthTokens),
      );
    });
  });

  describe('setSession', () => {
    it('must save the session in one keychain entry', async () => {
      await setSession(session);

      expect(Keychain.setGenericPassword).toBeCalledWith(
        keys.OAUTH_TOKENS_KEY,
        JSON.stringify(session),
        keychainOptions,
      );
    });

    it('must serve the new session from memory before the keychain write ends', async () => {
      Keychain.setGenericPassword.mockReturnValueOnce(new Promise(() => {}));

      setSession(session);

      expect(await getSession()).toEqual(session);
      expect(Keychain.getGenericPassword).not.toBeCalled();
    });

    it('must reject if the keychain write fails, keeping the session in memory', async () => {
      Keychain.setGenericPassword.mockRejectedValueOnce(
        keychainError('E_CRYPTO_FAILED'),
      );

      await expect(setSession(session)).rejects.toThrow('E_CRYPTO_FAILED');
      expect(await getSession()).toEqual(session);
    });
  });

  describe('clearSession', () => {
    it('must clear memory, keychain and async storage', async () => {
      await setSession(session);
      await saveAsyncStorageSession();

      await clearSession();

      expect(Keychain.resetGenericPassword).toBeCalledWith(keychainOptions);
      expect(await AsyncStorage.getItem(keys.OAUTH_TOKENS_KEY)).toBeNull();
      expect(
        await AsyncStorage.getItem(keys.OAUTH_TOKENS_EXPIRATION_KEY),
      ).toBeNull();
      expect(await getSession()).toEqual(emptySession);
    });
  });
});
