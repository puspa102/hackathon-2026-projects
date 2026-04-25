import AppButton from 'components/AppButton';
import AppCard from 'components/AppCard';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeView() {
  return (
    <SafeAreaView className="flex flex-1">
      <AppButton label="Steps" onPress={() => console.log('Steps')} />
      <AppCard onPress={() => console.log('Sleep')}>
        <Text>Sample Text</Text>
      </AppCard>
    </SafeAreaView>
  );
}
