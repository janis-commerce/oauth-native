import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import mockReactNativeAppAuth from './mocks/react-native-app-auth';
import mockKeychain from './mocks/react-native-keychain';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-app-auth', () => mockReactNativeAppAuth);

jest.mock('react-native-keychain', () => mockKeychain);
