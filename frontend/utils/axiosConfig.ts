import axios from 'axios';
import { Platform } from 'react-native';

// Create axios instance with Android-specific configuration
const axiosInstance = axios.create({
  timeout: Platform.OS === 'android' ? 60000 : 15000, // Even longer timeout for Android FormData
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Additional Android-specific configuration
  ...(Platform.OS === 'android' && {
    maxRedirects: 5,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  }),
});

// Add request interceptor for Android
axiosInstance.interceptors.request.use(
  (config) => {
    // Add additional headers for Android
    if (Platform.OS === 'android') {
      config.headers['User-Agent'] = 'DioraApp/1.0 Android';
      config.headers['Cache-Control'] = 'no-cache';
      config.headers['Connection'] = 'keep-alive';
      
      // Special handling for FormData on Android
      if (config.data && config.data._parts) {
        console.log('Android FormData upload detected, optimizing...');
        config.timeout = 120000; // 2 minutes for large uploads
        delete config.headers['Content-Type']; // Let browser set the boundary
      }
    }
    
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      timeout: config.timeout,
      platform: Platform.OS,
      hasFormData: !!(config.data && config.data._parts),
    });
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('Network Error Details:', {
        message: error.message,
        code: error.code,
        config: error.config,
        platform: Platform.OS,
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
