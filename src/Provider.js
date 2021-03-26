import React from 'react';
import useOauth from './useOauth';
import {AuthContext} from './context';

/**
 * @name AuthProvider
 * @description Provide the app that envolves with OAuth context
 * @public
 * @param {object} props - component props
 * @example const myApp() {
 *    render (
 *      <AuthProvider>
 *        <MyHome />
 *      <AuthProvider>
 *    )
 * }
 */
const AuthProvider = (props) => {
  const oauth = useOauth();

  return <AuthContext.Provider {...props} value={oauth} />;
};

export default AuthProvider;
