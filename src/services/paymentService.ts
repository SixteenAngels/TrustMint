// Use compatibility layer for Expo (web SDK)
import { functions } from '../core/firebase/functionsAdapter';

const env = (name: string, fallback?: string) =>
  process.env[name] ??
  process.env[`EXPO_PUBLIC_${name}`] ??
  fallback;

// Payment Gateway API Keys (with placeholders)
const FLUTTERWAVE_PUBLIC_KEY = env('FLUTTERWAVE_PUBLIC_KEY') || 'your_flutterwave_public_key_here';
const FLUTTERWAVE_SECRET_KEY = env('FLUTTERWAVE_SECRET_KEY') || 'your_flutterwave_secret_key_here';
const STRIPE_PUBLIC_KEY = env('STRIPE_PUBLIC_KEY') || 'your_stripe_public_key_here';
const STRIPE_SECRET_KEY = env('STRIPE_SECRET_KEY') || 'your_stripe_secret_key_here';
const ZEEPAY_API_KEY = env('ZEEPAY_API_KEY') || 'your_zeepay_api_key_here';
const MTN_MOMO_API_KEY = env('MTN_MOMO_API_KEY') || 'your_mtn_momo_api_key_here';
const VODAFONE_CASH_API_KEY = env('VODAFONE_CASH_API_KEY') || 'your_vodafone_cash_api_key_here';
const AIRTELTIGO_MONEY_API_KEY = env('AIRTELTIGO_MONEY_API_KEY') || 'your_airteltigo_money_api_key_here';

// Zeepay Payment Types
export interface ZeepayPaymentRequest {
  amount: number;
  currency: 'GHS' | 'USD';
  channel: 'MTN' | 'VODAFONE' | 'AIRTELTIGO' | 'CARD' | 'BANK';
  customerPhone: string;
  customerName: string;
  description: string;
  reference: string;
  callbackUrl?: string;
}

export interface ZeepayPaymentResponse {
  success: boolean;
  transactionId: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  message: string;
  paymentUrl?: string;
  qrCode?: string;
}

export interface ZeepayWebhookData {
  transactionId: string;
  reference: string;
  status: 'completed' | 'failed';
  amount: number;
  currency: string;
  channel: string;
  timestamp: string;
  signature: string;
}

export interface PaymentMethod {
  id: string;
  type: 'mobile_money' | 'card' | 'bank_transfer';
  name: string;
  icon: string;
  isActive: boolean;
  fees: {
    percentage: number;
    fixed: number;
  };
}

