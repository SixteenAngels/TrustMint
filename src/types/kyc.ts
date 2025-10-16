// KYC Verification Types
export interface KYCProfile {
  id: string;
  userId: string;
  status: 'pending' | 'in_progress' | 'verified' | 'rejected' | 'expired';
  level: 'basic' | 'intermediate' | 'advanced' | 'premium';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  rejectionReason?: string;
  documents: KYCDocument[];
  verificationSteps: KYCStep[];
  personalInfo: PersonalInfo;
  addressInfo: AddressInfo;
  employmentInfo?: EmploymentInfo;
  financialInfo?: FinancialInfo;
  biometricData?: BiometricData;
  complianceChecks: ComplianceCheck[];
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  verificationMethod: 'smile_id' | 'manual' | 'hybrid';
  lastVerified?: Date;
  nextReview?: Date;
}

export interface KYCDocument {
  id: string;
  type: 'ghana_card' | 'passport' | 'drivers_license' | 'voters_id' | 'utility_bill' | 'bank_statement' | 'employment_letter' | 'other';
  name: string;
  documentNumber: string;
  issueDate: Date;
  expiryDate?: Date;
  issuingAuthority: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  verificationDate?: Date;
  rejectionReason?: string;
  frontImage?: string;
  backImage?: string;
  selfieImage?: string;
  documentImage?: string;
  isRequired: boolean;
  isExpired: boolean;
  uploadedAt: Date;
  verifiedAt?: Date;
  metadata?: {
    confidence?: number;
    quality?: number;
    ocrData?: any;
    faceMatch?: boolean;
    livenessCheck?: boolean;
  };
}

export interface KYCStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  isRequired: boolean;
  order: number;
  completedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  estimatedDuration: number; // in minutes
  instructions: string[];
  requirements: string[];
  tips: string[];
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  phoneNumber: string;
  email: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'other';
  occupation: string;
  employer?: string;
  annualIncome?: number;
  sourceOfFunds: string[];
  pepStatus: boolean; // Politically Exposed Person
  pepDetails?: string;
  taxId?: string;
  ssn?: string;
}

export interface AddressInfo {
  currentAddress: Address;
  previousAddresses: Address[];
  mailingAddress?: Address;
  addressVerificationStatus: 'pending' | 'verified' | 'rejected';
  addressVerificationDate?: Date;
  addressVerificationMethod: 'utility_bill' | 'bank_statement' | 'government_letter' | 'other';
}

export interface Address {
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isResidential: boolean;
  isBusiness: boolean;
  isMailing: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDate?: Date;
}

export interface EmploymentInfo {
  employerName: string;
  jobTitle: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'self_employed' | 'unemployed' | 'retired' | 'student';
  startDate: Date;
  endDate?: Date;
  monthlyIncome: number;
  annualIncome: number;
  employerAddress: Address;
  employerPhone: string;
  employerEmail: string;
  supervisorName?: string;
  supervisorPhone?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDate?: Date;
  verificationMethod: 'employment_letter' | 'pay_slip' | 'bank_statement' | 'other';
}

export interface FinancialInfo {
  bankAccounts: BankAccount[];
  creditCards: CreditCard[];
  investments: Investment[];
  loans: Loan[];
  monthlyExpenses: number;
  monthlyIncome: number;
  netWorth: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  financialGoals: string[];
  emergencyFund: number;
  debtToIncomeRatio: number;
  creditScore?: number;
  creditScoreDate?: Date;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'business' | 'other';
  routingNumber?: string;
  swiftCode?: string;
  currency: string;
  balance: number;
  isPrimary: boolean;
  isVerified: boolean;
  verificationDate?: Date;
  lastUpdated: Date;
}

export interface CreditCard {
  id: string;
  issuer: string;
  cardNumber: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';
  expiryDate: Date;
  creditLimit: number;
  availableCredit: number;
  isVerified: boolean;
  verificationDate?: Date;
  lastUpdated: Date;
}

