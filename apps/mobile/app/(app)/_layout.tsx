import { Drawer } from 'expo-router/drawer';
import { theme } from '@/theme';
import { DrawerContent } from '@/components/nav/DrawerContent';

export default function AppLayout() {
  return (
    <Drawer
      // Pass the drawer's own props through: DrawerContent renders outside the
      // screen tree, so a useNavigation() there cannot dispatch CLOSE_DRAWER.
      drawerContent={(props) => <DrawerContent navigation={props.navigation} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: { backgroundColor: '#0C1220', width: 300 },
        overlayColor: theme.colors.overlay,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {/* Ask VEDA is the root screen; everything else is reached from the drawer. */}
      <Drawer.Screen name="index" />
      <Drawer.Screen name="read/index" />
      <Drawer.Screen name="explore/index" />
      <Drawer.Screen name="graph" />
      <Drawer.Screen name="research" />
      <Drawer.Screen name="library" />
      <Drawer.Screen name="profile" />
      <Drawer.Screen name="settings" />
      {/* Detail routes: reachable by deep link, but hidden from the drawer list
          since they have no meaningful destination without a slug. */}
      <Drawer.Screen name="explore/[slug]" options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen
        name="read/[slug]/index"
        options={{ drawerItemStyle: { display: 'none' } }}
      />
    </Drawer>
  );
}
