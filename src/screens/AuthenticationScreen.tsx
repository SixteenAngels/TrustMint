import React, { useRef, useState } from 'react';
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
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import * as AppleAuthentication from 'expo-apple-authentication';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';
import { firebaseConfig } from '../core/firebase';
import { ENABLE_PHONE_VERIFICATION, IS_DEV } from '../config';
import { useTheme } from '../contexts/ThemeContext';
import { SFSymbol } from '../components/SFSymbols';

interface AuthenticationScreenProps {
  onComplete: () => void;
}

export const AuthenticationScreen: React.FC<AuthenticationScreenProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const recaptchaVerifier = useRef<any>(null);
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
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [managerLoading, setManagerLoading] = useState(false);
  const [showManagerLogin, setShowManagerLogin] = useState(false);

  const { signUpWithEmail, signInWithEmail, signInAsAdmin, signInAsManager, startPhoneVerification, verifyOTP, updateUser, signInWithGoogle, bypassAuth, bypassAdminAuth, bypassManagerAuth } = useAuth();

  const handleEmailPrimary = async () => {
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!email || !password || password !== confirmPassword) {
          Alert.alert('Error', 'Enter a valid email and matching passwords');
          return;
        }
        await signUpWithEmail(email.trim(), password, name.trim() || undefined);
        setStep(ENABLE_PHONE_VERIFICATION ? 2 : 3);
      } else {
        await signInWithEmail(email.trim(), password);
        setStep(ENABLE_PHONE_VERIFICATION ? 2 : 3);
      }
    } catch (error: any) {
      const errorMessage = error?.message || (mode === 'signup' ? 'Failed to sign up' : 'Failed to sign in');
      Alert.alert('Error', errorMessage);
      console.error('Authentication error:', error);
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

  const handleAdminLogin = async () => {
    if (!adminEmail || !adminPassword) {
      Alert.alert('Error', 'Please enter admin email and password');
      return;
    }

    setAdminLoading(true);
    try {
      await signInAsAdmin(adminEmail.trim(), adminPassword);
      onComplete();
    } catch (error: any) {
      Alert.alert('Admin Login Failed', error.message || 'Invalid admin credentials');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleManagerLogin = async () => {
    if (!managerEmail || !managerPassword) {
      Alert.alert('Error', 'Please enter manager email and password');
      return;
    }

    setManagerLoading(true);
    try {
      await signInAsManager(managerEmail.trim(), managerPassword);
      onComplete();
    } catch (error: any) {
      Alert.alert('Manager Login Failed', error.message || 'Invalid manager credentials');
    } finally {
      setManagerLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <SFSymbol name="chart.line.uptrend.xyaxis" size={48} color={colors.primary} />
          </View>
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

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={[styles.button, styles.googleButton]} 
          onPress={async () => { 
            try { 
              await signInWithGoogle(); 
              onComplete();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign in with Google');
            }
          }}
        >
          <SFSymbol name="globe" size={20} color={colors.textWhite} />
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
          try { setLoading(true); const id = await startPhoneVerification(phoneNumber, recaptchaVerifier.current); setVerificationId(id); }
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
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig as any}
        attemptInvisibleVerification
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {step === 1 && renderStep1()}
        {ENABLE_PHONE_VERIFICATION && step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        <View style={styles.bypassContainer}>
          <TouchableOpacity
            style={styles.bypassButton}
            onPress={() => {
              bypassAuth();
              onComplete();
            }}
          >
            <Text style={styles.bypassText}>Continue without signing in</Text>
          </TouchableOpacity>
        </View>

        {/* Admin Login Section */}
        <View style={styles.adminContainer}>
          <TouchableOpacity
            style={styles.adminToggle}
            onPress={() => setShowAdminLogin(!showAdminLogin)}
          >
            <Text style={styles.adminToggleText}>
              {showAdminLogin ? '▼ Hide Admin Login' : '▶ Admin Login'}
            </Text>
          </TouchableOpacity>

          {showAdminLogin && (
            <View style={styles.adminForm}>
              <Text style={styles.adminTitle}>Admin Access</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Admin Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="admin@minttrade.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={adminEmail}
                  onChangeText={setAdminEmail}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Admin Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  secureTextEntry
                  value={adminPassword}
                  onChangeText={setAdminPassword}
                />
              </View>
              <TouchableOpacity
                style={[styles.button, styles.adminButton, adminLoading && styles.buttonDisabled]}
                onPress={handleAdminLogin}
                disabled={adminLoading}
              >
                <Text style={styles.buttonText}>
                  {adminLoading ? 'Signing in...' : 'Sign In as Admin'}
                </Text>
              </TouchableOpacity>

              {/* Admin Bypass Button (Dev Only) */}
              {IS_DEV && (
                <TouchableOpacity
                  style={[styles.button, styles.adminBypassButton]}
                  onPress={() => {
                    bypassAdminAuth();
                    onComplete();
                  }}
                >
                  <SFSymbol name="wrench.and.screwdriver" size={18} color={colors.textWhite} />
                  <Text style={styles.buttonText}>Bypass Admin Login (Dev)</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Manager Login Section */}
          <View style={styles.adminContainer}>
            <TouchableOpacity
              style={styles.adminToggle}
              onPress={() => setShowManagerLogin(!showManagerLogin)}
            >
              <Text style={styles.adminToggleText}>
                {showManagerLogin ? '▼ Hide Manager Login' : '▶ Manager Login'}
              </Text>
            </TouchableOpacity>
            {showManagerLogin && (
              <View style={styles.adminForm}>
                <Text style={styles.adminTitle}>Manager Access</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Manager Email</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
                    placeholder="manager@minttrade.com"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={managerEmail}
                    onChangeText={setManagerEmail}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Manager Password</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
                    placeholder="Enter password"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry
                    value={managerPassword}
                    onChangeText={setManagerPassword}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.button, styles.adminButton, managerLoading && styles.buttonDisabled]}
                  onPress={handleManagerLogin}
                  disabled={managerLoading}
                >
                  <Text style={styles.buttonText}>
                    {managerLoading ? 'Signing in...' : 'Sign In as Manager'}
                  </Text>
                </TouchableOpacity>

                {/* Manager Bypass Button (Dev Only) */}
                {IS_DEV && (
                  <TouchableOpacity
                    style={[styles.button, styles.adminBypassButton]}
                    onPress={() => {
                      bypassManagerAuth();
                      onComplete();
                    }}
                  >
                    <SFSymbol name="wrench.and.screwdriver" size={18} color={colors.textWhite} />
                    <Text style={styles.buttonText}>Bypass Manager Login (Dev)</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
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
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
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
  inputContainer: { marginBottom: spacing.xl },
  label: { ...typography.bodyMedium, color: colors.textPrimary, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.button,
  },
  buttonDisabled: { backgroundColor: colors.border, opacity: 0.6 },
  buttonText: { ...typography.button, color: colors.textWhite },
  googleButton: {
    backgroundColor: '#4285F4',
    marginTop: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  linkButton: { alignItems: 'center', marginTop: spacing.lg },
  linkText: { ...typography.bodyMedium, color: colors.primary },
  welcomeContainer: {
    backgroundColor: colors.successLight,
    padding: spacing.lg,
    borderRadius: 16,
    marginTop: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.success,
  },
  welcomeText: { ...typography.bodyMedium, color: colors.success, textAlign: 'center' },
  bypassContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  bypassButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  bypassText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  adminContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  adminToggle: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  adminToggleText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  adminForm: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  adminTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  adminButton: {
    backgroundColor: colors.accent,
    marginTop: spacing.sm,
  },
  adminBypassButton: {
    backgroundColor: colors.warning,
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
