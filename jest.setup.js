import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import mockReactNativeAppAuth from './mocks/react-native-app-auth';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-app-auth', () => mockReactNativeAppAuth);

jest.mock('./src/storage', () => ({
  __esModule: true,
  default: {
    set: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
  },
}));
