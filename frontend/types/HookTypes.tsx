import { Order } from './Order';

export interface AdminStats {
  totalUsers: number;
  totalShops: number;
  totalOrders: number;
  totalRevenue: number;
  newUsers: number;
  newShops: number;
  newOrders: number;
  revenueGrowth: number;
  usersByMonth: { name: string; value: number }[];
  ordersByCategory: { name: string; value: number }[];
  revenueByMonth: { name: string; value: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
  topShops: { name: string; orders: number; revenue: number }[];
  systemHealth: SystemHealth;
}

export interface SystemHealth {
  status: 'good' | 'warning' | 'critical';
  uptime: number;
  activeUsers: number;
  serverLoad: number;
  databaseConnections: number;
  errorRate: number;
  responseTime: number;
  storageUsed: number;
  lastUpdated: Date;
}

export interface UseOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  markAsDelivered: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

export type ToastType = 'error' | 'success' | 'neutral' | 'alert';
