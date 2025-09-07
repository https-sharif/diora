import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Star, MessageCircle, X, Send, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Post } from '@/types/Post';
import { Comment } from '@/types/Comment';
import { Theme } from '@/types/Theme';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'timeago.js';
import { commentService } from '@/services';
import {
  commentValidation,
  validateField,
  sanitizeInput,
  commentRateLimiter,
} from '@/utils/validationUtils';
import { VirtualizedCommentList } from '@/utils/virtualizationUtils';

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
    userNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    verifiedBadgeContainer: {
      width: 12,
      height: 12,
      borderRadius: 8,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
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
      minWidth: 10,
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
      backgroundColor: theme.card,
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
      marginHorizontal: 16,
      marginVertical: 8,
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
    },
    loadingText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      marginTop: 8,
    },
    imageLoadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: 12,
    },
  });
};

export default function PostCard({ post }: { post: Post }) {
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(post.stars || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const [isLiking, setIsLiking] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const { theme } = useTheme();
  const { user, likePost, token } = useAuth();
  const styles = createStyles(theme);
  const screenWidth = Dimensions.get('window').width - 32;
  const animatedHeight = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    const fetchComments = async () => {
      if (!token) return;

      setIsLoadingComments(true);
      try {
        const response = await commentService.getPostComments(
          post._id,
          token,
          1,
          10
        );

        if (response.status) {
          setComments(response.comments);
        } else {
          console.error('Failed to fetch comments:', response.message);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchComments();

    setIsStarred(user?.likedPosts?.includes(post._id) || false);

    Image.getSize(
      post.imageUrl,
      (width, height) => {
        const scaleFactor = width / screenWidth;
        let scaledHeight = height / scaleFactor;

        if (scaledHeight > 400) scaledHeight = 400;

        Animated.timing(animatedHeight, {
          toValue: scaledHeight,
          duration: 250,
          useNativeDriver: false,
        }).start();
      },
      () => {}
    );
  }, [
    post._id,
    post.imageUrl,
    post.stars,
    post.user._id,
    user?.likedPosts,
    animatedHeight,
    screenWidth,
    token,
  ]);

  const handleStar = async () => {
    if (isLiking) return;

    setIsLiking(true);
    const newStarred = !isStarred;
    setIsStarred(newStarred);
    setStarCount((prev) => (newStarred ? prev + 1 : prev - 1));

    try {
      await likePost(post._id);
    } catch (error) {
      setIsStarred(!newStarred);
      setStarCount((prev) => (newStarred ? prev - 1 : prev + 1));
      console.error('Failed to like post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    if (num >= 1_000_000)
      return (num / 1_000_000).toFixed(1).replace('.0', '') + 'M';
    if (num > 9999) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    return num.toLocaleString();
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !token || isPostingComment) return;

    const validation = validateField(commentValidation.text, newComment.trim());
    if (!validation.success) {
      Alert.alert('Invalid Comment', validation.error);
      return;
    }

    if (!commentRateLimiter.isAllowed(user._id)) {
      Alert.alert(
        'Rate Limit Exceeded',
        'Please wait before posting another comment.'
      );
      return;
    }

    const commentText = sanitizeInput(newComment.trim());
    setIsPostingComment(true);

    const optimisticComment: Comment = {
      _id: `temp-${Date.now()}`,
      text: commentText,
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        type: user.type,
      },
      postId: post._id,
      createdAt: new Date().toISOString(),
      replies: [],
      isOptimistic: true,
    } as Comment;

    if (replyingTo) {
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === replyingTo
            ? {
                ...comment,
                replies: [...(comment.replies || []), optimisticComment],
              }
            : comment
        )
      );
    } else {
      setComments((prev) => [optimisticComment, ...prev]);
    }

    setNewComment('');

    try {
      const payload = { 
        userId: user._id,
        postId: post._id, 
        text: commentText 
      };

      const response = replyingTo
        ? await commentService.replyToComment(
            replyingTo,
            { userId: user._id, postId: post._id, text: commentText },
            token
          )
        : await commentService.createComment(payload, token);

      if (response.status) {
        const newAdded = response.comment;

        if (replyingTo) {
          setComments((prev) =>
            prev.map((comment) =>
              comment._id === replyingTo
                ? {
                    ...comment,
                    replies: comment.replies?.map((reply) =>
                      reply._id === optimisticComment._id ? newAdded : reply
                    ),
                  }
                : comment
            )
          );
        } else {
          setComments((prev) =>
            prev.map((comment) =>
              comment._id === optimisticComment._id ? newAdded : comment
            )
          );
        }
      } else {
        throw new Error('Failed to post comment');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);

      if (replyingTo) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === replyingTo
              ? {
                  ...comment,
                  replies: comment.replies?.filter(
                    (reply) => reply._id !== optimisticComment._id
                  ),
                }
              : comment
          )
        );
      } else {
        setComments((prev) =>
          prev.filter((comment) => comment._id !== optimisticComment._id)
        );
      }

      setNewComment(commentText);
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    } finally {
      setIsPostingComment(false);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    if (!comment.user) return null;

    const isOptimistic = (comment as any).isOptimistic;

    return (
      <View
        key={comment._id}
        style={[
          styles.commentItem,
          isReply && styles.replyItem,
          isOptimistic && { opacity: 0.7 },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            router.push(`/user/${comment.user._id}`);
            setShowComments(false);
          }}
        >
          <Image
            source={{ uri: comment.user.avatar }}
            style={styles.commentAvatar}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.commentContent} 
          activeOpacity={1}
        >
          <View style={styles.commentHeader}>
            <TouchableOpacity
              onPress={() => {
                router.push(`/user/${comment.user._id}`);
                setShowComments(false);
              }}
            >
              <View style={styles.userNameRow}>
                <Text style={styles.username}>{comment.user.username}</Text>
                {comment.user.isVerified && (
                  <View style={styles.verifiedBadgeContainer}>
                    <Check size={8} strokeWidth={4} color="white" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.commentTime}>
              {format(new Date(comment.createdAt))}
            </Text>
          </View>
          <Text style={styles.commentText}>{comment.text}</Text>
          <View style={styles.commentActions}>
            {!isReply && (
              <TouchableOpacity
                style={styles.commentAction}
                onPress={() => setReplyingTo(comment._id)}
              >
                <Text style={styles.commentActionText}>Reply</Text>
              </TouchableOpacity>
            )}
          </View>
          {comment.replies?.map((item) => {
            return renderComment(item, true);
          })}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (post.user.type === 'shop') {
                router.push(`/shop/${post.user._id}`);
                return;
              }
              router.push(`/user/${post.user._id}`);
            }}
          >
            <Image source={{ uri: post.user.avatar! }} style={styles.avatar} />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <TouchableOpacity
              onPress={() => {
                if (post.user.type === 'shop') {
                  router.push(`/shop/${post.user._id}`);
                  return;
                }
                router.push(`/user/${post.user._id}`);
              }}
            >
              <View style={styles.userNameRow}>
                <Text style={styles.username}>{post.user.username}</Text>
                {post.user.isVerified && (
                  <View style={styles.verifiedBadgeContainer}>
                    <Check size={8} strokeWidth={4} color="white" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.timestamp}>
              {format(new Date(post.createdAt))}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push(`/post/${post._id}`)}
          activeOpacity={1}
        >
          <View style={{ position: 'relative' }}>
            <Animated.Image
              source={{ uri: post.imageUrl }}
              style={{
                width: screenWidth,
                height: animatedHeight,
                borderRadius: 12,
              }}
              resizeMode="contain"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
            {imageLoading && (
              <View style={styles.imageLoadingOverlay}>
                <ActivityIndicator size="large" color={theme.text} />
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStar}
            activeOpacity={1}
            disabled={isLiking}
          >
            <Star
              size={24}
              color={isStarred ? '#FFD700' : theme.text}
              fill={isStarred ? '#FFD700' : 'transparent'}
              strokeWidth={2}
            />
            <Text style={styles.actionText}>{formatNumber(starCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowComments(true)}
            activeOpacity={1}
          >
            <MessageCircle size={24} color={theme.text} strokeWidth={2} />
            <Text style={styles.actionText}>
              {formatNumber(comments.length)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.caption}>
            <Text style={styles.captionUsername}>{post.user.username}</Text>{' '}
            {post.caption}
          </Text>
        </View>
      </View>

      <Modal
        visible={showComments}
        animationType="slide"
        transparent
        onRequestClose={() => setShowComments(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowComments(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? -10 : 0}
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

                  {isLoadingComments ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={theme.text} />
                      <Text style={styles.loadingText}>
                        Loading comments...
                      </Text>
                    </View>
                  ) : (
                    <VirtualizedCommentList
                      comments={comments}
                      renderComment={(comment) => renderComment(comment, false)}
                      emptyMessage="No comments yet"
                      contentContainerStyle={{ paddingBottom: 80 }}
                      keyboardShouldPersistTaps="handled"
                    />
                  )}

                  {replyingTo && (
                    <View style={styles.replyingIndicator}>
                      <Text style={styles.replyingText}>
                        Replying to{' '}
                        {
                          comments.find((c) => c._id === replyingTo)?.user
                            .username
                        }
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
                        disabled={!newComment.trim() || isPostingComment}
                      >
                        {isPostingComment ? (
                          <ActivityIndicator size="small" color={theme.text} />
                        ) : (
                          <Send
                            size={20}
                            color={
                              newComment.trim()
                                ? theme.text
                                : theme.textSecondary
                            }
                          />
                        )}
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
