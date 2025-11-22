import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SFSymbol } from '../components/SFSymbols';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

interface ContactScreenProps {
  onClose?: () => void;
}

export const ContactScreen: React.FC<ContactScreenProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    // In a real app, this would send the message to a backend
    Alert.alert('Success', 'Your message has been sent. We\'ll get back to you within 24 hours.');
    setSubject('');
    setMessage('');
  };

  const handleCall = () => {
    Linking.openURL('tel:+233XXXXXXXXX');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@minttrade.gh?subject=Support Request');
  };

  const contactMethods = [
    {
      icon: 'envelope.fill',
      title: 'Email',
      detail: 'support@minttrade.gh',
      action: handleEmail,
      color: colors.primary,
    },
    {
      icon: 'phone.fill',
      title: 'Phone',
      detail: '+233 XX XXX XXXX',
      action: handleCall,
      color: colors.success,
    },
    {
      icon: 'clock.fill',
      title: 'Business Hours',
      detail: 'Mon - Fri, 8AM - 6PM GMT',
      action: null,
      color: colors.warning,
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
        <Text style={[styles.title, { color: colors.textPrimary }]}>Contact Us</Text>
        {onClose && <View style={{ width: 40 }} />}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Contact Methods */}
          <View style={[styles.section, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Get in Touch</Text>
            {contactMethods.map((method, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.contactMethod,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  method.action && styles.contactMethodPressable
                ]}
                onPress={method.action || undefined}
                disabled={!method.action}
              >
                <View style={[styles.contactIcon, { backgroundColor: `${method.color}20` }]}>
                  <SFSymbol name={method.icon} size={24} color={method.color} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactMethodTitle, { color: colors.textPrimary }]}>{method.title}</Text>
                  <Text style={[styles.contactMethodDetail, { color: colors.textSecondary }]}>{method.detail}</Text>
                </View>
                {method.action && (
                  <SFSymbol name="chevron.right" size={18} color={colors.textLight} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Form */}
          <View style={[styles.section, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Send us a Message</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Fill out the form below and we'll get back to you within 24 hours
            </Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Subject</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="What can we help you with?"
                  placeholderTextColor={colors.textLight}
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Message</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="Tell us more about your inquiry..."
                  placeholderTextColor={colors.textLight}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: colors.primary }]}
                onPress={handleSendMessage}
              >
                <SFSymbol name="paperplane.fill" size={18} color={colors.textWhite} />
                <Text style={[styles.sendButtonText, { color: colors.textWhite }]}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Response Time Info */}
          <View style={[styles.infoCard, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
            <SFSymbol name="clock.fill" size={24} color={colors.success} />
            <View style={styles.infoCardContent}>
              <Text style={[styles.infoCardTitle, { color: colors.success }]}>Response Time</Text>
              <Text style={[styles.infoCardText, { color: colors.success }]}>
                We typically respond within 24 hours during business days
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
  },
  section: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.h5,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    marginBottom: spacing.md,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  contactMethodPressable: {
    ...shadows.sm,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactMethodTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  contactMethodDetail: {
    ...typography.bodySmall,
  },
  form: {
    marginTop: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyMedium,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    ...typography.body,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    ...typography.body,
    minHeight: 120,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    marginTop: spacing.sm,
    ...shadows.button,
  },
  sendButtonText: {
    ...typography.button,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.md,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoCardText: {
    ...typography.bodySmall,
  },
});

