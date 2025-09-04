import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { commentService, postService } from '@/services';
import { useAuthStore } from '@/stores/authStore';
import { showToast, networkMessages } from '@/utils/toastUtils';

interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

interface SyncItem {
  id: string;
  type: 'comment' | 'like' | 'post';
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = true;
  private syncQueue: SyncItem[] = [];
  private cacheExpiry = 5 * 60 * 1000;

  private constructor() {
    this.initialize();
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private async initialize() {
    // Initialize network status detection
    const networkState = await NetInfo.fetch();
    this.isOnline = networkState.isConnected ?? true;

    // Set up network state listener
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? true;

      // Show toast for network status changes
      if (!wasOnline && this.isOnline) {
        showToast.success(networkMessages.online);
        // If we just came back online, sync pending actions
        if (this.syncQueue.length > 0) {
          this.syncPendingActions();
        }
      } else if (wasOnline && !this.isOnline) {
        showToast.alert(networkMessages.offline);
      }
    });

    // Load pending sync items
    await this.loadSyncQueue();
  }

  async setCache<T>(key: string, data: T, expiryMinutes?: number): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: expiryMinutes ? Date.now() + (expiryMinutes * 60 * 1000) : undefined,
      };

      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  async getCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);

      if (cacheItem.expiresAt && Date.now() > cacheItem.expiresAt) {
        await this.removeCache(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  async removeCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Failed to remove cache:', error);
    }
  }

  async addToSyncQueue(item: Omit<SyncItem, 'timestamp' | 'retryCount'>): Promise<void> {
    // Check if item already exists to prevent duplicates
    const existingIndex = this.syncQueue.findIndex(
      existing => existing.id === item.id && existing.type === item.type
    );

    if (existingIndex !== -1) {
      // Update existing item
      this.syncQueue[existingIndex] = {
        ...this.syncQueue[existingIndex],
        data: item.data,
        timestamp: Date.now(),
      };
    } else {
      // Add new item
      const syncItem: SyncItem = {
        ...item,
        timestamp: Date.now(),
        retryCount: 0,
      };
      this.syncQueue.push(syncItem);
    }

    await this.saveSyncQueue();
  }

  private async loadSyncQueue(): Promise<void> {
    try {
      const queue = await AsyncStorage.getItem('sync_queue');
      if (queue) {
        this.syncQueue = JSON.parse(queue);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  private async syncPendingActions(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    console.log(`Syncing ${this.syncQueue.length} pending actions...`);

    const remainingItems: SyncItem[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const item of this.syncQueue) {
      try {
        await this.processSyncItem(item);
        console.log(`✅ Synced ${item.type} action: ${item.id}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to sync ${item.type} action: ${item.id}`, error);

        // Increment retry count and re-queue if under limit
        if (item.retryCount < 3) {
          remainingItems.push({
            ...item,
            retryCount: item.retryCount + 1,
          });
        } else {
          console.warn(`🗑️ Dropping ${item.type} action after 3 retries: ${item.id}`);
          failureCount++;
        }
      }
    }

    this.syncQueue = remainingItems;
    await this.saveSyncQueue();

    if (remainingItems.length === 0) {
      console.log(`🎉 All ${successCount} pending actions synced successfully!`);
      showToast.success(networkMessages.syncSuccess);
    } else {
      console.log(`📊 Sync complete: ${successCount} successful, ${failureCount} failed, ${remainingItems.length} remaining`);
      if (failureCount > 0) {
        showToast.alert(networkMessages.syncFailed);
      }
    }
  }

  private async processSyncItem(item: SyncItem): Promise<void> {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw new Error('No authentication token available');
    }

    switch (item.type) {
      case 'comment':
        if (item.data.postId && item.data.content) {
          await commentService.createComment({
            postId: item.data.postId,
            content: item.data.content
          }, token);
        } else {
          throw new Error('Invalid comment data');
        }
        break;

      case 'like':
        if (item.data.postId) {
          await postService.likePost(item.data.postId, token);
        } else {
          throw new Error('Invalid like data');
        }
        break;

      case 'post':
        if (item.data.caption || item.data.image) {
          await postService.createPost(item.data, token);
        } else {
          throw new Error('Invalid post data');
        }
        break;

      default:
        throw new Error(`Unknown sync item type: ${item.type}`);
    }
  }

  get isConnected(): boolean {
    return this.isOnline;
  }

  async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  getSyncQueueLength(): number {
    return this.syncQueue.length;
  }

  async clearSyncQueue(): Promise<void> {
    this.syncQueue = [];
    await this.saveSyncQueue();
  }

  async getNetworkStatus(): Promise<boolean> {
    const networkState = await NetInfo.fetch();
    return networkState.isConnected ?? false;
  }

  async forceSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    await this.syncPendingActions();
  }

  getPendingSyncItems(): SyncItem[] {
    return [...this.syncQueue];
  }

  getSyncStatistics(): { total: number; byType: Record<string, number>; oldestItem?: number } {
    const byType: Record<string, number> = {};
    let oldestItem: number | undefined;

    this.syncQueue.forEach(item => {
      byType[item.type] = (byType[item.type] || 0) + 1;
      if (!oldestItem || item.timestamp < oldestItem) {
        oldestItem = item.timestamp;
      }
    });

    return {
      total: this.syncQueue.length,
      byType,
      oldestItem,
    };
  }

  async cleanupOldSyncItems(maxAgeHours = 24): Promise<number> {
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    const initialLength = this.syncQueue.length;

    this.syncQueue = this.syncQueue.filter(item => item.timestamp > cutoffTime);
    const removedCount = initialLength - this.syncQueue.length;

    if (removedCount > 0) {
      await this.saveSyncQueue();
      console.log(`🧹 Cleaned up ${removedCount} old sync items older than ${maxAgeHours} hours`);
    }

    return removedCount;
  }
}

export const offlineManager = OfflineManager.getInstance();
