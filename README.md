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

| state           | Type           | description                                                          |
| --------------- | -------------- | -------------------------------------------------------------------- |
| getUserInfo     | object         | user data information without depending on a context                 |
