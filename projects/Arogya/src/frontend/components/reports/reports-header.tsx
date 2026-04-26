import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type ReportsHeaderProps = {
  brandName: string;
};

export function ReportsHeader({ brandName }: ReportsHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <MaterialIcons name="person" size={26} color="#F8FAFC" />
          </View>
        </View>
        <Text style={styles.logoText}>{brandName}</Text>
      </View>
      <MaterialIcons name="notifications" size={28} color="#64748B" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5EAF1',
    backgroundColor: '#FFFFFF',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D8BFF',
    marginRight: 12,
  },
  avatarInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: -0.3,
  },
});
