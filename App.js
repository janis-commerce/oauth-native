/* istanbul ignore file */
import React from 'react';
import {View, Text, Button} from 'react-native';
import AuthProvider from './src/Provider';
import {useOauthData} from './src/useOauthData';

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

const MyComponent = () => {
  const {isLogged, handleLogout} = useOauthData();

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

const App = () => (
  <AuthProvider config={config} logoutUrl={logoutUrl}>
    <MyComponent />
  </AuthProvider>
);

export default App;
