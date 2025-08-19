export interface Post {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar: string;
    type: 'user' | 'shop' | 'admin';
    isVerified: boolean;
  }
  imageUrl: string;
  caption?: string;
  stars: number;
  comments: number;
  createdAt: string;
}

export interface PostData {
  content: string;
  media?: string[];
  type?: string;
}
