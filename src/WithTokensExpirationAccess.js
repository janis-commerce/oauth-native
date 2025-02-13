import React, {useEffect} from 'react';
import {getTokensCache} from './utils/oauth';
import {useOauthData} from './useOauthData';

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
 * @param {function} config.callback - The callback function to execute when the token
 * has reached the expiration threshold.
 *
 * @return {React.Component} The wrapped component.
 */
export const WithTokensExpirationAccess = (Component, config = {}) => (
  props,
) => {
  const {handleLogout: logout} = useOauthData();

  const {minimumTokenExpirationTime = 120, callback = () => {}} = config;

  const hasReachedExpirationThreshold = (
    expirationTime,
    timeBeforeExpiration,
  ) => {
    const currentTime = Date.now();
    const timeDifference = expirationTime - currentTime;
    const expirationThreshold = timeBeforeExpiration * 60 * 1000;

    return timeDifference <= expirationThreshold;
  };

  const verifyExpiration = async () => {
    const {expiration} = await getTokensCache();

    const needToExecuteCallback = hasReachedExpirationThreshold(
      expiration,
      minimumTokenExpirationTime,
    );

    if (needToExecuteCallback) {
      callback();
      logout();
    }
  };

  useEffect(() => {
    verifyExpiration();
  }, []);

  return <Component {...props} />;
};
