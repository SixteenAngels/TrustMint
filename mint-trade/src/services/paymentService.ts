import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase.config';

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

  // Initiate payment
  async initiatePayment(paymentRequest: ZeepayPaymentRequest): Promise<ZeepayPaymentResponse> {
    try {
      const initiatePaymentFunction = httpsCallable(functions, 'zeepayInitiatePayment');
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
      const verifyPaymentFunction = httpsCallable(functions, 'zeepayVerifyPayment');
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