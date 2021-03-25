import {InAppBrowser} from 'react-native-inappbrowser-reborn';
import {Alert} from 'react-native';
import inAppBrowserConf from '../config/inAppBrowser';

/**
 * @name logout
 * @description - function to open in app browser to logout user
 * @private
 */
export const logout = async (logoutUrl = '') => {
  try {
    const isAvailable = await InAppBrowser.isAvailable();

    if (isAvailable) {
      await InAppBrowser.open(logoutUrl, inAppBrowserConf);
    } else {
      Alert.alert('InAppBrowser is not available');
    }
  } catch (reason) {
    Alert.alert(reason.message);
  }
};
