import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const netInfoState = await NetInfo.fetch();
    
    console.log('Network State:', {
      isConnected: netInfoState.isConnected,
      isInternetReachable: netInfoState.isInternetReachable,
      type: netInfoState.type,
      platform: Platform.OS,
    });

    return netInfoState.isConnected === true && netInfoState.isInternetReachable === true;
  } catch (error) {
    console.error('Network connectivity check failed:', error);
    return false;
  }
};

export const waitForNetworkConnection = async (maxWaitTime: number = 10000): Promise<boolean> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    const isConnected = await checkNetworkConnectivity();
    if (isConnected) {
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return false;
};
