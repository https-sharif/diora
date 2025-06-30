export interface Review {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'product' | 'shop';
  rating: number;
  comment?: string;
  createdAt: string;
  images?: string[];
}
