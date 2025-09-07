import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Star,
  MessageCircle,
  Share,
  X,
  Send,
  MoreHorizontal,
  Flag,
  Check,
  Edit,
  Trash,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { Comment } from '@/types/Comment';
import { Post } from '@/types/Post';
import { Theme } from '@/types/Theme';
import { useTheme } from '@/contexts/ThemeContext';
import ImageSlashIcon from '@/icon/ImageSlashIcon';
import { format } from 'timeago.js';
import { showToast } from '@/utils/toastUtils';
import {
  postService,
  commentService,
  messageService,
  searchService,
  reportService,
} from '@/services';
import { VirtualizedCommentList } from '@/utils/virtualizationUtils';
import Color from 'color';

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
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
      borderBottomColor: theme.border,
    },
    headerButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
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
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    captionSection: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    caption: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      lineHeight: 24,
    },
    captionUsername: {
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    tagsSection: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    tags: {
      flexDirection: 'row',
      gap: 8,
    },
    commentsSection: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    commentsTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 16,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
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
      color: theme.textSecondary,
    },
    bottomPadding: {
      height: 100,
    },
    commentInput: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      padding: 16,
      backgroundColor: theme.background,
      margin: -10,
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
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      maxHeight: 100,
      color: theme.text,
    },
    sendButton: {
      padding: 12,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyText: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 24,
      textAlign: 'center',
    },
    errorText: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.textSecondary,
      marginBottom: 20,
    },
    backButton: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    backButtonText: {
      color: '#000',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    moreMenu: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: 34,
    },
    moreMenuHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    moreMenuTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    moreMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      gap: 16,
    },
    moreMenuItemText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    reportModal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    reportContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      width: '100%',
      maxWidth: 400,
    },
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    reportTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    reportOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 8,
    },
    reportOptionSelected: {
      borderColor: theme.text,
      backgroundColor: theme.background,
    },
    reportOptionText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
    },
    reportInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      marginTop: 12,
      marginBottom: 20,
      height: 80,
      textAlignVertical: 'top',
      color: theme.text,
      fontSize: 14,
      fontFamily: 'Inter-Regular',
    },
    reportButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    reportButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    reportButtonCancel: {
      backgroundColor: theme.background,
    },
    reportButtonSubmit: {
      backgroundColor: theme.text,
    },
    reportButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
    },
    reportButtonTextCancel: {
      color: theme.text,
    },
    reportButtonTextSubmit: {
      color: theme.background,
    },
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      width: '100%',
      maxWidth: 400,
      maxHeight: '85%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalSearchInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      marginBottom: 16,
      backgroundColor: theme.background,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    modalSubtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      marginBottom: 16,
    },
    modalOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 8,
    },
    modalOptionSelected: {
      borderColor: theme.text,
      backgroundColor: theme.background,
    },
    modalOptionText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    modalInput: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginTop: 12,
      marginBottom: 20,
      height: 80,
      textAlignVertical: 'top',
      fontSize: 14,
      fontFamily: 'Inter-Regular',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    modalFooter: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 4,
      alignItems: 'center',
    },
    modalButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    modalButtonCancel: {
      borderWidth: 1,
    },
    modalButtonSubmit: {},
    modalButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    emptySearchState: {
      padding: 40,
      alignItems: 'center',
    },
    emptySearchText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      textAlign: 'center',
    },
    usersList: {
      flexGrow: 1,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.border,
    },
    userItemSelected: {
      backgroundColor: Color(theme.accent).alpha(0.1).toString(),
      borderRadius: 16,
    },

    userName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
    },
    userUsername: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      marginTop: 2,
    },
    editCommentContainer: {
      marginTop: 8,
    },
    editCommentInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.text,
      backgroundColor: theme.card,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    editActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 8,
    },
    editActionButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    editActionText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.text,
    },
    saveButton: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    saveButtonText: {
      color: theme.background,
    },
  });
};

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams() as { postId: string };
  const [isStarred, setIsStarred] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const { user, likePost, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [imageHeight, setImageHeight] = useState(400);
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showCommentActions, setShowCommentActions] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!token || !postId) return;

    const fetchPostAndComment = async () => {
      setIsLoading(true);
      try {
        const response = await postService.getPostById(postId, token);
        const post = response.post;
        if (!post) return;

        setPost(post);

        const commentsResponse = await commentService.getPostComments(
          postId,
          token
        );
        if (commentsResponse.status) setComments(commentsResponse.comments);

        setIsStarred(user?.likedPosts?.includes(post._id) || false);
      } catch (error) {
        console.error('Error fetching post and comments:', error);
        Alert.alert('Error', 'Failed to load post details. Please try again.', [
          { text: 'OK' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostAndComment();
  }, [postId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (post) {
      setIsStarred(user?.likedPosts?.includes(post._id) || false);
    }
  }, [user?.likedPosts, post]);

  useEffect(() => {
    if (post) {
      Image.getSize(
        post.imageUrl,
        (width, height) => {
          const screenWidth = Dimensions.get('window').width;
          const scaleFactor = width / screenWidth;
          let scaledHeight = height / scaleFactor;

          if (scaledHeight > 400) scaledHeight = 400;

          setImageHeight(scaledHeight);
        },
        () => {}
      );
    }
  }, [post]);

  const searchUsers = useCallback(
    async (query: string) => {
      if (!token) {
        setSearchedUsers([]);
        return;
      }

      try {
        const [userRes, shopRes] = await Promise.all([
          searchService.searchUsers(query, token),
          searchService.searchShops(query, token),
        ]);
        let merged: any[] = [];
        if (userRes.status) {
          merged = merged.concat(
            userRes.users.filter((u: any) => u._id !== user?._id)
          );
        }
        if (shopRes.status) {
          merged = merged.concat(
            shopRes.users.filter((s: any) => s._id !== user?._id)
          );
        }
        setSearchedUsers(merged);
      } catch (error) {
        console.error('Error searching users and shops:', error);
        setSearchedUsers([]);
      }
    },
    [token, user?._id]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(userSearchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [userSearchQuery, searchUsers]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowMoreMenu(true)}
            disabled
          >
            <MoreHorizontal size={24} color={theme.background} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.text} />
          <Text style={{ color: theme.text, fontSize: 16, marginTop: 8 }}>
            Loading post...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.emptyIconContainer}>
            <ImageSlashIcon size={40} />
          </View>
          <Text style={styles.emptyText}>Post not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleStar = () => {
    const newStarred = !isStarred;
    setIsStarred(newStarred);
    setPost((prev) =>
      prev ? { ...prev, stars: prev.stars + (newStarred ? 1 : -1) } : null
    );
    likePost(post._id);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !token) return;

    try {
      let response;
      if (replyingTo) {
        response = await commentService.replyToComment(
          replyingTo,
          { userId: user._id, postId: post._id, text: newComment },
          token
        );
      } else {
        response = await commentService.createComment(
          { userId: user._id, postId: post._id, text: newComment },
          token
        );
      }

      if (response.status) {
        const newAdded = response.comment;

        if (replyingTo) {
          setComments((prev) =>
            prev.map((comment) =>
              comment._id === replyingTo
                ? {
                    ...comment,
                    replies: [...(comment.replies || []), newAdded],
                  }
                : comment
            )
          );
          setReplyingTo(null);
        } else {
          setComments((prev) => [newAdded, ...prev]);
        }

        post.comments += 1;
        setNewComment('');
      } else {
        throw new Error('Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment. Please try again.', [
        { text: 'OK' },
      ]);
    }
  };

  const handleShare = async () => {
    if (!post || !token) return;

    setShowShareModal(false);
    await Promise.all(
      selectedUsers.map(async (user) => {
        const conversation = await messageService.getConversationId(
          user._id,
          token
        );
        await messageService.sendMessage(
          conversation.conversationId,
          `Check out this post`,
          'post',
          token,
          undefined,
          undefined,
          undefined,
          post._id,
          undefined
        );
      })
    );
  };

  const handleUserSelect = (selectedUser: any) => {
    setSelectedUsers((prev) => {
      if (prev.find((u) => u._id === selectedUser._id)) {
        return prev.filter((u) => u._id !== selectedUser._id);
      }
      return [...prev, selectedUser];
    });
  };

  const renderUserList = (item: any) => {
    const isSelected = selectedUsers.find((u) => u._id === item._id);
    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => handleUserSelect(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.fullName || item.username || 'Unknown User'}
          </Text>
          {item.username && (
            <Text style={styles.userUsername}>@{item.username}</Text>
          )}
        </View>
        {isSelected && <Check size={20} color={theme.accent} />}
      </TouchableOpacity>
    );
  };

  const handleReport = async () => {
    if (!reportReason.trim() || !user) return;

    const reasonMap: { [key: string]: string } = {
      Spam: 'spam',
      'Inappropriate Content': 'inappropriate_content',
      'False Information': 'other',
      'Copyright Violation': 'copyright_violation',
      Other: 'other',
    };

    try {
      if (!token) return;

      const response = await reportService.createReport(
        {
          targetType: 'post',
          targetId: post._id,
          reason: reasonMap[reportReason] || 'other',
          description:
            reportDescription.trim() || 'No additional details provided',
        },
        token
      );

      if (response.status) {
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
        Alert.alert(
          'Report Submitted',
          'Thank you for your report. We will review it shortly.'
        );
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.', [
        { text: 'OK' },
      ]);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setSelectedComment(comment);
    setEditingCommentId(comment._id);
    setEditingText(comment.text);
    setShowCommentActions(false);
  };

  const handleSaveEdit = async () => {
    if (!editingText.trim() || !editingCommentId || !token) return;

    try {
      const response = await commentService.updateComment(
        editingCommentId,
        editingText,
        token!
      );

      if (response.status) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === editingCommentId
              ? { ...comment, text: editingText }
              : comment
          )
        );
        setEditingCommentId(null);
        setEditingText('');
        setSelectedComment(null);
        showToast.success('Comment updated successfully');
      } else {
        throw new Error('Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      showToast.error('Failed to update comment');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
    setSelectedComment(null);
  };

  const handleReportComment = async () => {
    if (!selectedComment || !reportReason.trim() || !user) return;

    const reasonMap: { [key: string]: string } = {
      Spam: 'spam',
      'Inappropriate Content': 'inappropriate_content',
      'False Information': 'other',
      'Copyright Violation': 'copyright_violation',
      Other: 'other',
    };

    try {
      const response = await reportService.createReport(
        {
          targetType: 'comment',
          targetId: selectedComment._id,
          reason: reasonMap[reportReason] || 'other',
          description:
            reportDescription.trim() || 'No additional details provided',
        },
        token!
      );

      if (response.status) {
        setShowCommentActions(false);
        setSelectedComment(null);
        setReportReason('');
        setReportDescription('');
        showToast.success('Comment reported successfully');
      } else {
        throw new Error('Failed to report comment');
      }
    } catch (error) {
      console.error('Error reporting comment:', error);
      showToast.error('Failed to report comment');
    }
  };

  const handleDeleteComment = async () => {
    if (!selectedComment || !token) return;

    try {
      const response = await commentService.deleteComment(
        selectedComment._id,
        token
      );

      if (response.status) {
        setComments((prev) =>
          prev.filter((comment) => comment._id !== selectedComment._id)
        );
        setShowCommentActions(false);
        setSelectedComment(null);
        showToast.success('Comment deleted successfully');
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      showToast.error('Failed to delete comment');
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <View
      key={comment._id}
      style={[styles.commentItem, isReply && styles.replyItem]}
    >
      <TouchableOpacity
        onPress={() =>
          router.push(`/${comment.user.type}/${comment.user._id}` as any)
        }
      >
        <Image
          source={{ uri: comment.user.avatar }}
          style={styles.commentAvatar}
        />
      </TouchableOpacity>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <TouchableOpacity
            onPress={() =>
              router.push(`/${comment.user.type}/${comment.user._id}` as any)
            }
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
        {editingCommentId === comment._id ? (
          <View style={styles.editCommentContainer}>
            <TextInput
              style={styles.editCommentInput}
              value={editingText}
              onChangeText={setEditingText}
              multiline
              autoFocus
              placeholder="Edit your comment..."
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.editActionButton}
                onPress={handleCancelEdit}
              >
                <Text style={styles.editActionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editActionButton, styles.saveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={[styles.editActionText, styles.saveButtonText]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onLongPress={() => {
              if (comment.user._id === user?._id) {
                setSelectedComment(comment);
                setShowCommentActions(true);
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.commentText}>{comment.text}</Text>
          </TouchableOpacity>
        )}
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
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowMoreMenu(true)}
        >
          <MoreHorizontal size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.userSection}>
          <TouchableOpacity
            onPress={() =>
              router.push(`/${post.user.type}/${post.user._id}` as any)
            }
          >
            <Image
              source={{ uri: post.user.avatar }}
              style={styles.userAvatar}
            />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <TouchableOpacity
              onPress={() =>
                router.push(`/${post.user.type}/${post.user._id}` as any)
              }
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

        <Image
          source={{ uri: post.imageUrl }}
          style={{
            width: '100%',
            height: imageHeight,
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
            <Text style={[styles.actionText]}>{post.stars}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={24} color={theme.text} strokeWidth={2} />
            <Text style={styles.actionText}>{comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setShowMoreMenu(false);
              setShowShareModal(true);
            }}
          >
            <Share size={24} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {post.caption && (
          <View style={styles.captionSection}>
            <Text style={styles.caption}>
              <Text style={styles.captionUsername}>{post.user.username}</Text>{' '}
              {post.caption}
            </Text>
          </View>
        )}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
          <VirtualizedCommentList
            comments={comments}
            renderComment={(comment) => renderComment(comment)}
            emptyMessage="No comments yet"
            contentContainerStyle={{ paddingBottom: 80 }}
            keyboardShouldPersistTaps="handled"
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.commentInput}>
          {replyingTo && (
            <View style={styles.replyingIndicator}>
              <Text style={styles.replyingText}>
                Replying to{' '}
                {comments.find((c) => c._id === replyingTo)?.user.username}
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <X size={16} color={theme.textSecondary} />
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
      </KeyboardAvoidingView>

      <Modal
        visible={showMoreMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoreMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMoreMenu(false)}
        >
          <View style={styles.moreMenu}>
            <View style={styles.moreMenuHeader}>
              <Text style={styles.moreMenuTitle}>More Options</Text>
              <TouchableOpacity onPress={() => setShowMoreMenu(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                setShowMoreMenu(false);
                setShowShareModal(true);
              }}
            >
              <Share size={20} color={theme.text} />
              <Text style={styles.moreMenuItemText}>Share Post</Text>
            </TouchableOpacity>

            {post && post.user._id !== user?._id && (
              <TouchableOpacity
                style={styles.moreMenuItem}
                onPress={() => {
                  setShowMoreMenu(false);
                  setShowReportModal(true);
                }}
              >
                <Flag size={20} color={theme.error} />
                <Text style={[styles.moreMenuItemText, { color: theme.error }]}>
                  Report Post
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showReportModal}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setShowReportModal(false);
          setSelectedComment(null);
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.reportModal}>
            <View style={styles.reportContainer}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>
                  Report {selectedComment ? 'Comment' : 'Post'}
                </Text>
                <TouchableOpacity onPress={() => setShowReportModal(false)}>
                  <X size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  styles.reportOptionText,
                  { marginBottom: 12, color: theme.textSecondary },
                ]}
              >
                Why are you reporting this{' '}
                {selectedComment ? 'comment' : 'post'}?
              </Text>

              {[
                'Spam',
                'Inappropriate Content',
                'False Information',
                'Copyright Violation',
                'Other',
              ].map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reportOption,
                    reportReason === reason && styles.reportOptionSelected,
                  ]}
                  onPress={() => setReportReason(reason)}
                >
                  <Text style={styles.reportOptionText}>{reason}</Text>
                </TouchableOpacity>
              ))}

              <TextInput
                style={styles.reportInput}
                placeholder="Additional details (optional)"
                placeholderTextColor={theme.textSecondary}
                value={reportDescription}
                onChangeText={setReportDescription}
                multiline
              />

              <View style={styles.reportButtons}>
                <TouchableOpacity
                  style={[styles.reportButton, styles.reportButtonCancel]}
                  onPress={() => {
                    setShowReportModal(false);
                    setSelectedComment(null);
                  }}
                >
                  <Text
                    style={[
                      styles.reportButtonText,
                      styles.reportButtonTextCancel,
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.reportButton, styles.reportButtonSubmit]}
                  onPress={selectedComment ? handleReportComment : handleReport}
                  disabled={!reportReason.trim()}
                >
                  <Text
                    style={[
                      styles.reportButtonText,
                      styles.reportButtonTextSubmit,
                    ]}
                  >
                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showShareModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowShareModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modal}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Share User Profile</Text>
                  <TouchableOpacity onPress={() => setShowShareModal(false)}>
                    <X size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.modalSearchInput}
                  placeholder={'Search user...'}
                  value={userSearchQuery}
                  onChangeText={setUserSearchQuery}
                  placeholderTextColor={theme.textSecondary}
                  autoFocus
                />

                <FlatList
                  data={searchedUsers}
                  renderItem={({ item }) => {
                    return renderUserList(item);
                  }}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={styles.usersList}
                  ListEmptyComponent={
                    <View style={styles.emptySearchState}>
                      <Text style={styles.emptySearchText}>No users found</Text>
                    </View>
                  }
                />

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleShare}
                  >
                    <Text style={styles.modalButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showCommentActions}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowCommentActions(false);
          setSelectedComment(null);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowCommentActions(false);
            setSelectedComment(null);
          }}
        >
          <View style={styles.moreMenu}>
            <View style={styles.moreMenuHeader}>
              <Text style={styles.moreMenuTitle}>Comment Options</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCommentActions(false);
                  setSelectedComment(null);
                }}
              >
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                handleEditComment(selectedComment!);
              }}
            >
              <Edit size={20} color={theme.text} />
              <Text style={styles.moreMenuItemText}>Edit Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                Alert.alert(
                  'Delete Comment',
                  'Are you sure you want to delete this comment? This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: handleDeleteComment,
                    },
                  ]
                );
              }}
            >
              <Trash size={20} color={theme.error} />
              <Text style={[styles.moreMenuItemText, { color: theme.error }]}>
                Delete Comment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                setShowCommentActions(false);
                setShowReportModal(true);
              }}
            >
              <Flag size={20} color={theme.error} />
              <Text style={[styles.moreMenuItemText, { color: theme.error }]}>
                Report Comment
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
