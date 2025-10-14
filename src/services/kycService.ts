import { 
  KYCProfile, 
  KYCDocument, 
  KYCStep, 
  PersonalInfo, 
  AddressInfo, 
  EmploymentInfo, 
  FinancialInfo,
  BiometricData,
  ComplianceCheck,
  SmileIDJob,
  SmileIDResult,
  SmileIDConfig,
  KYC_LEVELS,
  KYC_STEPS,
  DOCUMENT_TYPES
} from '../types/kyc';
import { db } from '../../firebase.config';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';

export class KYCService {
  private static instance: KYCService;
  private smileIDConfig: SmileIDConfig;

  constructor() {
    this.smileIDConfig = {
      partnerId: process.env.SMILE_ID_PARTNER_ID || 'your_partner_id',
      apiKey: process.env.SMILE_ID_API_KEY || 'your_api_key',
      environment: 'sandbox', // Change to 'production' for live
      baseUrl: 'https://testapi.smileidentity.com/v1',
      webhookUrl: 'https://minttrade.gh/webhooks/smile-id',
      callbackUrl: 'https://minttrade.gh/kyc/callback',
    };
  }

  static getInstance(): KYCService {
    if (!KYCService.instance) {
      KYCService.instance = new KYCService();
    }
    return KYCService.instance;
  }

  // Create KYC profile
  async createKYCProfile(userId: string, level: 'basic' | 'intermediate' | 'advanced' | 'premium' = 'basic'): Promise<string> {
    try {
      const kycData: Omit<KYCProfile, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        status: 'pending',
        level,
        documents: [],
        verificationSteps: KYC_STEPS.map(step => ({
          ...step,
          status: 'pending',
          retryCount: 0,
        })),
        personalInfo: {
          firstName: '',
          lastName: '',
          dateOfBirth: new Date(),
          gender: 'male',
          nationality: 'Ghanaian',
          phoneNumber: '',
          email: '',
          maritalStatus: 'single',
          occupation: '',
          sourceOfFunds: [],
          pepStatus: false,
        },
        addressInfo: {
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
        },
        complianceChecks: [],
        riskScore: 0,
        riskLevel: 'low',
        verificationMethod: 'smile_id',
      };

      const kycRef = await addDoc(collection(db, 'kycProfiles'), {
        ...kycData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return kycRef.id;
    } catch (error) {
      console.error('Error creating KYC profile:', error);
      throw error;
    }
  }

  // Get KYC profile
  async getKYCProfile(userId: string): Promise<KYCProfile | null> {
    try {
      const kycQuery = query(
        collection(db, 'kycProfiles'),
        where('userId', '==', userId),
        limit(1)
      );

      const snapshot = await getDocs(kycQuery);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate(),
        expiresAt: data.expiresAt?.toDate(),
        lastVerified: data.lastVerified?.toDate(),
        nextReview: data.nextReview?.toDate(),
        documents: data.documents?.map((doc: any) => ({
          ...doc,
          issueDate: doc.issueDate?.toDate() || new Date(),
          expiryDate: doc.expiryDate?.toDate(),
          uploadedAt: doc.uploadedAt?.toDate() || new Date(),
          verifiedAt: doc.verifiedAt?.toDate(),
        })) || [],
        verificationSteps: data.verificationSteps?.map((step: any) => ({
          ...step,
          completedAt: step.completedAt?.toDate(),
          failedAt: step.failedAt?.toDate(),
        })) || [],
        addressInfo: {
          ...data.addressInfo,
          currentAddress: {
            ...data.addressInfo.currentAddress,
            verificationDate: data.addressInfo.currentAddress.verificationDate?.toDate(),
          },
          addressVerificationDate: data.addressInfo.addressVerificationDate?.toDate(),
        },
        employmentInfo: data.employmentInfo ? {
          ...data.employmentInfo,
          startDate: data.employmentInfo.startDate?.toDate() || new Date(),
          endDate: data.employmentInfo.endDate?.toDate(),
          verificationDate: data.employmentInfo.verificationDate?.toDate(),
        } : undefined,
        financialInfo: data.financialInfo ? {
          ...data.financialInfo,
          bankAccounts: data.financialInfo.bankAccounts?.map((account: any) => ({
            ...account,
            verificationDate: account.verificationDate?.toDate(),
            lastUpdated: account.lastUpdated?.toDate() || new Date(),
          })) || [],
          creditCards: data.financialInfo.creditCards?.map((card: any) => ({
            ...card,
            expiryDate: card.expiryDate?.toDate() || new Date(),
            verificationDate: card.verificationDate?.toDate(),
            lastUpdated: card.lastUpdated?.toDate() || new Date(),
          })) || [],
          investments: data.financialInfo.investments?.map((investment: any) => ({
            ...investment,
            verificationDate: investment.verificationDate?.toDate(),
            lastUpdated: investment.lastUpdated?.toDate() || new Date(),
          })) || [],
          loans: data.financialInfo.loans?.map((loan: any) => ({
            ...loan,
            verificationDate: loan.verificationDate?.toDate(),
            lastUpdated: loan.lastUpdated?.toDate() || new Date(),
          })) || [],
          creditScoreDate: data.financialInfo.creditScoreDate?.toDate(),
        } : undefined,
        biometricData: data.biometricData ? {
          ...data.biometricData,
          verificationDate: data.biometricData.verificationDate?.toDate(),
        } : undefined,
        complianceChecks: data.complianceChecks?.map((check: any) => ({
          ...check,
          checkedAt: check.checkedAt?.toDate() || new Date(),
          expiresAt: check.expiresAt?.toDate(),
        })) || [],
      } as KYCProfile;
    } catch (error) {
      console.error('Error getting KYC profile:', error);
      throw error;
    }
  }

