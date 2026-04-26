import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import { UploadStatusBadge } from '@/components/reports/upload-status-badge';
import type { UploadItem } from '@/components/reports/types';

type UploadListItemProps = {
  item: UploadItem;
};

export function UploadListItem({ item }: UploadListItemProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.fileIconWrap, { backgroundColor: item.iconBackground }]}>
        <MaterialIcons name={item.icon} size={24} color={item.iconTint} />
      </View>

      <View style={styles.fileMeta}>
        <Text style={styles.fileName}>{item.name}</Text>
        <Text style={styles.fileDetails}>{item.meta}</Text>
      </View>

      <UploadStatusBadge status={item.status} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9E3EF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  fileIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileMeta: {
    flex: 1,
    paddingRight: 10,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 13,
    color: '#475569',
  },
});
