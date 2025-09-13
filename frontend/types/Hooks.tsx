// Hook Types
import { User } from './User';
import { Conversation } from './Conversation';

export interface AdminStats {
  users: {
    total: number;
    shops: number;
    admins: number;
    newThisMonth: number;
  };
  content: {
    posts: number;
    products: number;
    comments: number;
    newPostsThisMonth: number;
    newProductsThisMonth: number;
  };
  promotionRequests: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  orders: {
    total: number;
    thisMonth: number;
  };
  growth: {
    newUsersThisMonth: number;
    newShopsThisMonth: number;
    newPostsThisMonth: number;
    newProductsThisMonth: number;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  database: {
    connected: boolean;
    collections: {
      users: number;
      posts: number;
      products: number;
      promotionRequests: number;
    };
  };
  activity: {
    newUsersLastHour: number;
  };
  uptime: number;
}

export interface UseNewConversationProps {
  token: string | null;
  user: User | null;
  conversations: Conversation[];
  onConversationCreated?: (conversation: Conversation) => void;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  variant?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'card' | 'bkash';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode?: string;
    phone: string;
    email: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UseOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalOrders: number;
  fetchOrders: (page?: number) => Promise<void>;
  getOrderById: (orderId: string) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  refreshOrders: () => Promise<void>;
}