  // Update KYC profile
  async updateKYCProfile(profileId: string, updates: Partial<KYCProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, 'kycProfiles', profileId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating KYC profile:', error);
      throw error;
    }
  }

  // Update personal information
  async updatePersonalInfo(profileId: string, personalInfo: Partial<PersonalInfo>): Promise<void> {
    try {
      await updateDoc(doc(db, 'kycProfiles', profileId), {
        personalInfo: personalInfo,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating personal info:', error);
      throw error;
    }
  }

  // Update address information
  async updateAddressInfo(profileId: string, addressInfo: Partial<AddressInfo>): Promise<void> {
    try {
      await updateDoc(doc(db, 'kycProfiles', profileId), {
        addressInfo: addressInfo,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating address info:', error);
      throw error;
    }
  }

  // Upload document
  async uploadDocument(
    profileId: string, 
    documentData: Omit<KYCDocument, 'id' | 'uploadedAt' | 'verifiedAt'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'kycDocuments'), {
        ...documentData,
        uploadedAt: serverTimestamp(),
      });

      // Update profile with document reference
      const profileDoc = await getDoc(doc(db, 'kycProfiles', profileId));
      if (profileDoc.exists()) {
        const profile = profileDoc.data() as KYCProfile;
        const updatedDocuments = [...profile.documents, { ...documentData, id: docRef.id }];
        
        await updateDoc(doc(db, 'kycProfiles', profileId), {
          documents: updatedDocuments,
          updatedAt: serverTimestamp(),
        });
      }

      return docRef.id;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Verify document with Smile ID
  async verifyDocumentWithSmileID(
    profileId: string,
    documentId: string,
    documentType: string,
    frontImage: string,
    backImage?: string,
    selfieImage?: string
  ): Promise<SmileIDResult> {
    try {
      // Create Smile ID job
      const jobData = {
        partner_id: this.smileIDConfig.partnerId,
        callback_url: this.smileIDConfig.callbackUrl,
        partner_params: {
          user_id: profileId,
          job_id: documentId,
          job_type: 1, // Document Verification
        },
        id_info: {
          country: 'GH',
          id_type: documentType,
        },
        images: {
          selfie_image: selfieImage,
          id_card_image: frontImage,
          id_card_image_back: backImage,
        },
        use_enrolled_image: false,
        use_cropped_selfie: true,
        use_document_verification: true,
        use_liveness_check: true,
        use_face_verification: true,
      };

      // Call Smile ID API
      const response = await fetch(`${this.smileIDConfig.baseUrl}/submit_job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.smileIDConfig.apiKey}`,
        },
        body: JSON.stringify(jobData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Document verification failed');
      }

      // Store job result
      const smileIDJob: Omit<SmileIDJob, 'id'> = {
        userId: profileId,
        jobType: 'document_verification',
        status: 'completed',
        createdAt: new Date(),
        completedAt: new Date(),
        result: result,
        retryCount: 0,
        maxRetries: 3,
      };

      await addDoc(collection(db, 'smileIDJobs'), {
        ...smileIDJob,
        createdAt: serverTimestamp(),
        completedAt: serverTimestamp(),
      });

      // Update document status
      await this.updateDocumentStatus(profileId, documentId, result.success ? 'verified' : 'rejected', result);

      return result;
    } catch (error) {
      console.error('Error verifying document with Smile ID:', error);
      throw error;
    }
  }

  // Update document status
  private async updateDocumentStatus(
    profileId: string, 
    documentId: string, 
    status: 'verified' | 'rejected', 
    result?: SmileIDResult
  ): Promise<void> {
    try {
      const profileDoc = await getDoc(doc(db, 'kycProfiles', profileId));
      if (profileDoc.exists()) {
        const profile = profileDoc.data() as KYCProfile;
        const updatedDocuments = profile.documents.map(doc => 
          doc.id === documentId 
            ? { 
                ...doc, 
                status, 
                verifiedAt: new Date(),
                metadata: result ? {
                  confidence: result.confidence,
                  quality: result.data.qualityScore || 0,
                  faceMatch: result.data.faceMatch,
                  livenessCheck: result.data.livenessCheck,
                } : doc.metadata
              }
            : doc
        );
        
        await updateDoc(doc(db, 'kycProfiles', profileId), {
          documents: updatedDocuments,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      throw error;
    }
  }

  // Complete KYC step
  async completeKYCStep(profileId: string, stepId: string): Promise<void> {
    try {
      const profileDoc = await getDoc(doc(db, 'kycProfiles', profileId));
      if (profileDoc.exists()) {
        const profile = profileDoc.data() as KYCProfile;
        const updatedSteps = profile.verificationSteps.map(step => 
          step.id === stepId 
            ? { ...step, status: 'completed', completedAt: new Date() }
            : step
        );
        
        await updateDoc(doc(db, 'kycProfiles', profileId), {
          verificationSteps: updatedSteps,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error completing KYC step:', error);
      throw error;
    }
  }

  // Run compliance checks
  async runComplianceChecks(profileId: string): Promise<ComplianceCheck[]> {
    try {
      const profileDoc = await getDoc(doc(db, 'kycProfiles', profileId));
      if (!profileDoc.exists()) {
        throw new Error('KYC profile not found');
      }

      const profile = profileDoc.data() as KYCProfile;
      const complianceChecks: ComplianceCheck[] = [];

      // AML Check
      const amlCheck = await this.runAMLCheck(profile);
      complianceChecks.push(amlCheck);

      // Sanctions Check
      const sanctionsCheck = await this.runSanctionsCheck(profile);
      complianceChecks.push(sanctionsCheck);

      // PEP Check
      const pepCheck = await this.runPEPCheck(profile);
      complianceChecks.push(pepCheck);

      // Adverse Media Check
      const adverseMediaCheck = await this.runAdverseMediaCheck(profile);
      complianceChecks.push(adverseMediaCheck);

      // Update profile with compliance checks
      await updateDoc(doc(db, 'kycProfiles', profileId), {
        complianceChecks: complianceChecks,
        updatedAt: serverTimestamp(),
      });

      return complianceChecks;
    } catch (error) {
      console.error('Error running compliance checks:', error);
      throw error;
    }
  }

  // Run AML check
  private async runAMLCheck(profile: KYCProfile): Promise<ComplianceCheck> {
    // Mock AML check - in real app, this would call AML service
    const amlCheck: ComplianceCheck = {
      id: 'aml_' + Date.now(),
      type: 'aml',
      status: 'passed',
      score: 95,
      details: 'No AML matches found',
      checkedAt: new Date(),
      provider: 'Smile ID',
      reference: 'AML_' + Date.now(),
      riskLevel: 'low',
      flags: [],
      recommendations: ['Continue monitoring'],
    };

    return amlCheck;
  }

  // Run sanctions check
  private async runSanctionsCheck(profile: KYCProfile): Promise<ComplianceCheck> {
    // Mock sanctions check - in real app, this would call sanctions service
    const sanctionsCheck: ComplianceCheck = {
      id: 'sanctions_' + Date.now(),
      type: 'sanctions',
      status: 'passed',
      score: 98,
      details: 'No sanctions matches found',
      checkedAt: new Date(),
      provider: 'Smile ID',
      reference: 'SANCTIONS_' + Date.now(),
      riskLevel: 'low',
      flags: [],
      recommendations: ['Continue monitoring'],
    };

    return sanctionsCheck;
  }

  // Run PEP check
  private async runPEPCheck(profile: KYCProfile): Promise<ComplianceCheck> {
    // Mock PEP check - in real app, this would call PEP service
    const pepCheck: ComplianceCheck = {
      id: 'pep_' + Date.now(),
      type: 'pep',
      status: profile.personalInfo.pepStatus ? 'warning' : 'passed',
      score: profile.personalInfo.pepStatus ? 60 : 95,
      details: profile.personalInfo.pepStatus ? 'PEP status detected' : 'No PEP matches found',
      checkedAt: new Date(),
      provider: 'Smile ID',
      reference: 'PEP_' + Date.now(),
      riskLevel: profile.personalInfo.pepStatus ? 'high' : 'low',
      flags: profile.personalInfo.pepStatus ? ['PEP'] : [],
      recommendations: profile.personalInfo.pepStatus ? ['Enhanced due diligence required'] : ['Continue monitoring'],
    };

    return pepCheck;
  }

  // Run adverse media check
  private async runAdverseMediaCheck(profile: KYCProfile): Promise<ComplianceCheck> {
    // Mock adverse media check - in real app, this would call adverse media service
    const adverseMediaCheck: ComplianceCheck = {
      id: 'adverse_media_' + Date.now(),
      type: 'adverse_media',
      status: 'passed',
      score: 92,
      details: 'No adverse media matches found',
      checkedAt: new Date(),
      provider: 'Smile ID',
      reference: 'ADVERSE_MEDIA_' + Date.now(),
      riskLevel: 'low',
      flags: [],
      recommendations: ['Continue monitoring'],
    };

    return adverseMediaCheck;
  }

  // Calculate risk score
  async calculateRiskScore(profileId: string): Promise<{ score: number; level: 'low' | 'medium' | 'high' }> {
    try {
      const profileDoc = await getDoc(doc(db, 'kycProfiles', profileId));
      if (!profileDoc.exists()) {
        throw new Error('KYC profile not found');
      }

      const profile = profileDoc.data() as KYCProfile;
      let riskScore = 0;

      // Base score
      riskScore += 20;

      // PEP status
      if (profile.personalInfo.pepStatus) {
        riskScore += 40;
      }

      // Compliance checks
      const failedChecks = profile.complianceChecks.filter(check => check.status === 'failed').length;
      riskScore += failedChecks * 20;

      // Document verification
      const verifiedDocuments = profile.documents.filter(doc => doc.status === 'verified').length;
      const totalRequiredDocuments = profile.documents.filter(doc => doc.isRequired).length;
      const documentVerificationRate = verifiedDocuments / totalRequiredDocuments;
      riskScore += (1 - documentVerificationRate) * 30;

      // Address verification
      if (profile.addressInfo.addressVerificationStatus === 'rejected') {
        riskScore += 25;
      }

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high';
      if (riskScore <= 30) {
        riskLevel = 'low';
      } else if (riskScore <= 60) {
        riskLevel = 'medium';
      } else {
        riskLevel = 'high';
      }

      // Update profile with risk score
      await updateDoc(doc(db, 'kycProfiles', profileId), {
        riskScore: Math.min(riskScore, 100),
        riskLevel: riskLevel,
        updatedAt: serverTimestamp(),
      });

      return { score: Math.min(riskScore, 100), level: riskLevel };
    } catch (error) {
      console.error('Error calculating risk score:', error);
      throw error;
    }
  }

  // Get KYC levels
  getKYCLevels() {
    return KYC_LEVELS;
  }

  // Get KYC steps
  getKYCSteps() {
    return KYC_STEPS;
  }

  // Get document types
  getDocumentTypes() {
    return DOCUMENT_TYPES;
  }

  // Check if user is KYC verified
  async isKYCVerified(userId: string): Promise<boolean> {
    try {
      const profile = await this.getKYCProfile(userId);
      return profile?.status === 'verified' || false;
    } catch (error) {
      console.error('Error checking KYC verification status:', error);
      return false;
    }
  }

  // Get KYC verification status
  async getKYCStatus(userId: string): Promise<{
    isVerified: boolean;
    level: string;
    status: string;
    progress: number;
    nextStep?: string;
  }> {
    try {
      const profile = await this.getKYCProfile(userId);
      
      if (!profile) {
        return {
          isVerified: false,
          level: 'none',
          status: 'not_started',
          progress: 0,
          nextStep: 'Start KYC verification',
        };
      }

      const completedSteps = profile.verificationSteps.filter(step => step.status === 'completed').length;
      const totalSteps = profile.verificationSteps.length;
      const progress = (completedSteps / totalSteps) * 100;

      const nextStep = profile.verificationSteps.find(step => step.status === 'pending')?.name;

      return {
        isVerified: profile.status === 'verified',
        level: profile.level,
        status: profile.status,
        progress: Math.round(progress),
        nextStep: nextStep || 'Complete verification',
      };
    } catch (error) {
      console.error('Error getting KYC status:', error);
      return {
        isVerified: false,
        level: 'none',
        status: 'error',
        progress: 0,
        nextStep: 'Contact support',
      };
    }
  }
}