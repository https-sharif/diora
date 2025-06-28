import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star, MessageCircle, Share, X, Send, Heart } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Post, Comment } from '@/components/PostCard';
import { mockPosts } from '@/mock/Post';
import { mockComments } from '@/mock/Comment';


const { width } = Dimensions.get('window');


export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const { user } = useAuth();

  const post = mockPosts.find(post => post.id === id);

  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    if (!post || !post.imageUrl) return;

    Image.getSize(
      post.imageUrl,
      (width, height) => setAspectRatio(width / height),
      (err) => console.error('Failed to get image size:', err)
    );
  }, [post]);

  useEffect(() => {
    if (post) {
      setStarCount(post.stars);
      setComments(mockComments.filter(comment => post.comments.includes(comment.id)));
    }
  }, [post]);

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleStar = () => {
    const newStarred = !isStarred;
    setIsStarred(newStarred);
    setStarCount(prev => newStarred ? prev + 1 : prev - 1);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;
    const comment: Comment = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
      text: newComment,
      createdAt: 'now',
      likes: 0,
    };

    if (replyingTo) {
      setComments(prev => prev.map(c => 
        c.id === replyingTo
          ? { ...c, replies: [...(c.replies || []), comment] }
          : c
      ));
      setReplyingTo(null);
    } else {
      setComments(prev => [comment, ...prev]);
    }
    
    setNewComment('');
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <View key={comment.id} style={[styles.commentItem, isReply && styles.replyItem]}>
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
        {comment.replies?.map(reply => renderComment(reply, true))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Share size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userSection}>
          <Image source={{ uri: post.avatar }} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.timestamp}>{post.createdAt}</Text>
          </View>
        </View>

        {/* Post Image */}
        <TouchableOpacity onPress={() => setShowImageModal(true)}>
          <Image
          source={{ uri: post.imageUrl }}
          style={{
            width: '100%',
            height: undefined,
            aspectRatio,
            resizeMode: 'contain',
          }}
        />
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleStar}>
            <Star
              size={24}
              color={isStarred ? '#FFD700' : '#666'}
              fill={isStarred ? '#FFD700' : 'transparent'}
              strokeWidth={2}
            />
            <Text style={[styles.actionText, isStarred && styles.starredText]}>
              {starCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={24} color="#666" strokeWidth={2} />
            <Text style={styles.actionText}>{comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Share size={24} color="#666" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Caption */}
        <View style={styles.captionSection}>
          <Text style={styles.caption}>
            <Text style={styles.captionUsername}>{post.username}</Text>{' '}
            {post.caption}
          </Text>
        </View>

        {/* Comments */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
          {comments.map(comment => renderComment(comment))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInput}>
        {replyingTo && (
          <View style={styles.replyingIndicator}>
            <Text style={styles.replyingText}>
              Replying to {comments.find(c => c.id === replyingTo)?.username}
            </Text>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <X size={16} color="#666" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.commentTextInput}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            placeholderTextColor="#666"
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Send size={20} color={newComment.trim() ? "#000" : "#ccc"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Full Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity 
            style={styles.imageModalClose}
            onPress={() => setShowImageModal(false)}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: post.imageUrl }} style={styles.fullImage} />
          <View style={styles.imageModalCaption}>
            <Text style={styles.imageModalCaptionText}>{post.caption}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: -100,
    paddingBottom: -100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
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
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  starredText: {
    color: '#FFD700',
  },
  captionSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  caption: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000',
    lineHeight: 24,
  },
  captionUsername: {
    fontFamily: 'Inter-SemiBold',
  },
  tagsSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginBottom: 16,
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
    color: '#000',
  },
  commentTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#000',
    lineHeight: 20,
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
    color: '#666',
  },
  bottomPadding: {
    height: 100,
  },
  commentInput: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    padding: 16,
    backgroundColor: '#fff',
  },
  replyingIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  commentTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
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
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  fullImage: {
    width: width,
    height: width,
    resizeMode: 'contain',
  },
  imageModalCaption: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 16,
  },
  imageModalCaptionText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});