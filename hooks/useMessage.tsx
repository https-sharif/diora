import { useMessageStore } from '@/stores/useMessageStore';

export const useMessage = () => {
  const conversations = useMessageStore(state => state.conversations);
  const messages = useMessageStore(state => state.messages);
  const sendMessage = useMessageStore(state => state.sendMessage);
  const updateMessageStatus = useMessageStore(state => state.updateMessageStatus);
  const handleReaction = useMessageStore(state => state.handleReaction);
  const markConversationAsRead = useMessageStore(state => state.markConversationAsRead);
  const setTypingStatus = useMessageStore(state => state.setTypingStatus);

  return { conversations, messages, sendMessage, updateMessageStatus, handleReaction, markConversationAsRead, setTypingStatus };
};