export interface Post {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar: string;
  }
  imageUrl: string;
  caption?: string;
  stars: number;
  comments: number;
  createdAt: string;
}
