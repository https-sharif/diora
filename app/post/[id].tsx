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

const { width } = Dimensions.get('window');

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

const mockPostDetails: Record<string, {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  image: string;
  caption: string;
  stars: number;
  comments: number;
  timestamp: string;
  location?: string;
  tags: string[];
  allComments: Comment[];
}> = {
  '1': {
    id: '1',
    user: {
      username: 'fashionista_jane',
      avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    image: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Loving this vintage look! Perfect for a casual day out ✨ The denim jacket is from @urbanthreads and pairs perfectly with these high-waisted jeans. Sometimes the simplest outfits make the biggest statement. #vintage #ootd #denimondenim',
    stars: 128,
    comments: 23,
    timestamp: '2h ago',
    location: 'New York, NY',
    tags: ['#vintage', '#ootd', '#denimondenim', '#casualstyle'],
    allComments: [
      {
        id: '1',
        user: 'style_lover',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        text: 'Absolutely love this look! Where did you get that jacket?',
        timestamp: '2h ago',
        likes: 12,
        replies: [
          {
            id: '1-1',
            user: 'fashionista_jane',
            avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
            text: 'Thank you! Got it from Urban Threads 💕',
            timestamp: '1h ago',
            likes: 5,
          }
        ]
      },
      {
        id: '2',
        user: 'trendy_alex',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
        text: 'Perfect styling! The colors work so well together 🔥',
        timestamp: '3h ago',
        likes: 8,
      },
      {
        id: '3',
        user: 'vintage_queen',
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
        text: 'This is giving me major 90s vibes! Love it 😍',
        timestamp: '4h ago',
        likes: 15,
      },
      {
        id: '4',
        user: 'denim_lover',
        avatar: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=100',
        text: 'Double denim done right! 👌',
        timestamp: '5h ago',
        likes: 6,
      }
    ]
  },
  '2': {
    id: '2',
    user: {
      username: 'style_maven',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Black and white never goes out of style 🖤🤍 This outfit is perfect for any occasion, from brunch to a night out. The classic combo always makes a statement! #minimalism #chic #blackandwhite',
    stars: 256,
    comments: 41,
    timestamp: '4h ago',
    location: 'Los Angeles, CA',
    tags: ['#minimalism', '#chic', '#blackandwhite'],
    allComments: [
      {
        id: '1',
        user: 'fashion_fanatic',
        avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
        text: 'This is so classy! Where did you get that top?',
        timestamp: '1h ago',
        likes: 20,
      },
      {
        id: '2',
        user: 'urban_style',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
        text: 'Love the simplicity of this look! Perfect for any occasion.',
        timestamp: '2h ago',
        likes: 15,
      }
    ]
  },
  '3': {
    id: '3',
    user: {
      username: 'trendy_alex',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    image: 'https://images.pexels.com/photos/1457983/pexels-photo-1457983.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Summer vibes with this flowy dress 🌸 Perfect for brunch dates! The light fabric and floral print make it a must-have for the season. #summerfashion #brunchvibes #floraldress',
    stars: 89,
    comments: 12,
    timestamp: '6h ago',
    location: 'Miami, FL',
    tags: ['#summerfashion', '#brunchvibes', '#floraldress'],
    allComments: [
      {
        id: '1',
        user: 'beach_babe',
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
        text: 'This dress is gorgeous! Perfect for a beach day 🌊',
        timestamp: '30m ago',
        likes: 10,
      },
      {
        id: '2',
        user: 'floral_fan',
        avatar: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=100',
        text: 'I love the floral print! So perfect for summer 🌺',
        timestamp: '1h ago',
        likes: 8,
      }
    ]
  },
};

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const post = mockPostDetails[id || '1'];

  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    if (!post || !post.image) return;

    Image.getSize(
      post.image,
      (width, height) => setAspectRatio(width / height),
      (err) => console.error('Failed to get image size:', err)
    );
  }, [post]);

  React.useEffect(() => {
    if (post) {
      setStarCount(post.stars);
      setComments(post.allComments);
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
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: 'current_user',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
      text: newComment,
      timestamp: 'now',
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
          <Text style={styles.commentUser}>{comment.user}</Text>
          <Text style={styles.commentTime}>{comment.timestamp}</Text>
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
          <Image source={{ uri: post.user.avatar }} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{post.user.username}</Text>
            <Text style={styles.timestamp}>{post.timestamp}</Text>
            {post.location && (
              <Text style={styles.location}>{post.location}</Text>
            )}
          </View>
        </View>

        {/* Post Image */}
        <TouchableOpacity onPress={() => setShowImageModal(true)}>
          <Image
          source={{ uri: post.image }}
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
            <Text style={styles.captionUsername}>{post.user.username}</Text>{' '}
            {post.caption}
          </Text>
        </View>

        {/* Tags */}
        {post.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tags}>
                {post.tags.map((tag, index) => (
                  <TouchableOpacity key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

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
              Replying to {comments.find(c => c.id === replyingTo)?.user}
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
          <Image source={{ uri: post.image }} style={styles.fullImage} />
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