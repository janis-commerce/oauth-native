import 'react-native';
import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {withTokensExpirationAccess} from '../src';
import {getTokensCache} from '../src/utils/oauth';
import {useOauthData} from '../src/useOauthData';

jest.mock('../src/utils/oauth', () => ({
  getTokensCache: jest.fn(),
}));

jest.mock('../src/useOauthData', () => ({
  useOauthData: jest.fn(),
}));

// Add this mock for @react-navigation/native
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  const ActualReact = jest.requireActual('react'); // Use a different name to avoid conflict
  return {
    ...actualNav,
    useFocusEffect: jest.fn((effect) => {
      // Simulate running the effect once on mount for testing purposes
      ActualReact.useEffect(() => {
        effect();
      }, []); // Empty dependency array to run only once
    }),
  };
});

const mockLogout = jest.fn();
const mockOnTokenNearExpiration = jest.fn();
const mockOnTokenExpired = jest.fn();

const MockComponent = () => <></>;

describe('withTokensExpirationAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useOauthData.mockReturnValue({
      handleLogout: mockLogout,
    });
  });

  const renderHelper = async (config, expirationTime) => {
    getTokensCache.mockResolvedValue({expiration: expirationTime});
    const WrappedComponent = withTokensExpirationAccess(MockComponent, config);
    await act(async () => {
      renderer.create(<WrappedComponent />);
    });
  };

  describe('Default Configuration (MTE=0, MTNE=null)', () => {
    it('uses default value for config as it is not provided', async () => {
      const expirationTime = Date.now() + 60 * 60 * 1000; // Expires in 1 hour
      await renderHelper(undefined, expirationTime);
      expect(mockOnTokenExpired).not.toHaveBeenCalled();
      expect(mockOnTokenNearExpiration).not.toHaveBeenCalled();
      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('does not call any callbacks if token is valid', async () => {
      const expirationTime = Date.now() + 60 * 60 * 1000; // Expires in 1 hour
      await renderHelper({}, expirationTime);
      expect(mockOnTokenExpired).not.toHaveBeenCalled();
      expect(mockOnTokenNearExpiration).not.toHaveBeenCalled();
      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('calls onTokenExpired (if provided) and logout if token is at exact expiration point', async () => {
      const expirationTime = Date.now(); // Expires now
      await renderHelper({onTokenExpired: mockOnTokenExpired}, expirationTime);
      expect(mockOnTokenExpired).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
      expect(mockOnTokenNearExpiration).not.toHaveBeenCalled();
    });

    it('calls logout (but not external onTokenExpired mock) if token is at exact expiration and no callback provided', async () => {
      const expirationTime = Date.now(); // Expires now
      await renderHelper({}, expirationTime);
      expect(mockOnTokenExpired).not.toHaveBeenCalled(); // External mock not called
      expect(mockLogout).toHaveBeenCalled();
      expect(mockOnTokenNearExpiration).not.toHaveBeenCalled();
    });

    it('calls onTokenExpired (if provided) and logout if token is already past expiration', async () => {
      const expirationTime = Date.now() - 10 * 60 * 1000; // Expired 10 minutes ago
      await renderHelper({onTokenExpired: mockOnTokenExpired}, expirationTime);
      expect(mockOnTokenExpired).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
      expect(mockOnTokenNearExpiration).not.toHaveBeenCalled();
    });
  });

  describe('Custom MTE (minutesToConsiderTokenAsExpired > 0), MTNE is null', () => {
    const MTE = 10; // Consider expired 10 minutes before actual expiration
    it('does not call callbacks if token is valid and before MTE threshold', async () => {
      const expirationTime = Date.now() + (MTE + 5) * 60 * 1000; // Expires in 15 minutes
      await renderHelper(
        {minutesToConsiderTokenAsExpired: MTE},
        expirationTime,
      );
      expect(mockOnTokenExpired).not.toHaveBeenCalled();
      expect(mockOnTokenNearExpiration).not.toHaveBeenCalled();
      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('calls onTokenExpired (if provided) and logout if token is at MTE threshold', async () => {
      const expirationTime = Date.now() + MTE * 60 * 1000; // Expires in 10 minutes (at threshold)
      await renderHelper(
        {
          minutesToConsiderTokenAsExpired: MTE,
          onTokenExpired: mockOnTokenExpired,
        },
        expirationTime,
      );
      expect(mockOnTokenExpired).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
      expect(mockOnTokenNearExpiration).not.toHaveBeenCalled();
    });

    it('calls onTokenExpired (if provided) and logout if token is past MTE threshold but before actual expiration', async () => {
      const expirationTime = Date.now() + (MTE - 5) * 60 * 1000; // Expires in 5 minutes (past threshold)
      await renderHelper(
        {
          minutesToConsiderTokenAsExpired: MTE,
          onTokenExpired: mockOnTokenExpired,
        },
        expirationTime,
      );
      expect(mockOnTokenExpired).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
      expect(mockOnTokenNearExpiration).not.toHaveBeenCalled();
    });

    it('calls onTokenExpired (if provided) which throws an error and logout if token is expired', async () => {
      const expirationTime = Date.now(); // Token is expired
      const errorMessage = 'Error in onTokenExpired';

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {}); // Suppress console output

      const throwingOnTokenExpired = jest.fn(() => {
        throw new Error(errorMessage);
      });

      await renderHelper(
        {
          onTokenExpired: throwingOnTokenExpired,
          renderLoadingComponent: () => <></>,
        },
        expirationTime,
      );

      expect(throwingOnTokenExpired).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error executing onTokenExpired callback:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('MTNE > MTE (Near Expiration Active)', () => {
    const MTE = 5;
    const MTNE = 30;
    const config = {
      minutesToConsiderTokenAsExpired: MTE,
      minutesToConsiderTokenAsNearExpiration: MTNE,
      onTokenNearExpiration: mockOnTokenNearExpiration,
      onTokenExpired: mockOnTokenExpired,
    };

    it('does not call callbacks if token is valid and before MTNE window', async () => {
      const expirationTime = Date.now() + (MTNE + 5) * 60 * 1000; // Expires in 35 minutes
      await renderHelper(config, expirationTime);
      expect(mockOnTokenNearExpiration).not.toHaveBeenCalled();
      expect(mockOnTokenExpired).not.toHaveBeenCalled();
      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('calls onTokenNearExpiration if token is entering MTNE window', async () => {
      const expirationTime = Date.now() + MTNE * 60 * 1000; // Expires in 30 minutes
      await renderHelper(config, expirationTime);
      expect(mockOnTokenNearExpiration).toHaveBeenCalled();
      expect(mockOnTokenExpired).not.toHaveBeenCalled();
      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('calls onTokenNearExpiration if token is in the middle of MTNE window', async () => {
      const expirationTime = Date.now() + (MTE + (MTNE - MTE) / 2) * 60 * 1000; // Expires in 17.5 mins
      await renderHelper(config, expirationTime);
      expect(mockOnTokenNearExpiration).toHaveBeenCalled();
      expect(mockOnTokenExpired).not.toHaveBeenCalled();
      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('calls onTokenExpired when token reaches MTE threshold (exiting MTNE window)', async () => {
      const expirationTime = Date.now() + MTE * 60 * 1000; // Expires in 5 minutes
      await renderHelper(config, expirationTime);
      expect(mockOnTokenExpired).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
      expect(mockOnTokenNearExpiration).not.toHaveBeenCalled(); // onTokenExpired takes precedence
    });

    it('does NOT call external mockOnTokenNearExpiration if no callback is passed, even if near expiration conditions met', async () => {
      const noCallbackConfig = {
        minutesToConsiderTokenAsExpired: MTE,
        minutesToConsiderTokenAsNearExpiration: MTNE,
        // onTokenNearExpiration is NOT provided
      };
      const expirationTime = Date.now() + (MTE + (MTNE - MTE) / 2) * 60 * 1000; // Expires in 17.5 mins (in near window)
      await renderHelper(noCallbackConfig, expirationTime);
      expect(mockOnTokenNearExpiration).not.toHaveBeenCalled(); // The global mock
      expect(mockOnTokenExpired).not.toHaveBeenCalled();
      expect(mockLogout).not.toHaveBeenCalled();
    });
  });

  describe('MTNE Invalid (e.g., MTNE <= MTE or not a number)', () => {
    it('does not call onTokenNearExpiration if mockOnTokenNearExpiration <= minutesToConsiderTokenAsExpired', async () => {
      const MTE = 30;
      const MTNE = 15;
      const config = {
        minutesToConsiderTokenAsExpired: MTE,
        minutesToConsiderTokenAsNearExpiration: MTNE,
        onTokenNearExpiration: mockOnTokenNearExpiration,
        onTokenExpired: mockOnTokenExpired,
      };
      const expirationTime = Date.now() + (MTNE + 5) * 60 * 1000;
      await renderHelper(config, expirationTime);
      expect(mockOnTokenNearExpiration).not.toHaveBeenCalled();
      expect(mockOnTokenExpired).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
    });

    it('does not call onTokenNearExpiration if MTNE is not a number', async () => {
      const MTE = 5;
      const config = {
        minutesToConsiderTokenAsExpired: MTE,
        minutesToConsiderTokenAsNearExpiration: 'abc', // Not a number
        onTokenNearExpiration: mockOnTokenNearExpiration,
      };
      const expirationTime = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes
      await renderHelper(config, expirationTime);
      expect(mockOnTokenNearExpiration).not.toHaveBeenCalled();
      expect(mockOnTokenExpired).not.toHaveBeenCalled();
      expect(mockLogout).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('does not call callbacks or logout if expiration time is undefined', async () => {
      // With undefined expiration, calculations involving it will result in NaN.
      // Conditions like `currentTime >= NaN` are false.
      await renderHelper(
        {
          onTokenExpired: mockOnTokenExpired,
          onTokenNearExpiration: mockOnTokenNearExpiration,
        },
        undefined,
      );
      expect(mockOnTokenExpired).not.toHaveBeenCalled();
      expect(mockOnTokenNearExpiration).not.toHaveBeenCalled();
      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('handles error from getTokensCache and calls console.error', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      getTokensCache.mockRejectedValue(new Error('Token cache error'));

      const WrappedComponent = withTokensExpirationAccess(MockComponent, {});
      await act(async () => {
        renderer.create(<WrappedComponent />);
      });

      expect(mockOnTokenExpired).not.toHaveBeenCalled();
      expect(mockOnTokenNearExpiration).not.toHaveBeenCalled();
      expect(mockLogout).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error verifying token expiration:',
        expect.any(Error),
      );
      consoleErrorSpy.mockRestore();
    });

    it('calls getTokensCache on mount', async () => {
      // This test primarily ensures the effect hook runs and initiates the check.
      const expirationTime = Date.now() + 60 * 60 * 1000; // Valid token
      await renderHelper({}, expirationTime);
      expect(getTokensCache).toHaveBeenCalledTimes(1);
    });
  });
});
