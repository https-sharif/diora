import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, Modal, ScrollView, TextInput, StyleSheet, TouchableWithoutFeedback, KeyboardAvoidingView, Platform , Keyboard } from 'react-native';
import { Star, MessageCircle, X, Send, Heart } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { mockComments } from '@/mock/Comment';
import { Post } from '@/types/Post';
import { Comment } from '@/types/Comment';
import { Theme } from '@/types/Theme';
import { router } from 'expo-router';
import { mockUsers } from '@/mock/User';

interface PostCardProps {
  post: Post;
  onStar?: (postId: string) => void;
}

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
  });
}

export default function PostCard({ post, onStar }: PostCardProps) {
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(post.stars);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [imageHeight, setImageHeight] = useState(0);

  useEffect(() => {
    const user = mockUsers.find((user) => user.id === post.userId);
    if (user) {
      setUserAvatar(user.avatar!);
    }

    Image.getSize(post.imageUrl, (width, height) => {
      const screenWidth = Dimensions.get('window').width - 32;
      const scaleFactor = width / screenWidth;
      const scaledHeight = height / scaleFactor;
      setImageHeight(scaledHeight);
    });
  }, [post.imageUrl, post.userId]);

  const handleStar = () => {
    const newStarred = !isStarred;
    setIsStarred(newStarred);
    setStarCount((prev) => (newStarred ? prev + 1 : prev - 1));
    onStar?.(post.id);
  };

  const formatNumber = (num : number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace('.0', '') + 'M';
    if (num > 9999) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    return num.toLocaleString();
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
      <TouchableOpacity onPress={() => {
        router.push(`/user/${comment.userId}`);
        setShowComments(false);
      }}>
        <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
      </TouchableOpacity>
      <View style={styles.commentContent}>
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
            <Text style={styles.actionText}>{formatNumber(post.comments.length)}</Text>
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
      {/* <Modal
        visible={showComments}
        animationType="slide"
        transparent
        onRequestClose={() => setShowComments(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowComments(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
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
          </View>
        </TouchableWithoutFeedback>
      </Modal> */}
    </>
  );
}
