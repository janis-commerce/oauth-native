import React from 'react';
import {renderHook, act} from '@testing-library/react-hooks';
import * as OAuthUtils from '../src/utils/oauth';
import * as browserUtils from '../src/utils/browser';
import * as promisesUtils from '../src/utils/promises';
import useOauth from '../src/useOauth';

jest.mock('jwt-decode', () =>
  jest.fn(() => null).mockImplementationOnce(() => ({name: 'example'})),
);

describe('useOauth hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should initiate with true loading', async () => {
    const {result} = renderHook(() => useOauth());
    expect(result.current.loading).toBe(true);
  });

  test('should update loading to false', async () => {
    const {result, waitForNextUpdate} = renderHook(() => useOauth());
    await waitForNextUpdate();
    expect(result.current.loading).toBe(false);
  });

  test('must call 2 useEffect functions', () => {
    jest.spyOn(React, 'useEffect');
    renderHook(() => useOauth());
    expect(React.useEffect).toHaveBeenCalledTimes(2);
  });

  test('must call getAuthData 1 time', () => {
    jest.spyOn(OAuthUtils, 'getAuthData');
    renderHook(() => useOauth());
    expect(OAuthUtils.getAuthData).toHaveBeenCalledTimes(1);
  });

  test('must call userAuthorize', async () => {
    jest.spyOn(OAuthUtils, 'userAuthorize');
    const {waitForNextUpdate} = renderHook(() => useOauth());
    await waitForNextUpdate();
    expect(OAuthUtils.userAuthorize).toHaveBeenCalled();
  });

  test('must call logout method', async () => {
    jest.spyOn(browserUtils, 'logout');
    const {waitForNextUpdate, result} = renderHook(() => useOauth());

    act(() => {
      result.current.handleLogout();
    });

    await waitForNextUpdate();
    expect(browserUtils.logout).toHaveBeenCalled();
  });

  test('must setError if something failed in handleLogout', async () => {
    jest.spyOn(browserUtils, 'logout').mockImplementation(() => {
      throw new Error('Something has failed');
    });
    jest
      .spyOn(promisesUtils, 'asyncWrap')
      .mockImplementation(() => Promise.resolve([{}, undefined]));

    const {waitForNextUpdate, result} = renderHook(() => useOauth());

    act(() => {
      result.current.handleLogout();
    });

    await waitForNextUpdate();
    expect(result.current.error).toBe('Error in logout');
  });

  test('should update authData', async () => {
    jest.spyOn(OAuthUtils, 'getAuthData').mockImplementation(() =>
      Promise.resolve({
        isLogged: true,
        oauthTokens: {},
      }),
    );
    const {result, waitForNextUpdate} = renderHook(() => useOauth());
    await waitForNextUpdate();
    expect(result.current.loading).toBe(false);
  });

  test('should update authData', async () => {
    jest.spyOn(OAuthUtils, 'getAuthData').mockImplementation(() =>
      Promise.resolve({
        isLogged: true,
        oauthTokens: {},
      }),
    );
    const {result, waitForNextUpdate} = renderHook(() => useOauth());
    await waitForNextUpdate();
    expect(result.current.userData).toEqual({});
  });
});
