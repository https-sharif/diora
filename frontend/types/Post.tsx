export interface Post {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar: string;
    type: 'user' | 'shop' | 'admin';
  }
  imageUrl: string;
  caption?: string;
  stars: number;
  comments: number;
  createdAt: string;
}
