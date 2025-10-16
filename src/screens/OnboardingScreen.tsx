import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import * as AppleAuthentication from 'expo-apple-authentication';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

interface AuthenticationScreenProps {
  onComplete: () => void;
}

export const AuthenticationScreen: React.FC<AuthenticationScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUpWithEmail, signInWithEmail, startPhoneVerification, verifyOTP, updateUser, signInWithApple, signInWithGoogle } = useAuth();

  const handleEmailPrimary = async () => {
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!email || !password || password !== confirmPassword) {
          Alert.alert('Error', 'Enter a valid email and matching passwords');
          return;
        }
        await signUpWithEmail(email.trim(), password, name.trim() || undefined);
        setStep(2);
      } else {
        await signInWithEmail(email.trim(), password);
        setStep(2);
      }
    } catch (error) {
      Alert.alert('Error', mode === 'signup' ? 'Failed to sign up' : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(verificationId, otp);
      setStep(3);
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (pin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    setLoading(true);
    try {
      await updateUser({
        name: name.trim(),
        email: email.trim() || undefined,
        pin,
      });
      onComplete();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>💹</Text>
        </View>
        <Text style={styles.title}>Welcome to Mint Trade</Text>
        <Text style={styles.subtitle}>Ghana's Smart Stock Trading App</Text>
      </View>
      
      <View style={styles.formContainer}>
        {mode === 'signup' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} placeholder="Your name" value={name} onChangeText={setName} />
          </View>
        )}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="you@email.com" autoCapitalize="none" value={email} onChangeText={setEmail} />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />
        </View>
        {mode === 'signup' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput style={styles.input} placeholder="••••••••" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
          </View>
        )}

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleEmailPrimary} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? (mode === 'signup' ? 'Creating...' : 'Signing in...') : (mode === 'signup' ? 'Sign Up' : 'Sign In')}</Text>
        </TouchableOpacity>

        <View style={{ height: 12 }} />
        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={8}
            style={{ width: '100%', height: 44, marginBottom: 8 }}
            onPress={async () => { try { await signInWithApple(); } catch {} }}
          />
        )}
        <TouchableOpacity style={[styles.button, { backgroundColor: '#4285F4' }]} onPress={async () => { try { await signInWithGoogle(); } catch {} }}>
          <Text style={styles.buttonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
          <Text style={styles.linkText}>{mode === 'signup' ? 'Have an account? Sign In' : "New here? Create Account"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Verify Your Phone</Text>
      <Text style={styles.subtitle}>Add your number and verify to secure your account</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone (+233...)</Text>
        <TextInput style={styles.input} placeholder="+233XXXXXXXXX" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
      </View>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={async () => {
          try { setLoading(true); const id = await startPhoneVerification(phoneNumber); setVerificationId(id); }
          catch { Alert.alert('Error', 'Failed to send code'); }
          finally { setLoading(false); }
        }}
        disabled={loading || !phoneNumber}
      >
        <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Code'}</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Verification Code</Text>
        <TextInput style={styles.input} placeholder="123456" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerifyOTP}
        disabled={loading || otp.length !== 6}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verifying...' : 'Verify'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setStep(1)}
      >
        <Text style={styles.linkText}>Change phone number</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>Set up your trading account</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          autoFocus
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Create 4-digit PIN</Text>
        <TextInput
          style={styles.input}
          placeholder="1234"
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm PIN</Text>
        <TextInput
          style={styles.input}
          placeholder="1234"
          value={confirmPin}
          onChangeText={setConfirmPin}
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCompleteProfile}
        disabled={loading || !name.trim() || pin.length !== 4 || pin !== confirmPin}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Setting up...' : 'Complete Setup'}
        </Text>
      </TouchableOpacity>

      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>
          🎉 You'll start with ₵10,000 demo credits!
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  logoEmoji: {
    fontSize: 32,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    padding: spacing.xl,
    ...shadows.card,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    overflow: 'hidden',
  },
  countryCode: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  countryCodeText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  phoneInput: {
    flex: 1,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: colors.backgroundSecondary,
    color: colors.textPrimary,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.button,
  },
  buttonDisabled: {
    backgroundColor: colors.border,
  },
  buttonText: {
    ...typography.button,
    color: colors.textWhite,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  linkText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  welcomeContainer: {
    backgroundColor: colors.successLight,
    padding: spacing.lg,
    borderRadius: 16,
    marginTop: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.success,
  },
  welcomeText: {
    ...typography.bodyMedium,
    color: colors.success,
    textAlign: 'center',
  },
});