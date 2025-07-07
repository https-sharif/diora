export interface Conversation {
    id: string;
    name?: string;
    avatar?: string;
    isGroup: boolean;
    participants: Array<string>;
    lastMessageId?: string;
    unreadCount: number;
    isOnline: boolean;
    isTyping: boolean;
  }