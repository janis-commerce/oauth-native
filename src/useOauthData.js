import {useContext} from 'react';
import {AuthContext} from './context';

export const useOauthData = () => {
  const oauthData = useContext(AuthContext);

  return {...oauthData};
};
