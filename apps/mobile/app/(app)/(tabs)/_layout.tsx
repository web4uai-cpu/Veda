import { Tabs } from 'expo-router';
import { theme } from '@/theme';
import { TabBar } from '@/components/nav/TabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="read" />
      <Tabs.Screen name="ask" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="library" />
    </Tabs>
  );
}
