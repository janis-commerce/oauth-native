import {Alert} from 'react-native';
import {InAppBrowser} from 'react-native-inappbrowser-reborn';
import {logout} from '../../src/utils/browser';
import inAppBrowserConf from '../../src/config/inAppBrowser';

describe('In app Browser functions', () => {
  it('must check inAppBrowser availability', async () => {
    jest.spyOn(InAppBrowser, 'isAvailable');

    await logout();

    expect(InAppBrowser.isAvailable).toBeCalledWith();
  });

  it('must check inAppBrowser availability', async () => {
    jest.spyOn(InAppBrowser, 'open');
    jest.spyOn(InAppBrowser, 'isAvailable').mockImplementation(() => true);

    await logout('some-url');

    expect(InAppBrowser.open).toBeCalledWith('some-url', inAppBrowserConf);
  });

  it('must open react native Alert if inAppBrowser is not available', async () => {
    jest.spyOn(Alert, 'alert');
    jest.spyOn(InAppBrowser, 'isAvailable').mockImplementation(() => false);

    await logout();

    expect(Alert.alert).toBeCalledWith('InAppBrowser is not available');
  });

  it('must open Alert with message if something has failed', async () => {
    jest.spyOn(Alert, 'alert');
    jest.spyOn(InAppBrowser, 'isAvailable').mockImplementation(() => {
      throw new Error('Error in fn');
    });

    await logout();

    expect(Alert.alert).toBeCalledWith('Error in fn');
  });
});
