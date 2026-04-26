import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type UploadActionCardProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  variant?: 'primary' | 'secondary';
};

export function UploadActionCard({
  icon,
  label,
  variant = 'primary',
}: UploadActionCardProps) {
  const isPrimary = variant === 'primary';

  return (
    <View style={[styles.card, isPrimary ? styles.primaryCard : styles.secondaryCard]}>
      <MaterialIcons
        name={icon}
        size={isPrimary ? 28 : 26}
        color={isPrimary ? '#FFFFFF' : '#26323C'}
      />
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 112,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  primaryCard: {
    backgroundColor: '#0B66AE',
  },
  secondaryCard: {
    backgroundColor: '#DCEAF7',
    borderWidth: 1,
    borderColor: '#B7CBDE',
  },
  label: {
    marginTop: 12,
    fontSize: 16,
  },
  primaryLabel: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryLabel: {
    color: '#0F172A',
  },
});
