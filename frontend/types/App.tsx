// App Types
export interface SocialAccount {
  id: string;
  name: string;
  connected: boolean;
  icon: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  shippingFee: number;
  paymentMethod: 'cod' | 'card' | 'bkash';
  paymentStatus: 'pending' | 'paid' | 'failed';
  items: {
    _id: string;
    productId: {
      _id: string;
      name: string;
      imageUrl: string[];
    };
    name: string;
    image: string;
    quantity: number;
    price: number;
    size?: string;
    variant?: string;
  }[];
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
}

export interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'cod' | 'card' | 'bkash';
}

export interface AnalyticsData {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    wishlistCount: number;
    followers: number;
  };
  orderTrends: {
    _id: string;
    orderCount: number;
    revenue: number;
  }[];
  recentOrders: {
    _id: string;
    userId: {
      fullName: string;
      avatar: string;
    };
    totalAmount: number;
    status: string;
    createdAt: string;
    items: any[];
  }[];
  topProducts: {
    _id: string;
    name: string;
    imageUrl: string[];
    totalSold: number;
    revenue: number;
    price: number;
  }[];
}