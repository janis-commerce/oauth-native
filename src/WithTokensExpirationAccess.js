import React, {useEffect} from 'react';
import {getTokensCache} from './utils/oauth';
import {useOauthData} from './useOauthData';

const isTokenExpired = (expirationTime) => {
  const currentTime = Date.now();
  return expirationTime <= currentTime;
};

const isTokenNearExpiration = (expirationTime, thresholdInMinutes) => {
  const currentTime = Date.now();
  const thresholdInMs = thresholdInMinutes * 60 * 1000;
  return expirationTime - currentTime <= thresholdInMs;
};

/**
 * Higher Order Component that checks if the access token is about to expire
 * and if so, it logs out the user and calls the callback function.
 *
 * The check is done when the component is mounted and the callback is executed
 * only if the token has reached the expiration threshold.
 *
 * By default the expiration threshold is 120 minutes.
 *
 * @param {React.Component} Component - The component to wrap.
 * @param {object} config - Object with the configuration options.
 * @param {number} config.minimumTokenExpirationTime - The minimum time in minutes
 * before the token expires to execute the callback.
 * @param {function} config.onTokenNearExpiration - The callback function to execute when the token
 * has reached the expiration threshold.
 * @param {function} config.onTokenExpired - The callback function to execute when the token
 * has expired.
 *
 * @return {React.Component} The wrapped component.
 */
export const WithTokensExpirationAccess = (Component, config = {}) => (
  props,
) => {
  const {handleLogout: logout} = useOauthData();

  const {
    minimumTokenExpirationTime = 120,
    onTokenNearExpiration = () => {},
    onTokenExpired = () => {},
  } = config;

  const checkTokenExpiration = async () => {
    try {
      const {expiration} = await getTokensCache();

      if (isTokenExpired(expiration)) {
        onTokenExpired();
        logout();
      } else if (
        isTokenNearExpiration(expiration, minimumTokenExpirationTime)
      ) {
        onTokenNearExpiration();
      }
    } catch (error) {
      console.error('Error verifying token expiration:', error);
    }
  };

  useEffect(() => {
    checkTokenExpiration();
  }, []);

  return <Component {...props} />;
};
