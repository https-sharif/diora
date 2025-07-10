export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  size?: string;
  variant?: string;
}
