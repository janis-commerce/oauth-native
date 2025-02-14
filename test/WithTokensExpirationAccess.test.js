import 'react-native';
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {WithTokensExpirationAccess} from '../src';
import {getTokensCache} from '../src/utils/oauth';
import {useOauthData} from '../src/useOauthData';

jest.mock('../src/utils/oauth', () => ({
  getTokensCache: jest.fn(),
}));

jest.mock('../src/useOauthData', () => ({
  useOauthData: jest.fn(),
}));

const mockLogout = jest.fn();
const mockCallback = jest.fn();

const MockComponent = () => <></>;

describe('WithTokensExpirationAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    useOauthData.mockReturnValue({
      handleLogout: mockLogout,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the wrapped component correctly without config', async () => {
    getTokensCache.mockResolvedValue({
      expiration: Date.now() + 10 * 60 * 1000,
    });

    let tree;
    await act(async () => {
      const WrappedComponent = WithTokensExpirationAccess(MockComponent);

      tree = renderer.create(<WrappedComponent />);
    });

    expect(tree.toJSON()).toBeNull();
  });

  it('does NOT execute callback or logout if token expiration is far away', async () => {
    getTokensCache.mockResolvedValue({
      expiration: Date.now() + 3 * 60 * 60 * 1000,
    });

    await act(async () => {
      const WrappedComponent = WithTokensExpirationAccess(MockComponent, {
        minimumTokenExpirationTime: 120,
        callback: mockCallback,
      });

      renderer.create(<WrappedComponent />);
    });

    expect(mockCallback).not.toHaveBeenCalled();
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('executes callback and logouts when token is about to expire without minimumTokenExpirationTime', async () => {
    getTokensCache.mockResolvedValue({
      expiration: Date.now() + 1000,
    });

    await act(async () => {
      const WrappedComponent = WithTokensExpirationAccess(MockComponent, {
        callback: mockCallback,
      });

      renderer.create(<WrappedComponent />);
    });

    expect(mockCallback).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
  });

  it('handles missing expiration timestamp', async () => {
    getTokensCache.mockResolvedValue({
      expiration: undefined,
    });

    await act(async () => {
      const WrappedComponent = WithTokensExpirationAccess(MockComponent, {
        minimumTokenExpirationTime: 120,
        callback: mockCallback,
      });

      renderer.create(<WrappedComponent />);
    });

    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('calls `verifyExpiration` inside `useEffect` on mount and executes default callback', async () => {
    getTokensCache.mockResolvedValue({
      expiration: Date.now() + 10 * 60 * 1000,
    });

    await act(async () => {
      const WrappedComponent = WithTokensExpirationAccess(MockComponent, {
        minimumTokenExpirationTime: 120,
      });

      renderer.create(<WrappedComponent />);
    });

    jest.advanceTimersByTime(5000);

    expect(getTokensCache).toHaveBeenCalledTimes(1);
  });
});
