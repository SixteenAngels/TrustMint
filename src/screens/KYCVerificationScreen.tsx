import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { KYCService } from '../services/kycService';
import { 
  KYCProfile, 
  KYCStep, 
  PersonalInfo, 
  AddressInfo,
  KYC_LEVELS,
  KYC_STEPS,
  DOCUMENT_TYPES,
  KYC_STATUS_COLORS
} from '../types/kyc';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { shadows } from '../styles/shadows';

export const KYCVerificationScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'steps' | 'documents' | 'status'>('steps');
  const [kycProfile, setKycProfile] = useState<KYCProfile | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');

  // Form states
  const [personalInfo, setPersonalInfo] = useState<Partial<PersonalInfo>>({});
  const [addressInfo, setAddressInfo] = useState<Partial<AddressInfo>>({
    currentAddress: {
      street: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'Ghana',
      isResidential: true,
      isBusiness: false,
      isMailing: true,
      verificationStatus: 'pending',
    },
    previousAddresses: [],
    addressVerificationStatus: 'pending',
  });
  const [documentImages, setDocumentImages] = useState<{ front?: string; back?: string; selfie?: string }>({});

  const kycService = KYCService.getInstance();

  useEffect(() => {
    loadKYCProfile();
  }, []);

  const loadKYCProfile = async () => {
    setLoading(true);
    try {
      const userId = 'current_user_id';
      const profile = await kycService.getKYCProfile(userId);
      
      if (profile) {
        setKycProfile(profile);
        setPersonalInfo(profile.personalInfo);
        setAddressInfo(profile.addressInfo);
      } else {
        // Create new KYC profile
        const profileId = await kycService.createKYCProfile(userId, 'basic');
        const newProfile = await kycService.getKYCProfile(userId);
        setKycProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading KYC profile:', error);
      Alert.alert('Error', 'Failed to load KYC profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStep < KYC_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete KYC process
      await completeKYCProcess();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeKYCProcess = async () => {
    setLoading(true);
    try {
      if (!kycProfile) return;

      // Update personal info
      await kycService.updatePersonalInfo(kycProfile.id, personalInfo as PersonalInfo);

      // Update address info
      await kycService.updateAddressInfo(kycProfile.id, addressInfo as AddressInfo);

      // Run compliance checks
      await kycService.runComplianceChecks(kycProfile.id);

      // Calculate risk score
      await kycService.calculateRiskScore(kycProfile.id);

      // Update profile status
      await kycService.updateKYCProfile(kycProfile.id, {
        status: 'verified',
        completedAt: new Date(),
      });

      Alert.alert(
        'Success',
        'KYC verification completed successfully!',
        [{ text: 'OK', onPress: () => loadKYCProfile() }]
      );
    } catch (error) {
      console.error('Error completing KYC process:', error);
      Alert.alert('Error', 'Failed to complete KYC verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (documentType: string) => {
    setSelectedDocumentType(documentType);
    setShowDocumentModal(true);
  };

  const handleTakePhoto = (type: 'front' | 'back' | 'selfie') => {
    // TODO: Implement actual camera integration
    // This should use expo-camera or react-native-camera to capture real photos
    Alert.alert(
      'Camera Integration Required', 
      'Camera functionality needs to be implemented for production use. Please integrate with expo-camera or react-native-camera.'
    );
  };

  const handleVerifyDocument = async () => {
    if (!selectedDocumentType || !documentImages.front) {
      Alert.alert('Error', 'Please capture all required images');
      return;
    }

    setLoading(true);
    try {
      if (!kycProfile) return;

      const result = await kycService.verifyDocumentWithSmileID(
        kycProfile.id,
        `doc_${Date.now()}`,
        selectedDocumentType,
        documentImages.front,
        documentImages.back,
        documentImages.selfie
      );

      if (result.success) {
        Alert.alert('Success', 'Document verified successfully!');
        setShowDocumentModal(false);
        setDocumentImages({});
        loadKYCProfile();
      } else {
        Alert.alert('Error', result.message || 'Document verification failed');
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      Alert.alert('Error', 'Failed to verify document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      {[
        { id: 'steps', label: 'Steps', icon: '📋' },
        { id: 'documents', label: 'Documents', icon: '📄' },
        { id: 'status', label: 'Status', icon: '✅' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabButton,
            activeTab === tab.id && styles.tabButtonActive
          ]}
          onPress={() => setActiveTab(tab.id as any)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[
            styles.tabText,
            activeTab === tab.id && styles.tabTextActive
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStepsTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>KYC Verification Steps</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / KYC_STEPS.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {KYC_STEPS.length}
          </Text>
        </View>

        {/* Current Step */}
        {KYC_STEPS[currentStep] && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>{KYC_STEPS[currentStep].name}</Text>
            <Text style={styles.stepDescription}>{KYC_STEPS[currentStep].description}</Text>
            
            <View style={styles.stepInstructions}>
              <Text style={styles.instructionsTitle}>Instructions:</Text>
              {KYC_STEPS[currentStep].instructions.map((instruction, index) => (
                <Text key={index} style={styles.instructionText}>• {instruction}</Text>
              ))}
            </View>

            <View style={styles.stepRequirements}>
              <Text style={styles.requirementsTitle}>Requirements:</Text>
              {KYC_STEPS[currentStep].requirements.map((requirement, index) => (
                <Text key={index} style={styles.requirementText}>• {requirement}</Text>
              ))}
            </View>

            <View style={styles.stepTips}>
              <Text style={styles.tipsTitle}>Tips:</Text>
              {KYC_STEPS[currentStep].tips.map((tip, index) => (
                <Text key={index} style={styles.tipText}>• {tip}</Text>
              ))}
            </View>

            {/* Step-specific forms */}
            {renderStepForm()}

            <View style={styles.stepActions}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={styles.previousButton}
                  onPress={handlePreviousStep}
                >
                  <Text style={styles.previousButtonText}>Previous</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.nextButton, loading && styles.nextButtonDisabled]}
                onPress={handleNextStep}
                disabled={loading}
              >
                <Text style={styles.nextButtonText}>
                  {loading ? 'Processing...' : 
                   currentStep === KYC_STEPS.length - 1 ? 'Complete' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderStepForm = () => {
    const step = KYC_STEPS[currentStep];
    
    switch (step.id) {
      case 'personal_info':
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your first name"
                value={personalInfo.firstName || ''}
                onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, firstName: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your last name"
                value={personalInfo.lastName || ''}
                onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, lastName: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="+233XXXXXXXXX"
                value={personalInfo.phoneNumber || ''}
                onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, phoneNumber: text }))}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email"
                value={personalInfo.email || ''}
                onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
              />
            </View>
          </View>
        );

      case 'address_verification':
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Address Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Street Address *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your street address"
                value={addressInfo.currentAddress?.street || ''}
                onChangeText={(text) => setAddressInfo(prev => ({
                  ...(prev || {}),
                  currentAddress: { ...(prev?.currentAddress || addressInfo.currentAddress!), street: text }
                }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your city"
                value={addressInfo.currentAddress?.city || ''}
                onChangeText={(text) => setAddressInfo(prev => ({
                  ...(prev || {}),
                  currentAddress: { ...(prev?.currentAddress || addressInfo.currentAddress!), city: text }
                }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Region *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your region"
                value={addressInfo.currentAddress?.region || ''}
                onChangeText={(text) => setAddressInfo(prev => ({
                  ...(prev || {}),
                  currentAddress: { ...(prev?.currentAddress || addressInfo.currentAddress!), region: text }
                }))}
              />
            </View>
          </View>
        );

      case 'document_upload':
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Document Upload</Text>
            
            <TouchableOpacity
              style={styles.documentButton}
              onPress={() => handleDocumentUpload('ghana_card')}
            >
              <Text style={styles.documentButtonText}>📄 Upload Ghana Card</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  const renderDocumentsTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uploaded Documents</Text>
        
        {DOCUMENT_TYPES.map((docType) => (
          <View key={docType.id} style={styles.documentCard}>
            <View style={styles.documentInfo}>
              <Text style={styles.documentIcon}>{docType.icon}</Text>
              <View style={styles.documentDetails}>
                <Text style={styles.documentName}>{docType.name}</Text>
                <Text style={styles.documentDescription}>{docType.description}</Text>
                {docType.isRequired && (
                  <Text style={styles.requiredText}>Required</Text>
                )}
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleDocumentUpload(docType.id)}
            >
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderStatusTab = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verification Status</Text>
        
        {kycProfile && (
          <>
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>Overall Status</Text>
              <View style={styles.statusInfo}>
                <Text style={[
                  styles.statusText,
                  { color: KYC_STATUS_COLORS[kycProfile.status] }
                ]}>
                  {kycProfile.status.toUpperCase()}
                </Text>
                <Text style={styles.statusLevel}>Level: {kycProfile.level}</Text>
              </View>
            </View>

            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>Verification Progress</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(kycProfile.verificationSteps.filter(s => s.status === 'completed').length / kycProfile.verificationSteps.length) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {kycProfile.verificationSteps.filter(s => s.status === 'completed').length} of {kycProfile.verificationSteps.length} steps completed
              </Text>
            </View>

            <View style={styles.stepsCard}>
              <Text style={styles.stepsTitle}>Step Status</Text>
              {kycProfile.verificationSteps.map((step, index) => (
                <View key={step.id} style={styles.stepStatusItem}>
                  <Text style={styles.stepStatusIcon}>
                    {step.status === 'completed' ? '✅' : 
                     step.status === 'in_progress' ? '⏳' : 
                     step.status === 'failed' ? '❌' : '⭕'}
                  </Text>
                  <Text style={styles.stepStatusName}>{step.name}</Text>
            <Text style={[ 
              styles.stepStatusText,
              { color: KYC_STATUS_COLORS[step.status as keyof typeof KYC_STATUS_COLORS] }
            ]}>
                    {step.status.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );

  const renderDocumentModal = () => (
    <Modal
      visible={showDocumentModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowDocumentModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowDocumentModal(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Upload Document</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.modalDescription}>
            Take clear photos of your {selectedDocumentType.replace('_', ' ')} document
          </Text>
          
          <View style={styles.photoContainer}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => handleTakePhoto('front')}
            >
              <Text style={styles.photoButtonText}>📷 Front Side</Text>
              {documentImages.front && <Text style={styles.photoStatus}>✓ Captured</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => handleTakePhoto('back')}
            >
              <Text style={styles.photoButtonText}>📷 Back Side</Text>
              {documentImages.back && <Text style={styles.photoStatus}>✓ Captured</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => handleTakePhoto('selfie')}
            >
              <Text style={styles.photoButtonText}>🤳 Selfie</Text>
              {documentImages.selfie && <Text style={styles.photoStatus}>✓ Captured</Text>}
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.verifyButton, (!documentImages.front || loading) && styles.verifyButtonDisabled]}
            onPress={handleVerifyDocument}
            disabled={!documentImages.front || loading}
          >
            <Text style={styles.verifyButtonText}>
              {loading ? 'Verifying...' : 'Verify Document'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  if (loading && !kycProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading KYC profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>KYC Verification</Text>
        <Text style={styles.subtitle}>Complete your identity verification</Text>
      </View>

      {/* Tab Selector */}
      {renderTabSelector()}

      {/* Content */}
      {activeTab === 'steps' && renderStepsTab()}
      {activeTab === 'documents' && renderDocumentsTab()}
      {activeTab === 'status' && renderStatusTab()}

      {/* Document Modal */}
      {renderDocumentModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
  },
  contentContainer: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  stepCard: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: 12,
  },
  stepTitle: {
    ...typography.h5,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  stepDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  stepInstructions: {
    marginBottom: spacing.md,
  },
  instructionsTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  instructionText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  stepRequirements: {
    marginBottom: spacing.md,
  },
  requirementsTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  requirementText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  stepTips: {
    marginBottom: spacing.lg,
  },
  tipsTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  tipText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  formContainer: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.textPrimary,
  },
  stepActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previousButton: {
    backgroundColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    flex: 0.4,
    alignItems: 'center',
  },
  previousButtonText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    flex: 0.55,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.border,
  },
  nextButtonText: {
    ...typography.bodyMedium,
    color: colors.textWhite,
    fontWeight: '600',
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  documentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  documentDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  requiredText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  uploadButtonText: {
    ...typography.caption,
    color: colors.textWhite,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  statusTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    ...typography.h5,
    fontWeight: '700',
  },
  statusLevel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  progressCard: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  stepsCard: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: 12,
  },
  stepsTitle: {
    ...typography.h6,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  stepStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepStatusIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  stepStatusName: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  stepStatusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
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
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  placeholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  modalDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  photoContainer: {
    marginBottom: spacing.xl,
  },
  photoButton: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  photoButtonText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  photoStatus: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.xs,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: colors.border,
  },
  verifyButtonText: {
    ...typography.button,
    color: colors.textWhite,
    fontSize: 18,
  },
  documentButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  documentButtonText: {
    ...typography.bodyMedium,
    color: colors.textWhite,
    fontWeight: '600',
  },
});