import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type InfoBannerProps = {
  message: string;
};

export function InfoBanner({ message }: InfoBannerProps) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <MaterialIcons name="info" size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF5FD',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BFDDFC',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C90F5',
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 24,
    color: '#193457',
  },
});
