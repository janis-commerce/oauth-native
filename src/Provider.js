import React from 'react';
import {string, shape, arrayOf} from 'prop-types';
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
const AuthProvider = ({logoutUrl, config, ...rest}) => {
  const oauth = useOauth(config, logoutUrl);

  return <AuthContext.Provider logoutUrl={logoutUrl} {...rest} value={oauth} />;
};

AuthProvider.propTypes = {
  /**
   * config to use in react-native-app-auth package
   */
  config: shape({
    issuer: string,
    clientId: string.isRequired,
    redirectUrl: string.isRequired,
    scopes: arrayOf(string).isRequired,
  }).isRequired,
  /**
   * Url to open in app browser to logout user
   */
  logoutUrl: string,
};

AuthProvider.defaultProps = {
  logoutUrl: '',
};

export default AuthProvider;
