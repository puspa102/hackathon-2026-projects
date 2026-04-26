import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type UploadStatus = 'processed' | 'pending';

export type UploadItem = {
  id: string;
  name: string;
  meta: string;
  status: UploadStatus;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconTint: string;
  iconBackground: string;
};
