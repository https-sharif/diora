import { useMessageStore } from '@/stores/messageStore';
import { MessageState } from '@/types/MessageStore';

export const useMessage = () => {
  const conversations = useMessageStore((state: MessageState) => state.conversations);
  const messages = useMessageStore((state: MessageState) => state.messages);
  const setConversations = useMessageStore((state: MessageState) => state.setConversations);
  const sendMessage = useMessageStore((state: MessageState) => state.sendMessage);
  const updateMessageStatus = useMessageStore((state: MessageState) => state.updateMessageStatus);
  const handleReaction = useMessageStore((state: MessageState) => state.handleReaction);
  const markConversationAsRead = useMessageStore((state: MessageState) => state.markConversationAsRead);
  const updateLastMessage = useMessageStore((state: MessageState) => state.updateLastMessage);
  const deleteMessage = useMessageStore((state: MessageState) => state.deleteMessage);
  const updateConversation = useMessageStore((state: MessageState) => state.updateConversation);

  return { 
    conversations, 
    messages, 
    setConversations,
    sendMessage, 
    updateMessageStatus, 
    handleReaction, 
    markConversationAsRead,
    updateLastMessage,
    deleteMessage,
    updateConversation
  };
};