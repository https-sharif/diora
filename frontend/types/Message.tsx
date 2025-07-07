export interface Message {
    id: string;
    text: string;
    timestamp: string;
    conversationId: string;
    senderId: string;
    type: 'text' | 'image' | 'voice' | 'product' | 'notification';
    status: 'sending' | 'sent' | 'delivered' | 'read';
    replyTo?: string;
    reactions?: string;
    productId?: string;
    imageUrl?: string;
    voiceDuration?: number;
  }