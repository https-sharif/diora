import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, Modal, ScrollView, TextInput, StyleSheet, TouchableWithoutFeedback, KeyboardAvoidingView, Platform , Animated } from 'react-native';
import { Star, MessageCircle, X, Send } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { mockComments } from '@/mock/Comment';
import { Post } from '@/types/Post';
import { Comment } from '@/types/Comment';
import { Theme } from '@/types/Theme';
import { router } from 'expo-router';
import { mockUsers } from '@/mock/User';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

const createStyles = (theme: Theme) => {
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
      backgroundColor: theme.card,
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
    commentItem: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    commentsModal: {
      flex: 1,
      backgroundColor: theme.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: 'hidden',
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
      backgroundColor: theme.background,
      padding: 8,
      borderRadius: 8,
      marginBottom: 8,
      marginHorizontal: 16,
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

export default function PostCard({ post }: { post: Post }) {
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(post.stars);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(mockComments.filter(c => c.targetId === post.id));
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const { theme } = useTheme();
  const { user, likePost } = useAuth();
  const styles = createStyles(theme);
  const screenWidth = Dimensions.get('window').width - 32;
  const animatedHeight = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    const postUser = mockUsers.find((user) => user.id === post.userId);
    if (postUser) {
      setUserAvatar(postUser.avatar!);
      setIsStarred(user?.likedPosts.includes(post.id) || false);
    }
  
    Image.getSize(
      post.imageUrl,
      (width, height) => {
        const scaleFactor = width / screenWidth;
        const scaledHeight = height / scaleFactor;
  
        Animated.timing(animatedHeight, {
          toValue: scaledHeight,
          duration: 250,
          useNativeDriver: false,
        }).start();
      },
      (error) => {
        console.warn('Failed to get image size:', error);
      }
    );
  }, [post.imageUrl, post.userId, user?.likedPosts]);
  

  const handleStar = () => {
    const newStarred = !isStarred;
    setIsStarred(newStarred);
    setStarCount(prev => newStarred ? prev + 1 : prev - 1);
    likePost(post.id);
  };

  const formatNumber = (num : number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace('.0', '') + 'M';
    if (num > 9999) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    return num.toLocaleString();
  };


  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: '11',
      userId: user?.id || '',
      username: user?.username || '',
      targetId: post.id,
      avatar: user?.avatar || '',
      text: newComment,
      createdAt: 'now',
    };

    if (replyingTo) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyingTo
            ? { ...c, replies: [...(c.replies || []), comment.id] }
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
      <TouchableOpacity onPress={() => {
        router.push(`/user/${comment.userId}`);
        setShowComments(false);
      }}>
        <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.commentContent} activeOpacity={1} >
        <View style={styles.commentHeader}>
          <TouchableOpacity onPress={() => {
            router.push(`/user/${comment.userId}`);
            setShowComments(false);
          }}>
            <Text style={styles.commentUser}>{comment.username}</Text>
          </TouchableOpacity>
          <Text style={styles.commentTime}>{comment.createdAt}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        <View style={styles.commentActions}>
          {!isReply && (
            <TouchableOpacity
              style={styles.commentAction}
              onPress={() => setReplyingTo(comment.id)}
            >
              <Text style={styles.commentActionText}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>
        {comment.replies?.map(replyId => {
          const replyComment = mockComments.find(c => c.id === replyId);
          if (!replyComment) return null;
          return renderComment(replyComment, true);
        })}
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push(`/user/${post.userId}`)}>
            <Image source={{ uri: userAvatar! }} style={styles.avatar} />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <TouchableOpacity onPress={() => router.push(`/user/${post.userId}`)}>
              <Text style={styles.username}>{post.username}</Text>
            </TouchableOpacity>
            <Text style={styles.timestamp}>{post.createdAt}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => router.push(`/post/${post.id}`)} activeOpacity={1}>
          <Animated.Image
            source={{ uri: post.imageUrl }}
            style={{ width: screenWidth, height: animatedHeight, borderRadius: 12 }}
            resizeMode="contain"
          />
        </TouchableOpacity>


        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleStar} activeOpacity={1}>
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
            activeOpacity={1}
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
        {/* Outer overlay to close modal on tap outside */}
        <TouchableWithoutFeedback onPress={() => setShowComments(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Inner TouchableWithoutFeedback to block closing modal when tapping inside */}
            <TouchableWithoutFeedback onPress={() => {}}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
                style={{
                  height: '80%',
                  backgroundColor: theme.card,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  overflow: 'hidden',
                  flexDirection: 'column',
                }}
              >
                <View style={[styles.commentsModal, { flex: 1 }]}>
                  <View style={styles.commentsHeader}>
                    <Text style={styles.commentsTitle}>Comments</Text>
                    <TouchableOpacity onPress={() => setShowComments(false)}>
                      <X size={24} color={theme.text} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    style={[styles.commentsList, { flex: 1 }]}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    {comments.map((comment) => renderComment(comment))}
                  </ScrollView>

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

                  <View style={[styles.commentInput, { marginBottom: 0 }]}>
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
                        <Send
                          size={20}
                          color={newComment.trim() ? theme.text : theme.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
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
