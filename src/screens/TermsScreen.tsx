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

interface TermsScreenProps {
  onClose?: () => void;
}

export const TermsScreen: React.FC<TermsScreenProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const termsContent = `TERMS AND CONDITIONS

Last Updated: January 2024
Version: 1.0

1. ACCEPTANCE OF TERMS
By accessing and using the Mint Trade application, website, and services, you accept and agree to be bound by and abide by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

2. LICENSE TO USE
Mint Trade grants you a non-exclusive, non-transferable, limited license to use the service. This license permits you to use the application solely for your personal, non-commercial use.

3. RESTRICTIONS ON USE
You agree not to:
- Reproduce, duplicate, copy, or sell any part of the service
- Transmit any unlawful, threatening, abusive, or libelous material
- Distribute any form of software virus or malware
- Access the service through automated or non-human means
- Violate any applicable laws or regulations

4. USER ACCOUNTS
You are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account.

5. FINANCIAL TRANSACTIONS
All financial transactions conducted through Mint Trade are subject to our Financial Services Policy. We do not guarantee profits or returns on investments. All trades are subject to market conditions and may result in losses.

6. DISCLAIMERS
The service is provided "as is" without warranty of any kind. We make no warranties, expressed or implied, regarding the service or any products or services included in the service.

7. LIMITATION OF LIABILITY
In no case shall Mint Trade be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of the service.

8. INDEMNIFICATION
You agree to indemnify and hold harmless Mint Trade from any claims, damages, or costs arising from your violation of these terms.

9. MODIFICATIONS
We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of the service after changes constitutes acceptance.

10. GOVERNING LAW
These terms are governed by and construed in accordance with the laws of Ghana.

11. CONTACT INFORMATION
For questions about these terms, please contact: legal@minttrade.gh`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <SFSymbol name="chevron.left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={[styles.title, { color: colors.textPrimary }]}>Terms & Conditions</Text>
        {onClose && <View style={{ width: 40 }} />}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
            {termsContent}
          </Text>

          <View style={[styles.acceptanceBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <SFSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
            <Text style={[styles.acceptanceText, { color: colors.textSecondary }]}>
              By using Mint Trade, you acknowledge that you have read, understood, and agree to these Terms & Conditions
            </Text>
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
  acceptanceBox: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  acceptanceText: {
    ...typography.bodySmall,
    flex: 1,
    lineHeight: 20,
  },
});

