import React, {useEffect} from 'react';
import {getTokensCache} from './utils/oauth';
import {useOauthData} from './useOauthData';

const isTokenExpired = (expirationTime, minutesToConsiderTokenAsExpired) => {
  const currentTime = Date.now();
  const thresholdInMinutes = minutesToConsiderTokenAsExpired * 60 * 1000;
  return expirationTime - currentTime <= thresholdInMinutes;
};

const isTokenNearExpiration = (
  expirationTime,
  minutesToConsiderTokenAsExpired,
  minutesToConsiderTokenAsNearExpiration,
) => {
  const currentTime = Date.now();
  const expirationThresholdInMilliseconds =
    minutesToConsiderTokenAsExpired * 60 * 1000;
  const nearExpirationOffsetInMilliseconds =
    minutesToConsiderTokenAsNearExpiration * 60 * 1000;

  const nearExpirationTime =
    expirationTime -
    expirationThresholdInMilliseconds -
    nearExpirationOffsetInMilliseconds;

  return (
    currentTime >= nearExpirationTime &&
    currentTime < expirationTime - expirationThresholdInMilliseconds
  );
};

/**
 * Higher Order Component that checks if the access token is near expiration or already expired,
 * and executes the corresponding callback accordingly.
 *
 * The check is performed once when the component mounts.
 *
 * - A token is considered expired when the current time is within
 *   `minutesToConsiderTokenAsExpired` minutes of the actual `expiration` timestamp.
 *   In this case, `onTokenExpired` is executed and logout is triggered.
 *
 * - A token is considered near expiration when the current time is within the window
 *   defined by `minutesToConsiderTokenAsNearExpiration` minutes before that expiration threshold,
 *   but after the window of regular validity. In that case, `onTokenNearExpiration` is executed.
 *
 * @param {React.Component} Component - The component to wrap.
 * @param {object} config - Configuration options.
 * @param {number} [config.minutesToConsiderTokenAsExpired=120] - Number of minutes before the real expiration time
 *   at which the token should be considered expired.
 * @param {number} [config.minutesToConsiderTokenAsNearExpiration=120] - Number of minutes before the expiration threshold
 *   to consider the token as near expiration.
 * @param {function} [config.onTokenNearExpiration] - Callback executed when the token is in the pre-expiration window.
 * @param {function} [config.onTokenExpired] - Callback executed when the token is expired.
 *
 * @returns {React.Component} The wrapped component with token expiration access logic.
 */
export const withTokensExpirationAccess = (Component, config = {}) => (
  props,
) => {
  const {handleLogout: logout} = useOauthData();

  const {
    minutesToConsiderTokenAsNearExpiration = 120,
    minutesToConsiderTokenAsExpired = 120,
    onTokenNearExpiration = () => {},
    onTokenExpired = () => {},
  } = config;

  const checkTokenExpiration = async () => {
    try {
      const {expiration} = await getTokensCache();
      const isExpired = isTokenExpired(
        expiration,
        minutesToConsiderTokenAsExpired,
      );

      if (isExpired) {
        onTokenExpired();
        return logout();
      }

      const isNearExpiration = isTokenNearExpiration(
        expiration,
        minutesToConsiderTokenAsExpired,
        minutesToConsiderTokenAsNearExpiration,
      );

      if (isNearExpiration) {
        return onTokenNearExpiration();
      }

      return null;
    } catch (error) {
      return console.error('Error verifying token expiration:', error);
    }
  };

  useEffect(() => {
    checkTokenExpiration();
  }, []);

  return <Component {...props} />;
};
