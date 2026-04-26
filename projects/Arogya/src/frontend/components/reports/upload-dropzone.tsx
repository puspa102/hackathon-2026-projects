import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type UploadDropzoneProps = {
  title: string;
  subtitle: string;
};

export function UploadDropzone({ title, subtitle }: UploadDropzoneProps) {
  return (
    <View style={styles.dropzone}>
      <View style={styles.dropIconBadge}>
        <MaterialIcons name="cloud-upload" size={34} color="#0B63B0" />
      </View>
      <Text style={styles.dropTitle}>{title}</Text>
      <Text style={styles.dropSubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dropzone: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#2E73DB',
    paddingHorizontal: 18,
    paddingVertical: 34,
    marginBottom: 18,
    backgroundColor: '#FFFFFF',
  },
  dropIconBadge: {
    width: 70,
    height: 70,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5F0FF',
    marginBottom: 16,
  },
  dropTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0B63B0',
    marginBottom: 6,
  },
  dropSubtitle: {
    fontSize: 14,
    letterSpacing: 0.8,
    fontWeight: '500',
    color: '#111827',
  },
});
