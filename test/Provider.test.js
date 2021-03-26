import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import AuthProvider from '../src/Provider';
import useOauth from '../src/useOauth';

jest.mock('../src/useOauth', () => jest.fn());

describe('AuthProvider', () => {
  it('renders correctly and calls useOauth hook', () => {
    renderer.create(<AuthProvider />);

    expect(useOauth).toBeCalled();
  });
});
