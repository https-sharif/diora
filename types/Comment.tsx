export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  text: string;
  createdAt: string;
  replies?: Comment[];
  likes: number;
}
