import React from 'react';
import useOauth from './useOauth';
import {AuthContext} from './context';

const AuthProvider = (props) => {
  const oauth = useOauth();

  return <AuthContext.Provider {...props} value={oauth} />;
};

export default AuthProvider;