export interface Investment {
  id: string;
  type: 'stocks' | 'bonds' | 'mutual_funds' | 'etfs' | 'real_estate' | 'crypto' | 'other';
  name: string;
  value: number;
  institution: string;
  isVerified: boolean;
  verificationDate?: Date;
  lastUpdated: Date;
}

export interface Loan {
  id: string;
  type: 'mortgage' | 'auto' | 'personal' | 'student' | 'business' | 'other';
  lender: string;
  principalAmount: number;
  remainingBalance: number;
  monthlyPayment: number;
  interestRate: number;
  isVerified: boolean;
  verificationDate?: Date;
  lastUpdated: Date;
}

export interface BiometricData {
  faceImage?: string;
  fingerprint?: string;
  voiceSample?: string;
  livenessScore?: number;
  faceMatchScore?: number;
  qualityScore?: number;
  isLivenessVerified: boolean;
  isFaceMatchVerified: boolean;
  verificationDate?: Date;
  metadata?: {
    faceCoordinates?: any;
    faceLandmarks?: any;
    qualityMetrics?: any;
  };
}

export interface ComplianceCheck {
  id: string;
  type: 'aml' | 'sanctions' | 'pep' | 'adverse_media' | 'credit_check' | 'identity_verification' | 'address_verification' | 'employment_verification';
  status: 'pending' | 'passed' | 'failed' | 'warning';
  score: number;
  details: string;
  checkedAt: Date;
  expiresAt?: Date;
  provider: string;
  reference: string;
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  recommendations: string[];
}

// Smile ID Integration Types
export interface SmileIDConfig {
  partnerId: string;
  apiKey: string;
  environment: 'sandbox' | 'production';
  baseUrl: string;
  webhookUrl: string;
  callbackUrl: string;
}

