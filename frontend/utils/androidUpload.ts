import { Platform } from 'react-native';
import { config } from '@/config';

export const androidFormDataUpload = async (
  endpoint: string,
  formData: FormData,
  token: string
): Promise<any> => {
  if (Platform.OS !== 'android') {
    throw new Error('This function is only for Android');
  }

  console.log('Using Android-specific FormData upload for:', endpoint);

  try {
    const response = await fetch(`${config.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        // Don't set Content-Type for FormData - let browser set the boundary
      },
      body: formData,
    });

    console.log('Android fetch response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Android fetch error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Android fetch success:', data);
    return data;
  } catch (error) {
    console.error('Android fetch error:', error);
    throw error;
  }
};
