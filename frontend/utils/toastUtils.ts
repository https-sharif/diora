import { useGlobalToast } from '@/contexts/ToastContext';
import NetInfo from '@react-native-community/netinfo';

// Global toast instance for non-React contexts
let globalToastInstance: ReturnType<typeof useGlobalToast> | null = null;

// Initialize toast instance (call this from a React component)
export const initializeGlobalToast = (toastInstance: ReturnType<typeof useGlobalToast>) => {
  globalToastInstance = toastInstance;
};

// Check internet connectivity and show toast if offline
export const checkInternetConnection = async (): Promise<boolean> => {
  const networkState = await NetInfo.fetch();
  const isConnected = networkState.isConnected ?? false;
  
  if (!isConnected) {
    showToast.error(toastMessages.noInternet);
    return false;
  }
  
  return true;
};

// Utility function for refresh with internet check
export const refreshWithInternetCheck = async (refreshFunction: () => Promise<void>): Promise<void> => {
  const hasInternet = await checkInternetConnection();
  
  if (!hasInternet) {
    return; // Don't proceed with refresh if no internet
  }
  
  try {
    await refreshFunction();
  } catch {
    showToast.error(toastMessages.refreshFailed);
  }
};

// Toast utility functions for non-React contexts
export const showToast = {
  success: (message: string, duration = 3000) => {
    globalToastInstance?.showToast('success', message, duration);
  },
  error: (message: string, duration = 4000) => {
    globalToastInstance?.showToast('error', message, duration);
  },
  neutral: (message: string, duration = 3000) => {
    globalToastInstance?.showToast('neutral', message, duration);
  },
  alert: (message: string, duration = 3500) => {
    globalToastInstance?.showToast('alert', message, duration);
  },
};

// Network status messages
export const networkMessages = {
  offline: 'You are offline. Some features may be limited.',
  online: 'Back online! Syncing your data...',
  syncSuccess: 'Data synced successfully!',
  syncFailed: 'Failed to sync some data. Will retry later.',
};

// Common toast messages
export const toastMessages = {
  // Authentication
  loginSuccess: 'Welcome back!',
  loginFailed: 'Login failed. Please check your credentials.',
  logoutSuccess: 'Logged out successfully.',
  signupSuccess: 'Account created successfully!',
  signupFailed: 'Failed to create account. Please try again.',

  // Network
  noInternet: 'No internet connection. Please check your network.',
  requestTimeout: 'Request timed out. Please try again.',
  serverError: 'Server error. Please try again later.',

  // CRUD Operations
  createSuccess: (item: string) => `${item} created successfully!`,
  updateSuccess: (item: string) => `${item} updated successfully!`,
  deleteSuccess: (item: string) => `${item} deleted successfully!`,
  deleteFailed: (item: string) => `Failed to delete ${item}. Please try again.`,

  // User Actions
  followSuccess: 'User followed successfully!',
  unfollowSuccess: 'User unfollowed successfully!',
  likeSuccess: 'Post liked!',
  unlikeSuccess: 'Post unliked!',
  commentSuccess: 'Comment posted!',
  commentFailed: 'Failed to post comment. Please try again.',
  replySuccess: 'Reply posted!',
  replyFailed: 'Failed to post reply. Please try again.',

  // Shopping
  addToCart: 'Added to cart!',
  removeFromCart: 'Removed from cart!',
  addToWishlist: 'Added to wishlist!',
  removeFromWishlist: 'Removed from wishlist!',
  orderSuccess: 'Order placed successfully!',
  orderFailed: 'Failed to place order. Please try again.',

  // Settings
  settingsSaved: 'Settings saved successfully!',
  passwordChanged: 'Password changed successfully!',
  emailUpdated: 'Email updated successfully!',
  profileUpdated: 'Profile updated successfully!',

  // General
  copiedToClipboard: 'Copied to clipboard!',
  imageUploaded: 'Image uploaded successfully!',
  imageUploadFailed: 'Failed to upload image. Please try again.',
  dataRefreshed: 'Data refreshed!',
  refreshFailed: 'Failed to refresh data.',
};