export interface SmileIDJob {
  id: string;
  userId: string;
  jobType: 'enhanced_kyc' | 'biometric_kyc' | 'document_verification' | 'smart_selfie_authentication';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  result?: SmileIDResult;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface SmileIDResult {
  jobId: string;
  code: string;
  message: string;
  success: boolean;
  quality: number, // Added quality property
  confidence: number;
  data: {
    idNumber?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
    photo?: string;
    signature?: string;
    fingerprint?: string;
    faceMatch?: boolean;
    livenessCheck?: boolean;
    documentVerification?: boolean;
    biometricVerification?: boolean;
    riskAssessment?: {
      score: number;
      level: string;
      factors: string[];
    };
    complianceChecks?: {
      aml: boolean;
      sanctions: boolean;
      pep: boolean;
      adverseMedia: boolean;
    };
  };
  metadata?: {
    processingTime: number;
    provider: string;
    version: string;
    timestamp: string;
  };
}

export interface SmileIDWebhook {
  id: string;
  jobId: string;
  event: 'job_completed' | 'job_failed' | 'job_cancelled';
  timestamp: Date;
  data: any;
  signature: string;
  verified: boolean;
}

// KYC Constants
export const KYC_LEVELS = [
  { id: 'basic', name: 'Basic', description: 'Basic identity verification', requirements: ['ghana_card', 'selfie'] },
  { id: 'intermediate', name: 'Intermediate', description: 'Enhanced verification with address', requirements: ['ghana_card', 'selfie', 'utility_bill'] },
  { id: 'advanced', name: 'Advanced', description: 'Full verification with employment', requirements: ['ghana_card', 'selfie', 'utility_bill', 'employment_letter'] },
  { id: 'premium', name: 'Premium', description: 'Complete verification with financial info', requirements: ['ghana_card', 'selfie', 'utility_bill', 'employment_letter', 'bank_statement'] },
];

export const KYC_STEPS = [
  {
    id: 'personal_info',
    name: 'Personal Information',
    description: 'Enter your personal details',
    isRequired: true,
    order: 1,
    estimatedDuration: 5,
    instructions: ['Fill in your personal information accurately', 'Ensure all details match your official documents'],
    requirements: ['First name', 'Last name', 'Date of birth', 'Phone number', 'Email address'],
    tips: ['Use your legal name as it appears on official documents', 'Double-check your phone number and email'],
  },
  {
    id: 'document_upload',
    name: 'Document Upload',
    description: 'Upload your Ghana Card',
    isRequired: true,
    order: 2,
    estimatedDuration: 10,
    instructions: ['Take clear photos of your Ghana Card', 'Ensure all text is readable', 'Avoid glare and shadows'],
    requirements: ['Ghana Card front image', 'Ghana Card back image'],
    tips: ['Use good lighting', 'Keep the document flat', 'Ensure the entire document is visible'],
  },
  {
    id: 'selfie_verification',
    name: 'Selfie Verification',
    description: 'Take a selfie for face matching',
    isRequired: true,
    order: 3,
    estimatedDuration: 5,
    instructions: ['Look directly at the camera', 'Ensure good lighting', 'Remove glasses and hats'],
    requirements: ['Clear selfie photo', 'Face matching verification'],
    tips: ['Use natural lighting', 'Look directly at the camera', 'Keep your face centered'],
  },
  {
    id: 'address_verification',
    name: 'Address Verification',
    description: 'Verify your current address',
    isRequired: true,
    order: 4,
    estimatedDuration: 8,
    instructions: ['Upload a utility bill or bank statement', 'Ensure the document is recent (within 3 months)', 'Your name and address must be clearly visible'],
    requirements: ['Utility bill or bank statement', 'Address verification'],
    tips: ['Use a recent document', 'Ensure your name and address are visible', 'Document should be in your name'],
  },
  {
    id: 'employment_verification',
    name: 'Employment Verification',
    description: 'Verify your employment status',
    isRequired: false,
    order: 5,
    estimatedDuration: 10,
    instructions: ['Upload employment letter or pay slip', 'Ensure the document is recent', 'Your name and employer details must be visible'],
    requirements: ['Employment letter or pay slip', 'Employment verification'],
    tips: ['Use a recent document', 'Ensure employer details are visible', 'Document should be official'],
  },
  {
    id: 'financial_verification',
    name: 'Financial Verification',
    description: 'Verify your financial information',
    isRequired: false,
    order: 6,
    estimatedDuration: 15,
    instructions: ['Upload bank statement or financial documents', 'Ensure the document is recent', 'Your name and account details must be visible'],
    requirements: ['Bank statement or financial documents', 'Financial verification'],
    tips: ['Use a recent document', 'Ensure account details are visible', 'Document should be official'],
  },
];

export const DOCUMENT_TYPES = [
  { id: 'ghana_card', name: 'Ghana Card', description: 'National ID Card', icon: '🆔', isRequired: true },
  { id: 'passport', name: 'Passport', description: 'International Passport', icon: '📘', isRequired: false },
  { id: 'drivers_license', name: 'Driver\'s License', description: 'Driving License', icon: '🚗', isRequired: false },
  { id: 'voters_id', name: 'Voter\'s ID', description: 'Voter Registration Card', icon: '🗳️', isRequired: false },
  { id: 'utility_bill', name: 'Utility Bill', description: 'Electricity, Water, or Internet Bill', icon: '⚡', isRequired: true },
  { id: 'bank_statement', name: 'Bank Statement', description: 'Bank Account Statement', icon: '🏦', isRequired: false },
  { id: 'employment_letter', name: 'Employment Letter', description: 'Letter from Employer', icon: '💼', isRequired: false },
  { id: 'other', name: 'Other', description: 'Other Official Document', icon: '📄', isRequired: false },
];

export const KYC_STATUS_COLORS = {
  pending: '#FFA500',
  in_progress: '#2196F3',
  verified: '#4CAF50',
  rejected: '#F44336',
  expired: '#9E9E9E',
};

export const RISK_LEVELS = [
  { id: 'low', name: 'Low Risk', color: '#4CAF50', description: 'Minimal risk profile' },
  { id: 'medium', name: 'Medium Risk', color: '#FF9800', description: 'Moderate risk profile' },
  { id: 'high', name: 'High Risk', color: '#F44336', description: 'High risk profile' },
];