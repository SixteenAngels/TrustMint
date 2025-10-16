import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthService } from '../services/authService';
import { AuthScreen } from '../screens/AuthScreen';
import { MainNavigator } from './MainNavigator';
import { User } from '../types';

const Stack = createStackNavigator();

export const AppNavigator: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const authService = AuthService.getInstance();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
