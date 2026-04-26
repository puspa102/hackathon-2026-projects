import { StyleSheet, Text, View } from 'react-native';

import type { UploadStatus } from '@/components/reports/types';

type UploadStatusBadgeProps = {
  status: UploadStatus;
};

export function UploadStatusBadge({ status }: UploadStatusBadgeProps) {
  const isProcessed = status === 'processed';

  return (
    <View style={[styles.badge, isProcessed ? styles.processedBadge : styles.pendingBadge]}>
      <Text style={[styles.text, isProcessed ? styles.processedText : styles.pendingText]}>
        {isProcessed ? 'PROCESSED' : 'PENDING'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  processedBadge: {
    backgroundColor: '#DCFCE2',
  },
  pendingBadge: {
    backgroundColor: '#F1F5F9',
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  processedText: {
    color: '#138A36',
  },
  pendingText: {
    color: '#1E293B',
  },
});
