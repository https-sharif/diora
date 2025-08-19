export interface Review {
  _id: string;
  user: { _id: string; username: string; avatar: string, isVerified: boolean; type: 'user' | 'shop' | 'admin' };
  targetId: string;
  targetType: 'product' | 'shop';
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  images?: string[];
  imagesIds?: string[];
}

export interface ReviewData {
  productId: string;
  rating: number;
  comment: string;
  images?: string[];
}
