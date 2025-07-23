import React, {useCallback, useRef, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {getTokensCache} from './utils/oauth';
import {useOauthData} from './useOauthData';

const minutesToMs = (minutes) => minutes * 60 * 1000;

/**
 * Higher Order Component that checks if the access token is near expiration or already expired,
 * and executes the corresponding callback accordingly.
 *
 * The check is performed once when the component mounts.
 *
 * - A token is considered expired when the current time is within
 *   `minutesToConsiderTokenAsExpired` minutes of (or past) the actual `expiration` timestamp.
 *   If `minutesToConsiderTokenAsExpired` is 0, the token is considered expired only if the current time
 *   is at or after the `expiration` timestamp.
 *   In this case, `onTokenExpired` is executed and logout is triggered.
 *
 * - A token is considered near expiration if `minutesToConsiderTokenAsNearExpiration` is a valid number
 *   greater than `minutesToConsiderTokenAsExpired`. The "near expiration" window starts
 *   `minutesToConsiderTokenAsNearExpiration` minutes before the actual `expiration` timestamp and ends
 *   just before the token is considered expired (as defined by `minutesToConsiderTokenAsExpired`).
 *   In that case, `onTokenNearExpiration` is executed.
 *
 * @param {React.Component} Component - The component to wrap.
 * @param {object} config - Configuration options.
 * @param {number} [config.minutesToConsiderTokenAsExpired=0] - Number of minutes before the real expiration time
 *   at which the token should be considered expired. Defaults to 0, meaning expired at or after the exact expiration time.
 * @param {number | null} [config.minutesToConsiderTokenAsNearExpiration=null] - Number of minutes before the real expiration time
 *   to consider the token as near expiration. For `onTokenNearExpiration` to be triggered, this value must be a number
 *   and strictly greater than `minutesToConsiderTokenAsExpired`. Defaults to null, disabling near expiration check.
 * @param {function} [config.onTokenNearExpiration] - Callback executed when the token is in the pre-expiration window.
 * @param {function} [config.onTokenExpired] - Callback executed when the token is expired.
 * @param {function} [config.renderLoadingComponent] - Function that returns a React component to render while the HOC is loading (when executing the onTokenExpired callback). Defaults to a function that returns null.
 *
 * @returns {React.Component} The wrapped component with token expiration access logic.
 */
export const withTokensExpirationAccess = (Component, config = {}) => (
  props,
) => {
  const {handleLogout: logout} = useOauthData();
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const {
    minutesToConsiderTokenAsNearExpiration = null,
    minutesToConsiderTokenAsExpired = 0,
    onTokenNearExpiration = () => {},
    onTokenExpired = () => {},
    renderLoadingComponent,
  } = config;

  const hasRunTokenExpired = useRef(false);

  const checkTokenExpiration = useCallback(async () => {
    try {
      const {expiration} = await getTokensCache();

      const currentTime = Date.now();
      const expirationTimeInMs = expiration;

      const expirationThresholdTime =
        expirationTimeInMs - minutesToMs(minutesToConsiderTokenAsExpired);

      // Check if token is expired
      if (
        currentTime >= expirationThresholdTime &&
        !hasRunTokenExpired.current
      ) {
        hasRunTokenExpired.current = true;
        try {
          setIsLoading(true);
          await onTokenExpired();
        } catch (error) {
          console.error('Error executing onTokenExpired callback:', error);
        } finally {
          setIsLoading(false);
          logout();
          hasRunTokenExpired.current = false;
        }
      }

      const isMinutesNearExpirationValid =
        typeof minutesToConsiderTokenAsNearExpiration === 'number' &&
        minutesToConsiderTokenAsNearExpiration >
          minutesToConsiderTokenAsExpired;

      // Check if token is near expiration
      // Condition: minutesToConsiderTokenAsNearExpiration must be a number and greater than minutesToConsiderTokenAsExpired
      if (isMinutesNearExpirationValid) {
        const nearExpirationStartTime =
          expirationTimeInMs -
          minutesToMs(minutesToConsiderTokenAsNearExpiration);

        if (
          currentTime >= nearExpirationStartTime &&
          currentTime < expirationThresholdTime // Must be before it's considered expired
        ) {
          return onTokenNearExpiration();
        }
      }

      return null;
    } catch (error) {
      console.error('Error verifying token expiration:', error);
      return null;
    } finally {
      setIsCheckingToken(false);
    }
  }, [
    minutesToConsiderTokenAsNearExpiration,
    minutesToConsiderTokenAsExpired,
    onTokenNearExpiration,
    onTokenExpired,
    logout,
  ]);

  useFocusEffect(
    useCallback(() => {
      checkTokenExpiration();
    }, [checkTokenExpiration]),
  );

  if (isLoading && renderLoadingComponent) {
    return renderLoadingComponent();
  }

  if (isCheckingToken) {
    return null;
  }

  return <Component {...props} />;
};
