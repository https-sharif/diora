import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, Modal, ScrollView, TextInput, StyleSheet, TouchableWithoutFeedback, KeyboardAvoidingView, Platform , Keyboard } from 'react-native';
import { Star, MessageCircle, X, Send, Heart } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
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
interface Post {
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

interface PostCardProps {
  post: Post;
  onStar?: (postId: string) => void;
}

const { width, height } = Dimensions.get('window');

const createStyles = (theme: any) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.background,
      marginBottom: 16,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: theme.text,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    userInfo: {
      marginLeft: 12,
      flex: 1,
    },
    username: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    timestamp: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    postImage: {
      width: '100%',
      height: width,
      marginHorizontal: 16,
      borderRadius: 12,
      resizeMode: 'contain',
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 20,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionText: {
      fontSize: 14,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    caption: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      lineHeight: 20,
    },
    captionUsername: {
      fontFamily: 'Inter-Bold',
    },
    commentsModal: {
      flex: 1,
      backgroundColor: theme.card,
    },
    commentsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    commentsTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    commentsList: {
      flex: 1,
      padding: 16,
    },
    commentItem: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    replyItem: {
      marginLeft: 40,
      marginTop: 8,
      marginBottom: 8,
    },
    commentAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    commentContent: {
      flex: 1,
      marginLeft: 12,
    },
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    commentUser: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    commentTime: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    commentText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      lineHeight: 18,
      marginBottom: 8,
    },
    commentActions: {
      flexDirection: 'row',
      gap: 16,
    },
    commentAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    commentActionText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    commentInput: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      padding: 16,
      paddingBottom: 32,
      backgroundColor: theme.card,
    },
    replyingIndicator: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.card,
      padding: 8,
      borderRadius: 8,
      marginBottom: 8,
    },
    replyingText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    commentInputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 12,
    },
    commentTextInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.border,
      color: theme.text,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      maxHeight: 100,
    },
    sendButton: {
      padding: 12,
    },
  });
}

const mockComments: Comment[] = [
  {
    id: '1',
    userId: 'style_lover',
    username: 'style_lover',
    avatar:
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    text: 'Absolutely love this look! Where did you get that jacket?',
    createdAt: '2h ago',
    likes: 12,
    replies: [
      {
        id: '1-1',
        userId: 'fashionista_jane',
        username: 'fashionista_jane',
        avatar:
          'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
        text: 'Thank you! Got it from Urban Threads 💕',
        createdAt: '1h ago',
        likes: 5,
      },
    ],
  },
  {
    id: '2',
    userId: 'trendy_alex',
    username: 'trendy_alex',
    avatar:
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    text: 'Perfect styling! The colors work so well together 🔥',
    createdAt: '3h ago',
    likes: 8,
  },
];

export default function PostCard({ post, onStar }: PostCardProps) {
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(post.stars);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [imageHeight, setImageHeight] = useState(0);

  useEffect(() => {
    Image.getSize(post.imageUrl, (width, height) => {
      const screenWidth = Dimensions.get('window').width - 32;
      const scaleFactor = width / screenWidth;
      const scaledHeight = height / scaleFactor;
      setImageHeight(scaledHeight);
    });
  }, [post.imageUrl]);

  const handleStar = () => {
    const newStarred = !isStarred;
    setIsStarred(newStarred);
    setStarCount((prev) => (newStarred ? prev + 1 : prev - 1));
    onStar?.(post.id);
  };

  const formatNumber = (num : number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace('.0', '') + 'M';
    if (num > 9999) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    return num.toLocaleString(); // 9999 and below: just commas
  };


  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: 'current_user',
      username: 'current_user',
      avatar:
        'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
      text: newComment,
      createdAt: 'now',
      likes: 0,
    };

    if (replyingTo) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyingTo
            ? { ...c, replies: [...(c.replies || []), comment] }
            : c
        )
      );
      setReplyingTo(null);
    } else {
      setComments((prev) => [comment, ...prev]);
    }

    setNewComment('');
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <View
      key={comment.id}
      style={[styles.commentItem, isReply && styles.replyItem]}
    >
      <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUser}>{comment.username}</Text>
          <Text style={styles.commentTime}>{comment.createdAt}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.commentAction}>
            <Heart size={14} color="#666" />
            <Text style={styles.commentActionText}>{comment.likes}</Text>
          </TouchableOpacity>
          {!isReply && (
            <TouchableOpacity
              style={styles.commentAction}
              onPress={() => setReplyingTo(comment.id)}
            >
              <Text style={styles.commentActionText}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>
        {comment.replies?.map((reply) => renderComment(reply, true))}
      </View>
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={{ uri: post.avatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.timestamp}>{post.createdAt}</Text>
          </View>
        </View>

        <Image
          source={{ uri: post.imageUrl }}
          style={{
            width: '100%',
            height: imageHeight,
            borderRadius: 12,
            resizeMode: 'contain',
          }}
        />

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleStar}>
            <Star
              size={24}
              color={isStarred ? '#FFD700' : theme.text}
              fill={isStarred ? '#FFD700' : 'transparent'}
              strokeWidth={2}
            />
            <Text style={styles.actionText}>
              {formatNumber(starCount)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowComments(true)}
          >
            <MessageCircle size={24} color={theme.text} strokeWidth={2} />
            <Text style={styles.actionText}>{formatNumber(post.comments)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.caption}>
            <Text style={styles.captionUsername}>{post.username}</Text>{' '}
            {post.caption}
          </Text>
        </View>
      </View>

      {/* Comments Modal */}
      <Modal
        visible={showComments}
        animationType="slide"
        transparent
        onRequestClose={() => setShowComments(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowComments(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
                style={{
                  height: '80%',
                  backgroundColor: theme.card,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  overflow: 'hidden',
                }}
              >
                <View style={styles.commentsModal}>
                  <View style={styles.commentsHeader}>
                    <Text style={styles.commentsTitle}>Comments</Text>
                    <TouchableOpacity onPress={() => setShowComments(false)}>
                      <X size={24} color={theme.text} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.commentsList}>
                    {comments.map((comment) => renderComment(comment))}
                  </ScrollView>

                  <View style={[styles.commentInput, { position: 'absolute', bottom: 0, left: 0, right: 0 }]}>
                    {replyingTo && (
                      <View style={styles.replyingIndicator}>
                        <Text style={styles.replyingText}>
                          Replying to {comments.find((c) => c.id === replyingTo)?.username}
                        </Text>
                        <TouchableOpacity onPress={() => setReplyingTo(null)}>
                          <X size={16} color={theme.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    )}
                    <TouchableWithoutFeedback onPress={() => {}}>
                      <View style={styles.commentInputRow}>
                        <TextInput
                          style={styles.commentTextInput}
                          placeholder="Add a comment..."
                          value={newComment}
                          onChangeText={setNewComment}
                          multiline
                          placeholderTextColor={theme.textSecondary}
                        />
                        <TouchableOpacity
                          style={styles.sendButton}
                          onPress={handleAddComment}
                          disabled={!newComment.trim()}
                        >
                          <Send size={20} color={newComment.trim() ? theme.text : theme.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </>
  );
}
