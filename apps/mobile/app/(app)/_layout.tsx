import { Drawer } from 'expo-router/drawer';
import { theme } from '@/theme';
import { DrawerContent } from '@/components/nav/DrawerContent';

export default function AppLayout() {
  return (
    <Drawer
      drawerContent={() => <DrawerContent />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: { backgroundColor: '#0C1220', width: 300 },
        overlayColor: theme.colors.overlay,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}