export class PaymentService {
  private static instance: PaymentService;

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Get available payment methods
  getPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'mtn_momo',
        type: 'mobile_money',
        name: 'MTN Mobile Money',
        icon: '📱',
        isActive: true,
        fees: { percentage: 0.5, fixed: 0 },
      },
      {
        id: 'vodafone_momo',
        type: 'mobile_money',
        name: 'Vodafone Cash',
        icon: '📱',
        isActive: true,
        fees: { percentage: 0.5, fixed: 0 },
      },
      {
        id: 'airteltigo_momo',
        type: 'mobile_money',
        name: 'AirtelTigo Money',
        icon: '📱',
        isActive: true,
        fees: { percentage: 0.5, fixed: 0 },
      },
      {
        id: 'flutterwave',
        type: 'card',
        name: 'Flutterwave',
        icon: '💳',
        isActive: FLUTTERWAVE_PUBLIC_KEY && !FLUTTERWAVE_PUBLIC_KEY.includes('your_'),
        fees: { percentage: 1.4, fixed: 0 },
      },
      {
        id: 'stripe',
        type: 'card',
        name: 'Stripe',
        icon: '💳',
        isActive: STRIPE_PUBLIC_KEY && !STRIPE_PUBLIC_KEY.includes('your_'),
        fees: { percentage: 2.9, fixed: 0.3 },
      },
      {
        id: 'visa_mastercard',
        type: 'card',
        name: 'Visa/Mastercard',
        icon: '💳',
        isActive: true,
        fees: { percentage: 2.5, fixed: 5 },
      },
      {
        id: 'bank_transfer',
        type: 'bank_transfer',
        name: 'Bank Transfer',
        icon: '🏦',
        isActive: true,
        fees: { percentage: 0, fixed: 10 },
      },
    ];
  }

  // ============================================
  // Flutterwave Integration
  // ============================================

  async processFlutterwavePayment(
    amount: number,
    email: string,
    phone: string,
    name: string,
    currency: string = 'GHS'
  ): Promise<any> {
    if (!FLUTTERWAVE_PUBLIC_KEY || FLUTTERWAVE_PUBLIC_KEY.includes('your_')) {
      throw new Error('Flutterwave API key not configured');
    }

    try {
      const flutterwaveFunction = functions().httpsCallable('flutterwaveInitiatePayment');
      const result = await flutterwaveFunction({
        amount,
        email,
        phone,
        name,
        currency,
        publicKey: FLUTTERWAVE_PUBLIC_KEY,
      });
      return result.data;
    } catch (error) {
      console.error('Error processing Flutterwave payment:', error);
      throw error;
    }
  }

  // ============================================
  // Stripe Integration
  // ============================================

  async processStripePayment(
    amount: number,
    currency: string = 'usd',
    paymentMethodId: string,
    description?: string
  ): Promise<any> {
    if (!STRIPE_PUBLIC_KEY || STRIPE_PUBLIC_KEY.includes('your_')) {
      throw new Error('Stripe API key not configured');
    }

    try {
      const stripeFunction = functions().httpsCallable('stripeCreatePaymentIntent');
      const result = await stripeFunction({
        amount: Math.round(amount * 100), // Stripe uses cents
        currency,
        paymentMethodId,
        description,
      });
      return result.data;
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      throw error;
    }
  }

  // ============================================
  // Direct Mobile Money APIs
  // ============================================

  async processMTNMobileMoney(
    amount: number,
    phone: string,
    description: string
  ): Promise<any> {
    if (!MTN_MOMO_API_KEY || MTN_MOMO_API_KEY.includes('your_')) {
      // Fallback to Zeepay if MTN API not configured
      return this.processMobileMoneyPayment(amount, phone, 'MTN', description);
    }

    try {
      const mtnFunction = functions().httpsCallable('mtnMobileMoneyPayment');
      const result = await mtnFunction({
        amount,
        phone,
        description,
        apiKey: MTN_MOMO_API_KEY,
      });
      return result.data;
    } catch (error) {
      console.error('Error processing MTN Mobile Money:', error);
      throw error;
    }
  }

  async processVodafoneCash(
    amount: number,
    phone: string,
    description: string
  ): Promise<any> {
    if (!VODAFONE_CASH_API_KEY || VODAFONE_CASH_API_KEY.includes('your_')) {
      // Fallback to Zeepay if Vodafone API not configured
      return this.processMobileMoneyPayment(amount, phone, 'VODAFONE', description);
    }

    try {
      const vodafoneFunction = functions().httpsCallable('vodafoneCashPayment');
      const result = await vodafoneFunction({
        amount,
        phone,
        description,
        apiKey: VODAFONE_CASH_API_KEY,
      });
      return result.data;
    } catch (error) {
      console.error('Error processing Vodafone Cash:', error);
      throw error;
    }
  }

  async processAirtelTigoMoney(
    amount: number,
    phone: string,
    description: string
  ): Promise<any> {
    if (!AIRTELTIGO_MONEY_API_KEY || AIRTELTIGO_MONEY_API_KEY.includes('your_')) {
      // Fallback to Zeepay if AirtelTigo API not configured
      return this.processMobileMoneyPayment(amount, phone, 'AIRTELTIGO', description);
    }

    try {
      const airteltigoFunction = functions().httpsCallable('airteltigoMoneyPayment');
      const result = await airteltigoFunction({
        amount,
        phone,
        description,
        apiKey: AIRTELTIGO_MONEY_API_KEY,
      });
      return result.data;
    } catch (error) {
      console.error('Error processing AirtelTigo Money:', error);
      throw error;
    }
  }

  // Initiate payment
  async initiatePayment(paymentRequest: ZeepayPaymentRequest): Promise<ZeepayPaymentResponse> {
    try {
      const initiatePaymentFunction = functions().httpsCallable('zeepayInitiatePayment');
      const result = await initiatePaymentFunction(paymentRequest);
      
      return result.data as ZeepayPaymentResponse;
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  }

  // Verify payment status
  async verifyPayment(transactionId: string): Promise<ZeepayPaymentResponse> {
    try {
      const verifyPaymentFunction = functions().httpsCallable('zeepayVerifyPayment');
      const result = await verifyPaymentFunction({ transactionId });
      
      return result.data as ZeepayPaymentResponse;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Process mobile money payment
  async processMobileMoneyPayment(
    amount: number,
    phone: string,
    channel: 'MTN' | 'VODAFONE' | 'AIRTELTIGO',
    description: string
  ): Promise<ZeepayPaymentResponse> {
    const paymentRequest: ZeepayPaymentRequest = {
      amount,
      currency: 'GHS',
      channel,
      customerPhone: phone,
      customerName: 'Mint Trade User',
      description,
      reference: this.generateReference(),
    };

    return this.initiatePayment(paymentRequest);
  }

  // Process card payment
  async processCardPayment(
    amount: number,
    cardDetails: {
      number: string;
      expiryMonth: string;
      expiryYear: string;
      cvv: string;
      name: string;
    },
    description: string
  ): Promise<ZeepayPaymentResponse> {
    const paymentRequest: ZeepayPaymentRequest = {
      amount,
      currency: 'GHS',
      channel: 'CARD',
      customerPhone: '0000000000', // Not needed for card
      customerName: cardDetails.name,
      description,
      reference: this.generateReference(),
    };

    return this.initiatePayment(paymentRequest);
  }

  // Process bank transfer
  async processBankTransfer(
    amount: number,
    bankDetails: {
      accountNumber: string;
      bankCode: string;
      accountName: string;
    },
    description: string
  ): Promise<ZeepayPaymentResponse> {
    const paymentRequest: ZeepayPaymentRequest = {
      amount,
      currency: 'GHS',
      channel: 'BANK',
      customerPhone: '0000000000', // Not needed for bank transfer
      customerName: bankDetails.accountName,
      description,
      reference: this.generateReference(),
    };

    return this.initiatePayment(paymentRequest);
  }

  // Calculate fees
  calculateFees(amount: number, paymentMethod: PaymentMethod): number {
    const { percentage, fixed } = paymentMethod.fees;
    return (amount * percentage / 100) + fixed;
  }

  // Get total amount with fees
  getTotalAmount(amount: number, paymentMethod: PaymentMethod): number {
    return amount + this.calculateFees(amount, paymentMethod);
  }

  // Generate transaction reference
  private generateReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MT${timestamp.slice(-8)}${random}`;
  }

  // Get payment status text
  getPaymentStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Payment pending...';
      case 'completed':
        return 'Payment successful!';
      case 'failed':
        return 'Payment failed';
      default:
        return 'Unknown status';
    }
  }

  // Get payment status color
  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return '#F59E0B'; // Warning
      case 'completed':
        return '#10B981'; // Success
      case 'failed':
        return '#EF4444'; // Error
      default:
        return '#6B7280'; // Gray
    }
  }
}
