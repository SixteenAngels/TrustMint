import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { LanguageService } from '../services/languageService';
import { Language } from '../types/ai';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
  onLanguageChange?: (language: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  visible,
  onClose,
  onLanguageChange,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [languages, setLanguages] = useState<Language[]>([]);

  const languageService = LanguageService.getInstance();

  useEffect(() => {
    loadLanguages();
    loadCurrentLanguage();
  }, []);

  const loadLanguages = () => {
    const supportedLanguages = languageService.getSupportedLanguages();
    setLanguages(supportedLanguages);
  };

  const loadCurrentLanguage = async () => {
    const currentLang = languageService.getCurrentLanguage();
    setSelectedLanguage(currentLang);
  };

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      await languageService.setCurrentLanguage(languageCode);
      setSelectedLanguage(languageCode);
      onLanguageChange?.(languageCode);
      
      Alert.alert(
        'Language Changed',
        'App language has been updated. Some changes may require a restart.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert('Error', 'Failed to change language. Please try again.');
    }
  };

  const handleClose = () => {
    onClose();
  };

  const renderLanguageItem = (language: Language) => (
    <TouchableOpacity
      key={language.code}
      style={[
        styles.languageItem,
        selectedLanguage === language.code && styles.selectedLanguageItem
      ]}
      onPress={() => handleLanguageSelect(language.code)}
    >
      <View style={styles.languageInfo}>
        <Text style={styles.languageFlag}>{language.flag}</Text>
        <View style={styles.languageDetails}>
          <Text style={[
            styles.languageName,
            selectedLanguage === language.code && styles.selectedLanguageName
          ]}>
            {language.name}
          </Text>
          <Text style={[
            styles.languageNativeName,
            selectedLanguage === language.code && styles.selectedLanguageNativeName
          ]}>
            {language.nativeName}
          </Text>
        </View>
      </View>
      {selectedLanguage === language.code && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Language</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Language List */}
        <ScrollView 
          style={styles.languageList}
          showsVerticalScrollIndicator={false}
        >
          {languages.map(renderLanguageItem)}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Changing the language will update the app interface. Some features may require a restart.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  placeholder: {
    width: 32,
  },
  languageList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedLanguageItem: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  languageDetails: {
    flex: 1,
  },
  languageName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  selectedLanguageName: {
    color: colors.primary,
  },
  languageNativeName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  selectedLanguageNativeName: {
    color: colors.primary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 16,
    color: colors.textWhite,
    fontWeight: '600',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});