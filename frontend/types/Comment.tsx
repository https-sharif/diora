export interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
    isVerified?: boolean;
    type: 'user' | 'shop' | 'admin';
  };
  postId?: string;
  text: string;
  createdAt: string;
  replies?: Comment[];
}
