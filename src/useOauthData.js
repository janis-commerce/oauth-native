import {useContext} from 'react';
import {AuthContext} from './context';

/**
 * @name useOauthData
 * @description custom hook to handle OAuth and get auth user data from context
 * @public
 * @returns {object} logged user data and functions to handle oauth
 * @example
 * const myComponent() {
 *    const {oauthTokens, userData, handleLogout, handleAuthorize, loading, error} = useOauthData();
 *
 *    render(
 *      <View>
 *           <Text>user data: {userData}</Text>
 *      </View>
 *    )
 * }
 */
export const useOauthData = () => {
  const oauthData = useContext(AuthContext);

  return {...oauthData};
};
