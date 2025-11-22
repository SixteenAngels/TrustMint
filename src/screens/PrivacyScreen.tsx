import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SFSymbol } from '../components/SFSymbols';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

interface PrivacyScreenProps {
  onClose?: () => void;
}

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const privacyContent = `PRIVACY POLICY

Last Updated: January 2024
Version: 1.0

1. INTRODUCTION
Mint Trade ("we", "us", "our", or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and otherwise handle your information when you use our mobile application, website, and related services.

2. INFORMATION WE COLLECT
We collect information you provide directly, such as:
- Name, email address, and phone number
- Financial account information
- Identity verification documents
- Trading and transaction history
- Device information and usage patterns

3. HOW WE USE YOUR INFORMATION
We use collected information to:
- Provide and improve our services
- Process transactions and send related information
- Verify your identity and prevent fraud
- Comply with legal obligations
- Send promotional communications (with consent)
- Analyze service usage and trends

4. INFORMATION SHARING
We do not sell, trade, or rent your personal information. We may share information with:
- Service providers who assist us in operations
- Financial institutions for transaction processing
- Legal authorities when required by law
- Business partners with your consent

5. DATA SECURITY
We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction. All data is encrypted and stored securely.

6. COOKIES AND TRACKING
We use cookies and similar technologies to enhance user experience and analyze service usage. You can control cookie preferences through your device settings.

7. YOUR RIGHTS
You have the right to:
- Access your personal data
- Correct inaccurate information
- Request deletion of your data
- Opt-out of marketing communications
- Data portability

8. CHILDREN'S PRIVACY
Our services are not intended for users under 18 years old. We do not knowingly collect information from children.

9. INTERNATIONAL DATA TRANSFERS
Your information may be transferred to, stored in, and processed in countries other than your country of residence.

10. RETENTION OF DATA
We retain your information for as long as necessary to provide services and comply with legal obligations.

11. THIRD-PARTY LINKS
Our service may contain links to third-party websites. We are not responsible for their privacy practices.

12. MODIFICATIONS
We may update this Privacy Policy from time to time. We will notify you of significant changes.

13. CONTACT US
For privacy concerns or requests, contact: privacy@minttrade.gh`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <SFSymbol name="chevron.left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={[styles.title, { color: colors.textPrimary }]}>Privacy Policy</Text>
        {onClose && <View style={{ width: 40 }} />}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
            {privacyContent}
          </Text>

          <View style={[styles.securityBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <SFSymbol name="shield.fill" size={24} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.securityTitle, { color: colors.textPrimary }]}>Your Privacy Matters</Text>
              <Text style={[styles.securityText, { color: colors.textSecondary }]}>
                We are committed to protecting your personal information with industry-leading security standards
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  title: {
    ...typography.h3,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  bodyText: {
    ...typography.body,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  securityBox: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  securityTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  securityText: {
    ...typography.bodySmall,
    lineHeight: 20,
  },
});

