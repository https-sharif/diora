import axios from 'axios';
import { Platform } from 'react-native';

const axiosInstance = axios.create({
  timeout: Platform.OS === 'android' ? 60000 : 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  ...(Platform.OS === 'android' && {
    maxRedirects: 5,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  }),
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (Platform.OS === 'android') {
      config.headers['User-Agent'] = 'DioraApp/1.0 Android';
      config.headers['Cache-Control'] = 'no-cache';
      config.headers['Connection'] = 'keep-alive';
      
      if (config.data && config.data._parts) {
        console.log('Android FormData upload detected, optimizing...');
        config.timeout = 120000;
        delete config.headers['Content-Type'];
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

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
