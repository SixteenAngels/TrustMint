import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/authService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  signInWithPhone: (phoneNumber: string) => Promise<string>;
  verifyOTP: (verificationId: string, otp: string) => Promise<void>;
  updateUser: (userInfo: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null,
  signInWithPhone: async () => '',
  verifyOTP: async () => {},
  updateUser: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const authService = AuthService.getInstance();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const signInWithPhone = async (phoneNumber: string) => {
    return await authService.signInWithPhoneNumber(phoneNumber);
  };

  const verifyOTP = async (verificationId: string, otp: string) => {
    await authService.verifyPhoneNumber(verificationId, otp);
  };

  const updateUser = async (userInfo: Partial<User>) => {
    if (user) {
      await authService.updateUserProfile(user.id, userInfo);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signInWithPhone, verifyOTP, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
