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

interface HelpScreenProps {
  onClose?: () => void;
}

export const HelpScreen: React.FC<HelpScreenProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const helpSections = [
    {
      title: 'Getting Started',
      items: [
        'How to create an account',
        'How to verify your identity (KYC)',
        'How to add funds to your wallet',
        'How to place your first trade',
      ],
    },
    {
      title: 'Trading',
      items: [
        'How to buy stocks',
        'How to sell stocks',
        'Understanding market orders',
        'Setting up price alerts',
      ],
    },
    {
      title: 'Wallet & Payments',
      items: [
        'How to add money',
        'How to withdraw funds',
        'Payment methods available',
        'Transaction history',
      ],
    },
    {
      title: 'Account & Security',
      items: [
        'How to change your password',
        'How to enable biometric login',
        'How to update your profile',
        'How to contact support',
      ],
    },
  ];

  const faqs = [
    {
      question: 'Is my money safe?',
      answer: 'Yes, we use bank-level encryption and are regulated by the Securities and Exchange Commission of Ghana.',
    },
    {
      question: 'What are the trading fees?',
      answer: 'We charge a small commission on each trade. See our fee schedule in the app for details.',
    },
    {
      question: 'How long do withdrawals take?',
      answer: 'Withdrawals are typically processed within 1-3 business days.',
    },
    {
      question: 'Can I trade on weekends?',
      answer: 'The Ghana Stock Exchange operates Monday through Friday, 9:00 AM to 3:00 PM GMT.',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <SFSymbol name="chevron.left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={[styles.title, { color: colors.textPrimary }]}>Help & Support</Text>
        {onClose && <View style={{ width: 40 }} />}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Quick Help Section */}
          <View style={[styles.section, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.sectionHeader}>
              <SFSymbol name="questionmark.circle.fill" size={24} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Help</Text>
            </View>
            {helpSections.map((section, index) => (
              <View key={index} style={styles.helpSection}>
                <Text style={[styles.helpSectionTitle, { color: colors.textPrimary }]}>{section.title}</Text>
                {section.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.helpItem}>
                    <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
                    <Text style={[styles.helpItemText, { color: colors.textSecondary }]}>{item}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* FAQ Section */}
          <View style={[styles.section, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.sectionHeader}>
              <SFSymbol name="bubble.left.and.bubble.right.fill" size={24} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Frequently Asked Questions</Text>
            </View>
            {faqs.map((faq, index) => (
              <View key={index} style={[styles.faqItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.faqQuestion, { color: colors.textPrimary }]}>{faq.question}</Text>
                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.answer}</Text>
              </View>
            ))}
          </View>

          {/* Contact Section */}
          <View style={[styles.contactCard, { backgroundColor: colors.primaryLight }]}>
            <SFSymbol name="envelope.fill" size={32} color={colors.primary} />
            <Text style={[styles.contactTitle, { color: colors.textPrimary }]}>Still Need Help?</Text>
            <Text style={[styles.contactText, { color: colors.textSecondary }]}>
              Our support team is available 24/7 to assist you
            </Text>
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <SFSymbol name="envelope" size={18} color={colors.primary} />
                <Text style={[styles.contactDetail, { color: colors.textPrimary }]}>support@minttrade.gh</Text>
              </View>
              <View style={styles.contactItem}>
                <SFSymbol name="phone.fill" size={18} color={colors.primary} />
                <Text style={[styles.contactDetail, { color: colors.textPrimary }]}>+233 XX XXX XXXX</Text>
              </View>
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
  },
  section: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h5,
    fontWeight: '600',
  },
  helpSection: {
    marginTop: spacing.md,
  },
  helpSectionTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  helpItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  bullet: {
    ...typography.body,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  helpItemText: {
    ...typography.bodySmall,
    flex: 1,
    lineHeight: 20,
  },
  faqItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  faqQuestion: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  faqAnswer: {
    ...typography.bodySmall,
    lineHeight: 20,
  },
  contactCard: {
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.card,
  },
  contactTitle: {
    ...typography.h5,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  contactText: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  contactInfo: {
    width: '100%',
    gap: spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  contactDetail: {
    ...typography.body,
    fontWeight: '500',
  },
});

