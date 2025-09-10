import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export const networkDiagnostics = {
  async checkConnectivity(): Promise<{
    isConnected: boolean;
    isInternetReachable: boolean;
    type: string;
    details: any;
  }> {
    try {
      const netInfo = await NetInfo.fetch();
      return {
        isConnected: netInfo.isConnected ?? false,
        isInternetReachable: netInfo.isInternetReachable ?? false,
        type: netInfo.type,
        details: netInfo.details,
      };
    } catch (error) {
      console.error('Network check failed:', error);
      return {
        isConnected: false,
        isInternetReachable: false,
        type: 'unknown',
        details: null,
      };
    }
  },

  async testEndpoint(url: string): Promise<boolean> {
    try {
      console.log(`Testing endpoint: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      console.log(`Endpoint test result: ${response.status}`);
      return response.ok;
    } catch (error) {
      console.error(`Endpoint test failed for ${url}:`, error);
      return false;
    }
  },

  async diagnoseNetworkIssue(apiUrl: string): Promise<{
    connectivity: any;
    endpointReachable: boolean;
    recommendations: string[];
  }> {
    console.log('Running network diagnostics...');
    
    const connectivity = await this.checkConnectivity();
    const endpointReachable = await this.testEndpoint(apiUrl);
    
    const recommendations: string[] = [];
    
    if (!connectivity.isConnected) {
      recommendations.push('No network connection detected. Check WiFi or mobile data.');
    }
    
    if (!connectivity.isInternetReachable) {
      recommendations.push('Internet not reachable. Check network settings.');
    }
    
    if (!endpointReachable) {
      recommendations.push('API server not reachable. Server may be down or blocked.');
      if (Platform.OS === 'android') {
        recommendations.push('Android network security may be blocking the connection.');
        recommendations.push('Try using a local development server or different network.');
      }
    }
    
    if (connectivity.type === 'cellular') {
      recommendations.push('Using cellular data. Some networks may block certain connections.');
    }
    
    console.log('Network diagnostics complete:', {
      connectivity,
      endpointReachable,
      recommendations,
    });
    
    return {
      connectivity,
      endpointReachable,
      recommendations,
    };
  },
};
