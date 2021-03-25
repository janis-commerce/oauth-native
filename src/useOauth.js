/* istanbul ignore file */
import {useState, useEffect} from 'react';
import jwtDecode from 'jwt-decode';
import {userAuthorize, clearAuthorizeTokens, getAuthData} from './utils/oauth';
import {logout} from './utils/browser';

import {asyncWrap} from './utils/promises';

const useOauth = () => {
  const initialAuthData = {isLogged: false, oauthTokens: null};

  const [authData, setAuthData] = useState(initialAuthData);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleAuthorize = async () => {
    const [, apiError] = await asyncWrap(userAuthorize());

    if (apiError) {
      const {data = {}} = apiError.response || {};
      const {message = 'Error de Autorización'} = data;

      setError(message);
      setLoading(false);
      return;
    }

    const authDataRes = await getAuthData();

    setAuthData(authDataRes);
  };

  const handleLogout = async () => {
    setLoading(true);

    try {
      await logout();
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

      const res = await getAuthData();

      if (!res.isLogged) {
        await handleAuthorize();

        return;
      }

      setAuthData(res);
      setLoading(false);
    };

    validateLogin();
  }, [authData.isLogged]);

  useEffect(() => {
    if (!authData.oauthTokens) return;

    const {idToken = ''} = authData.oauthTokens || {};

    const decoded = jwtDecode(idToken);

    if (decoded) {
      setUserData(decoded);
    }
  }, [authData.oauthTokens]);

  return {...authData, userData, handleLogout, handleAuthorize, loading, error};
};

export default useOauth;
