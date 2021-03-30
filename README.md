# @janiscommerce/oauth-native

Wrapper package to handle Janis OAuth module.

## Installation

```
npm install @janiscommerce/oauth-native
```

## Usage

### Main Auth Provider

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

### Custom hook to get user data

```js
// ChildrenComponent.js (Some internal component on your app)
import {useOauthData} from '@janiscommerce/oauth-native';

const MyComponent = () => {
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
