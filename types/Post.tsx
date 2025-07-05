export interface Post {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  imageUrl: string;
  caption?: string;
  stars: number;
  comments: number;
  createdAt: string;
}
