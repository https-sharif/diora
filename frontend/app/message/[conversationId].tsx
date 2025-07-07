import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Plus, Camera, Mic } from 'lucide-react-native';
import { useMessage } from '@/hooks/useMessage';
import { useAuth } from '@/hooks/useAuth';
import { mockProducts } from '@/mock/Product';
import { useTheme } from '@/contexts/ThemeContext';
import { mockUsers } from '@/mock/User';
import { Theme } from '@/types/Theme';
import { User } from '@/types/User';
import { Conversation } from '@/types/Conversation';
import { Message } from '@/types/Message';

const { width } = Dimensions.get('window');

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      paddingBottom: -100,
      paddingTop: -100,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: '#E5E5EA',
    },
    backButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    headerInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 12,
    },
    headerText: {
      flex: 1,
    },
    headerName: {
      fontSize: 17,
      fontFamily: 'Inter-SemiBold',
      color: '#000000',
    },
    headerStatus: {
      fontSize: 13,
      fontFamily: 'Inter-Regular',
      color: '#8E8E93',
      marginTop: 1,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerAction: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    messagesList: {
      flex: 1,
    },
    messagesContent: {
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    messageContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      alignItems: 'flex-end',
    },
    myMessageContainer: {
      justifyContent: 'flex-end',
    },
    messageAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      marginRight: 8,
    },
    messageBubble: {
      maxWidth: width * 0.75,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    myMessageBubble: {
      backgroundColor: '#007AFF',
      borderBottomRightRadius: 6,
    },
    otherMessageBubble: {
      backgroundColor: '#F2F2F7',
      borderBottomLeftRadius: 6,
    },
    messageText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: '#000000',
      lineHeight: 22,
    },
    myMessageText: {
      color: '#FFFFFF',
    },
    messageImage: {
      width: width * 0.6,
      height: width * 0.6,
      borderRadius: 12,
      marginBottom: 4,
    },
    messageTime: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: '#8E8E93',
      marginTop: 4,
      alignSelf: 'flex-end',
    },
    myMessageTime: {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    inputContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: Platform.OS === 'ios' ? 34 : 12,
      borderTopWidth: 0.5,
      borderTopColor: '#E5E5EA',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 12,
    },
    attachButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#F2F2F7',
      justifyContent: 'center',
      alignItems: 'center',
    },
    textInputContainer: {
      flex: 1,
      backgroundColor: '#F2F2F7',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      maxHeight: 100,
    },
    textInput: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: '#000000',
      minHeight: 20,
    },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    micButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#F2F2F7',
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: '#8E8E93',
    },
    productInfo: {
      flexDirection: 'column',
      gap: 4,
    },
    productContainer: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 4,
    },
    productName: {
      fontSize: 14,
      fontFamily: 'Inter-Bold',
      color: '#000000',
    },
    myProductName: {
      color: '#fff',
    },
    productPrice: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      color: '#8E8E93',
    },
    productImage: {
      width: 140,
      height: 140,
      resizeMode: 'contain',
      borderRadius: 8,
    },
  });
}
export default function MessageScreen() {
  const [messageText, setMessageText] = useState('');
  const [myMessages, setMyMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const { user } = useAuth();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { conversations, messages  , sendMessage } = useMessage();

  useEffect(() => {
    if (!conversationId) return;
    const foundConv = conversations.find(c => c.id == conversationId) as Conversation;
    const filteredMessages = messages.filter(m => m.conversationId === conversationId);
  
    setConversation(foundConv);
    setMyMessages(filteredMessages);
  }, [conversationId, conversations, messages]);

  useEffect(() => {
    if (conversation) {
      const otherUser = mockUsers.find(u => u.id === conversation.participants.find(p => p !== user?.id));
      if (otherUser) {
        setOtherUser(otherUser);
      }
    }
  }, [conversation]);

  const handleProfilePress = (userId: string) => {
    if(!conversation?.isGroup) {
      router.push(`/user/${userId}`);
    }
  }

  // Send message handler
  const handleSendMessage = () => {
    if (!messageText.trim() || !conversationId) return;

    sendMessage(conversationId, messageText.trim());
    setMessageText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (!user) return null;
    const isMe = item.senderId === user.id;
    
    const formattedTime = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const product = item.productId ? mockProducts.find(p => p.id === item.productId) : null;

    return (
      <View style={[styles.messageContainer, isMe && styles.myMessageContainer]}>
        {!isMe && conversation?.avatar && (
          <Image source={{ uri: conversation.avatar }} style={styles.messageAvatar} />
        )}

        {isMe && conversation?.avatar && (
          <Image source={{ uri: conversation.avatar }} style={styles.messageAvatar} />
        )}

        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          {item.type === 'text' && item.text ? (
            <Text style={[styles.messageText, isMe && styles.myMessageText]}>
              {item.text}
            </Text>
          ) : item.type === 'image' && item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
          ) : item.type === 'product' && item.productId ? (
            <TouchableOpacity onPress={() => router.push(`/product/${item.productId}`)} activeOpacity={0.8}>
              <View style={styles.productContainer}>
                <Image source={{ uri: product?.imageUrl[0] }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, isMe && styles.myProductName]}>{product?.name}</Text>
                  <Text style={styles.productPrice}>${product?.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.messageText, isMe && styles.myMessageText]}>
              Unsupported message type
            </Text>
          )}

          <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
            {formattedTime}
          </Text>
        </View>
      </View>
    );
  };

  if (!conversation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Conversation not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000000" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Image source={{ uri: conversation.avatar || otherUser?.avatar }} style={styles.headerAvatar} />
            <View style={styles.headerText}>
              <TouchableOpacity onPress={() => handleProfilePress(otherUser?.id || '')}>
                <Text style={styles.headerName}>{conversation.name || otherUser?.username}</Text>
              </TouchableOpacity>
              <Text style={styles.headerStatus}>
                {conversation.isOnline ? 'Online' : 'Last seen recently'}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerAction}>
              <Camera size={22} color="#000000" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={myMessages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.attachButton}>
              <Plus size={24} color="#8E8E93" strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Message..."
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
                placeholderTextColor="#8E8E93"
              />
            </View>

            {messageText.trim() ? (
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Send size={20} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.micButton}>
                <Mic size={20} color="#8E8E93" strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}