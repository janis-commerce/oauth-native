import {useState, useEffect} from 'react';
import jwtDecode from 'jwt-decode';
import {userAuthorize, clearAuthorizeTokens, getAuthData} from './utils/oauth';
import {logout} from './utils/browser';

import {asyncWrap} from './utils/promises';

/**
 * @name useOauth
 * @description custom hook to handle OAuth
 * @private
 * @returns {object} states and functions to handle oauth
 * @example
 * const myComponent() {
 *    const {oauthTokens, userData, handleLogout, handleAuthorize, loading, error} = useOauth();
 *
 *    render(
 *      <View>
 *           <Text>user data: {userData}</Text>
 *      </View>
 *    )
 * }
 */
const useOauth = (config = {}, logoutUrl = '') => {
  let mounted = true;

  const initialAuthData = {isLogged: false, oauthTokens: null};
  const initialUserData = {};

  const [authData, setAuthData] = useState(initialAuthData);
  const [userData, setUserData] = useState(initialUserData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /**
   * @name handleAuthorize
   * @description method to trigger authentication process from react-native-app-auth package
   * @public
   */
  const handleAuthorize = async () => {
    const [, apiError] = await asyncWrap(userAuthorize(config));

    if (apiError) {
      const {data = {}} = apiError.response || {};
      const {message = 'Error de Autorización'} = data;

      if (mounted) {
        setError(message);
        setLoading(false);
      }

      return;
    }

    const authDataRes = await getAuthData(config);
    setAuthData(authDataRes);
  };

  /**
   * @name handleLogout
   * @description method to logout an user
   * @public
   */
  const handleLogout = async () => {
    setLoading(true);

    try {
      await logout(logoutUrl);
      await clearAuthorizeTokens();
      setAuthData(initialAuthData);
      setLoading(false);
    } catch (reason) {
      setError('Error in logout');
      setLoading(false);
    }
  };

  useEffect(() => {
    const validateLogin = async () => {
      setLoading(true);

      const res = await getAuthData(config);
      if (!res.isLogged) {
        await handleAuthorize();

        return;
      }

      setAuthData(res);
      setLoading(false);
    };

    validateLogin();

    return () => {
      mounted = false;
    };
  }, [authData.isLogged]);

  useEffect(() => {
    if (!authData.oauthTokens) return;

    const {idToken = ''} = authData.oauthTokens;

    const decoded = jwtDecode(idToken);

    if (decoded) {
      setUserData(decoded);
    }
  }, [authData.oauthTokens]);

  return {...authData, userData, handleLogout, handleAuthorize, loading, error};
};

export default useOauth;
