
import '../global.css';

import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import '../src/init';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
