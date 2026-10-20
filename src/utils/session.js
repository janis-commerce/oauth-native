import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import {parseJson, stringifyJson} from './json';
import keys from '../keys';

const KEYCHAIN_OPTIONS = {service: keys.OAUTH_TOKENS_KEY};
const ASYNC_STORAGE_KEYS = [
  keys.OAUTH_TOKENS_KEY,
  keys.OAUTH_TOKENS_EXPIRATION_KEY,
];

// A keychain read costs ~270ms, so it is read once per process and then served from memory.
let session;
// Calls that arrive during that read share it, so the keychain is read and migrated once.
// A logout during the read is not covered: the read ends later and puts the session back in
// memory. Accepted to keep this simple: it needs a logout in the first ~270ms of the process.
let pendingRead;

/**
 * @name setSession
 * @description - save the session in memory and keychain
 * @private
 * @param {object} newSession - {oauthTokens, expiration}
 * @returns {promise}
 */
export const setSession = (newSession) => {
  // Memory first: callers don't await this, and requests must not read the old session meanwhile.
  session = newSession;

  const writeKeychain = () =>
    Keychain.setGenericPassword(
      keys.OAUTH_TOKENS_KEY,
      stringifyJson(newSession),
      KEYCHAIN_OPTIONS,
    );

  // Retried once like the read: a transient failure would otherwise lose the session on the next start.
  return writeKeychain().catch(writeKeychain);
};

const readSession = async () => {
  // One retry. A corrupted entry needs no reset: the next login's write overwrites it
  // and regenerates the key if it was lost.
  const credentials = await Keychain.getGenericPassword(
    KEYCHAIN_OPTIONS,
  ).catch(() => Keychain.getGenericPassword(KEYCHAIN_OPTIONS));

  if (credentials) {
    // Leftover from a downgrade and upgrade. Not awaited: it must not delay or fail the read.
    AsyncStorage.multiRemove(ASYNC_STORAGE_KEYS).catch(() => {});

    return parseJson(credentials.password);
  }

  // Sessions saved by previous versions live in AsyncStorage.
  const [[, tokens], [, expiration]] = await AsyncStorage.multiGet(
    ASYNC_STORAGE_KEYS,
  );

  if (!tokens) return {oauthTokens: null, expiration: null};

  const oldSession = {oauthTokens: parseJson(tokens), expiration};

  try {
    await setSession(oldSession);
    await AsyncStorage.multiRemove(ASYNC_STORAGE_KEYS);
  } catch {
    // Kept until the keychain has it: the migration is retried on the next start.
  }

  return oldSession;
};

/**
 * @name getSession
 * @description - get the session from memory, or from keychain on the first read of the process
 * @private
 * @returns {promise} - resolves with {oauthTokens, expiration}
 */
export const getSession = async () => {
  if (session) return session;

  if (!pendingRead) {
    pendingRead = readSession().finally(() => {
      pendingRead = undefined;
    });
  }

  session = await pendingRead;
  return session;
};

/**
 * @name clearSession
 * @description - remove the session from memory, keychain and async storage
 * @private
 * @returns {promise}
 */
export const clearSession = async () => {
  session = undefined;

  await Keychain.resetGenericPassword(KEYCHAIN_OPTIONS);
  // A failed migration leaves the old session here; it would be migrated back.
  await AsyncStorage.multiRemove(ASYNC_STORAGE_KEYS);
};
