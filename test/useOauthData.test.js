import React from 'react';
import {renderHook} from '@testing-library/react-hooks';
import {useOauthData} from '../src/useOauthData';
import {AuthContext} from '../src/context';

describe('useOauthData', () => {
  it('must be a function', () => {
    expect(typeof useOauthData).toBe('function');
  });

  it('must use Auth context', () => {
    jest.spyOn(React, 'useContext');
    renderHook(() => useOauthData());

    expect(React.useContext).toBeCalledWith(AuthContext);
  });

  it('must return an object', () => {
    const {result} = renderHook(() => useOauthData());

    expect(
      typeof result.current === 'object' && !(result.current instanceof Array),
    ).toBeTruthy();
  });
});
