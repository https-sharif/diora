import axios from 'axios';
import { Platform } from 'react-native';

// Create axios instance with Android-specific configuration
const axiosInstance = axios.create({
  timeout: Platform.OS === 'android' ? 30000 : 15000, // Longer timeout for Android
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor for Android
axiosInstance.interceptors.request.use(
  (config) => {
    // Add additional headers for Android
    if (Platform.OS === 'android') {
      config.headers['User-Agent'] = 'DioraApp/1.0 Android';
      config.headers['Cache-Control'] = 'no-cache';
    }
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
