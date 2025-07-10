export interface OrderItem {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    size?: string;
    variant?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    shopId: string;
    timestamp: string;
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    items: OrderItem[];
    shippingAddress: {
      name: string;
      address: string;
      city: string;
    };
    paymentMethod: 'cod' | 'card' | 'bkash';
    trackingNumber?: string;
    estimatedDelivery?: string;
    canCancel: boolean;
  }