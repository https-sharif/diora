export interface Comment {
  id: string;
  userId: string;
  username: string;
  targetId: string;
  avatar?: string;
  text: string;
  createdAt: string;
  replies?: string[];
}
