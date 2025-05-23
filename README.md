# @janiscommerce/oauth-native

Wrapper package to handle Janis OAuth module.

[![Coverage Status](https://github.com/janis-commerce/oauth-native/actions/workflows/coverage-status.yml/badge.svg)](https://github.com/janis-commerce/oauth-native/actions/workflows/coverage-status.yml)
[![npm version](https://badge.fury.io/js/%40janiscommerce%2Foauth-native.svg)](https://badge.fury.io/js/%40janiscommerce%2Foauth-native)

> ⚠️ **Peer dependencies**: You must install react-native-app-auth: "^6.2.0" and react-native-inappbrowser-reborn: "^3.5.1" before using this package.

## Installation

```
npm install @janiscommerce/oauth-native
```

## Usage

### Main Auth Provider

Wrap your app inside a `AuthProvider` component and pass required "config" and "logoutUrl" props. (to know more about config object, see [react-native-app-auth docs](https://www.npmjs.com/package/react-native-app-auth))

```js
// App.js - (Your main app component)
import AuthProvider from '@janiscommerce/oauth-native';

/**
 * Config example
 * more info about config in: https://github.com/FormidableLabs/react-native-app-auth
 */
const config = {
  issuer: '' /* Issuer url */,
  clientId: '' /* Client id */,
  redirectUrl: '' /* Redirect url */,
  scopes: ['openid', 'profile', 'email'] /* All scopes you need */,
  serviceConfiguration: {
    authorizationEndpoint: '' /* Authorization url */,
    tokenEndpoint: '' /* Token url */,
  },
};

const logoutUrl = 'https://example.com/logout'; /* Url to logout on webview */

const App = () => (
  <AuthProvider config={config} logoutUrl={logoutUrl}>
    <ChildrenComponent />
  </AuthProvider>
);

export default App;
```

### Custom hook

Export any component that needs access to oauth or openId user data using `useOauthData`. By doing this, you'll have access to methods `handleLogout` or `handleAuthorize`, and some states.

```js
// ChildrenComponent.js (Some internal component on your app)
import {useOauthData} from '@janiscommerce/oauth-native';

const ChildrenComponent = () => {
  const {isLogged, handleLogout, ...rest} = useOauthData();

  console.log('...rest', rest);

  return (
    <View>
      {isLogged ? (
        <View>
          <Text>User is logged</Text>
          <Button
            onPress={handleLogout}
            title="Cerrar Sesión"
            color="#841584"
          />
        </View>
      ) : (
        <View>
          <Text>User is NOT logged</Text>
        </View>
      )}
    </View>
  );
};
```

**useOauthData returned states and methods**:

| state           | Type           | description                                                          |
| --------------- | -------------- | -------------------------------------------------------------------- |
| oauthTokens     | object         | all tokens obtained from authentication server                       |
| handleLogout    | function       | open a in App browser with logout url and clean async storage tokens |
| handleAuthorize | function       | open a in App browser to authenticate user                           |
| userData        | object         | user data from openId Connect                                        |
| isLogged        | boolean        | info about if user is logged                                         |
| loading         | boolean        | -                                                                    |
| error           | null or string | null if there is no errors or string with error message              |

### getUserInfo method

The method **getUserInfo** compared to **useOauthData.userData** is not context dependent.

| state       | Type   | description                                          |
| ----------- | ------ | ---------------------------------------------------- |
| getUserInfo | object | user data information without depending on a context |

### withTokensExpirationAccess HOC

HOC that provides automatic token expiration handling to wrapped components. It monitors the access token and refreshes it if it's about to expire, ensuring the user session stays active without manual intervention as well as providing the option to alert the user some time before
the token expires.

```js
// SomeScreen.js
import {withTokensExpirationAccess} from '@janiscommerce/oauth-native';

const SomeScreen = () => {
  return (
    <View>
      <Text>Screen</Text>
    </View>
  );
};

export default withTokensExpirationAccess(SomeScreen, {
  onTokenNearExpiration: () =>
    Toast.show({text2: 'Token near expiration!', type: 'warning'}),
  onTokenExpired: () => console.log('Log out!'),
});
```

**WithTokensExpirationAccess Configuration Options:**

| config option                          | Type     | Description                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| minutesToConsiderTokenAsExpired        | number   | Number of minutes before the real expiration time at which the token should be considered expired. Defaults to 0, meaning expired at or after the exact expiration time. If the token is considered expired, `onTokenExpired` is called and the user is logged out.                                                                                                     |
| minutesToConsiderTokenAsNearExpiration | number   | Number of minutes before the real expiration time to consider the token as near expiration. For `onTokenNearExpiration` to be triggered, this value must be a number and strictly greater than `minutesToConsiderTokenAsExpired`. Defaults to null, disabling the near expiration check. If the token is considered near expiration, `onTokenNearExpiration` is called. |
| onTokenNearExpiration                  | function | Callback function triggered when the token is in the pre-expiration window (as defined by `minutesToConsiderTokenAsNearExpiration` and `minutesToConsiderTokenAsExpired`).                                                                                                                                                                                              |
| onTokenExpired                         | function | Callback function triggered when the token is considered expired (as defined by `minutesToConsiderTokenAsExpired`). Also logs the user out.                                                                                                                                                                                                                             |

### isTokenExpired method

The method **isTokenExpired** checks if the current token has expired by retrieving the expiration time from the cache.

```js
// SomeComponent.js
import {useEffect} from 'react';
import {isTokenExpired} from '@janiscommerce/oauth-native';

const SomeComponent = () => {
  useEffect(() => {
    const checkTokenExpiration = async () => {
      const expired = await isTokenExpired();
      if (expired) {
        console.log('Token has expired');
      } else {
        console.log('Token is still valid');
      }
    };
    checkTokenExpiration();
  }, []);

  return <View>...</View>;
};
```

| state          | Type    | description                                                     |
| -------------- | ------- | --------------------------------------------------------------- |
| isTokenExpired | boolean | true if token is expired, false if it is not or an error occurs |
