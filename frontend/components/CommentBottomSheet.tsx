import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { X, Send } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/Theme';
import { Comment } from '@/types/Comment';

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
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

interface CommentBottomSheetProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  comments: Comment[];
  renderComment: (comment: Comment) => React.ReactNode;
  newComment: string;
  setNewComment: (newComment: string) => void;
  replyingTo: string | null;
  setReplyingTo: (replyingTo: string | null) => void;
  onAddComment: () => void;
}

export const CommentBottomSheet = ({
  visible,
  setVisible,
  comments,
  renderComment,
  newComment,
  setNewComment,
  replyingTo,
  setReplyingTo,
  onAddComment,
}: CommentBottomSheetProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['80%'], []);
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) setVisible(false);
  }, []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }  
  }, [visible]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={-1}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backgroundStyle={{ backgroundColor: theme.card }}
      handleIndicatorStyle={{ backgroundColor: theme.textSecondary }}
    >
      <View style={{ flex: 1, paddingHorizontal: 16, zIndex: 1000 }}>
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>Comments</Text>
          <TouchableOpacity onPress={() => setVisible(false)}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.commentsList}>
          {comments.map((comment) => renderComment(comment))}
        </ScrollView>

        <View style={[styles.commentInput, { paddingBottom: 16 }]}>
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
              onPress={onAddComment}
              disabled={!newComment.trim()}
            >
              <Send size={20} color={newComment.trim() ? theme.text : theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
};
