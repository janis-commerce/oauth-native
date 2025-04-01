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
const mockOnTokenNearExpiration = jest.fn();
const mockOnTokenExpired = jest.fn();

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

  it('executes onTokenNearExpiration when token is about to expire without minimumTokenExpirationTime', async () => {
    getTokensCache.mockResolvedValue({
      expiration: Date.now() + 1000,
    });

    await act(async () => {
      const WrappedComponent = WithTokensExpirationAccess(MockComponent, {
        onTokenNearExpiration: mockOnTokenNearExpiration,
      });

      renderer.create(<WrappedComponent />);
    });

    expect(mockOnTokenNearExpiration).toHaveBeenCalled();
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('does not execute onTokenExpired as there is no callback and logouts when token has expired', async () => {
    getTokensCache.mockResolvedValue({
      expiration: Date.now(),
    });

    await act(async () => {
      const WrappedComponent = WithTokensExpirationAccess(MockComponent, {});

      renderer.create(<WrappedComponent />);
    });

    expect(mockOnTokenExpired).not.toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
  });

  it('executes onTokenExpired and logouts when token has expired', async () => {
    getTokensCache.mockResolvedValue({
      expiration: Date.now(),
    });

    await act(async () => {
      const WrappedComponent = WithTokensExpirationAccess(MockComponent, {
        onTokenExpired: mockOnTokenExpired,
      });

      renderer.create(<WrappedComponent />);
    });

    expect(mockOnTokenExpired).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
  });

  it('handles missing expiration timestamp', async () => {
    getTokensCache.mockResolvedValue({
      expiration: undefined,
    });

    await act(async () => {
      const WrappedComponent = WithTokensExpirationAccess(MockComponent, {
        minimumTokenExpirationTime: 120,
        onTokenNearExpiration: mockOnTokenNearExpiration,
      });

      renderer.create(<WrappedComponent />);
    });

    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockOnTokenNearExpiration).not.toHaveBeenCalled();
  });

  it('calls `checkExpiration` inside `useEffect` on mount and executes default callback', async () => {
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

  it('handles error when verifying token expiration', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    getTokensCache.mockRejectedValue(new Error('Token cache error'));

    await act(async () => {
      const WrappedComponent = WithTokensExpirationAccess(MockComponent, {
        minimumTokenExpirationTime: 120,
      });

      renderer.create(<WrappedComponent />);
    });

    expect(mockLogout).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error verifying token expiration:',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});
