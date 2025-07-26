export interface Review {
  _id: string;
  user: { _id: string; username: string; avatar: string };
  targetId: string;
  targetType: 'product' | 'shop';
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  images?: string[];
  imagesIds?: string[];
}
