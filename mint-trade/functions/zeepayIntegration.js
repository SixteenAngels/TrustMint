const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

const db = admin.firestore();

// Zeepay API Configuration
const ZEEPAY_BASE_URL = 'https://api.zeepaygh.com/v1';
const ZEEPAY_API_KEY = functions.config().zeepay?.api_key || 'your-zeepay-api-key';
const ZEEPAY_SECRET = functions.config().zeepay?.secret || 'your-zeepay-secret';

// Zeepay API Headers
const getZeepayHeaders = () => ({
  'Authorization': `Bearer ${ZEEPAY_API_KEY}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Initiate payment with Zeepay
exports.zeepayInitiatePayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, currency, channel, customerPhone, customerName, description, reference } = data;

  if (!amount || !currency || !channel || !customerPhone || !description || !reference) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  try {
    // Prepare Zeepay payment request
    const paymentData = {
      amount: amount * 100, // Convert to pesewas
      currency: currency,
      channel: channel,
      customer: {
        phone: customerPhone,
        name: customerName,
      },
      description: description,
      reference: reference,
      callback_url: `${functions.config().app?.webhook_url}/zeepay/callback`,
      return_url: `${functions.config().app?.return_url}/payment/success`,
    };

    // Call Zeepay API
    const response = await axios.post(
      `${ZEEPAY_BASE_URL}/payments/initiate`,
      paymentData,
      { headers: getZeepayHeaders() }
    );

    const zeepayResponse = response.data;

    // Store payment record in Firestore
    const paymentRef = db.collection('zeepayPayments').doc();
    await paymentRef.set({
      id: paymentRef.id,
      userId: context.auth.uid,
      zeepayTransactionId: zeepayResponse.transaction_id,
      reference: reference,
      amount: amount,
      currency: currency,
      channel: channel,
      customerPhone: customerPhone,
      customerName: customerName,
      description: description,
      status: 'pending',
      zeepayResponse: zeepayResponse,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      transactionId: zeepayResponse.transaction_id,
      reference: reference,
      status: 'pending',
      message: 'Payment initiated successfully',
      paymentUrl: zeepayResponse.payment_url,
      qrCode: zeepayResponse.qr_code,
    };
  } catch (error) {
    console.error('Error initiating Zeepay payment:', error);
    
    if (error.response) {
      console.error('Zeepay API Error:', error.response.data);
      throw new functions.https.HttpsError('internal', `Payment failed: ${error.response.data.message || 'Unknown error'}`);
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to initiate payment');
  }
});

// Verify payment status
exports.zeepayVerifyPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { transactionId } = data;

  if (!transactionId) {
    throw new functions.https.HttpsError('invalid-argument', 'Transaction ID is required');
  }

  try {
    // Get payment record from Firestore
    const paymentQuery = await db.collection('zeepayPayments')
      .where('zeepayTransactionId', '==', transactionId)
      .where('userId', '==', context.auth.uid)
      .limit(1)
      .get();

    if (paymentQuery.empty) {
      throw new functions.https.HttpsError('not-found', 'Payment not found');
    }

    const paymentDoc = paymentQuery.docs[0];
    const paymentData = paymentDoc.data();

    // Call Zeepay API to verify payment
    const response = await axios.get(
      `${ZEEPAY_BASE_URL}/payments/${transactionId}/status`,
      { headers: getZeepayHeaders() }
    );

    const verificationResponse = response.data;
    const newStatus = verificationResponse.status === 'success' ? 'completed' : 'failed';

    // Update payment status in Firestore
    await paymentDoc.ref.update({
      status: newStatus,
      zeepayResponse: verificationResponse,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // If payment is completed, update wallet balance
    if (newStatus === 'completed') {
      await updateWalletBalance(context.auth.uid, paymentData.amount, 'add');
      
      // Create wallet transaction
      await createWalletTransaction({
        userId: context.auth.uid,
        type: 'deposit',
        category: getTransactionCategory(paymentData.channel),
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        reference: paymentData.reference,
        metadata: {
          zeepayTransactionId: transactionId,
          channel: paymentData.channel,
        },
      });
    }

    return {
      success: true,
      transactionId: transactionId,
      reference: paymentData.reference,
      status: newStatus,
      message: newStatus === 'completed' ? 'Payment successful' : 'Payment failed',
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new functions.https.HttpsError('internal', 'Failed to verify payment');
  }
});

// Webhook handler for Zeepay callbacks
exports.zeepayWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Verify webhook signature (implement proper signature verification)
    if (!verifyWebhookSignature(req.headers, webhookData)) {
      console.error('Invalid webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const { transaction_id, status, amount, currency, channel } = webhookData;

    // Find payment record
    const paymentQuery = await db.collection('zeepayPayments')
      .where('zeepayTransactionId', '==', transaction_id)
      .limit(1)
      .get();

    if (paymentQuery.empty) {
      console.error('Payment not found for webhook:', transaction_id);
      return res.status(404).send('Payment not found');
    }

    const paymentDoc = paymentQuery.docs[0];
    const paymentData = paymentDoc.data();
    const newStatus = status === 'success' ? 'completed' : 'failed';

    // Update payment status
    await paymentDoc.ref.update({
      status: newStatus,
      webhookData: webhookData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // If payment is completed, update wallet balance
    if (newStatus === 'completed') {
      await updateWalletBalance(paymentData.userId, paymentData.amount, 'add');
      
      // Create wallet transaction
      await createWalletTransaction({
        userId: paymentData.userId,
        type: 'deposit',
        category: getTransactionCategory(channel),
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        reference: paymentData.reference,
        metadata: {
          zeepayTransactionId: transaction_id,
          channel: channel,
        },
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal server error');
  }
});

// Helper functions
async function updateWalletBalance(userId, amount, operation) {
  const walletRef = db.collection('wallets').doc(userId);
  const walletDoc = await walletRef.get();

  if (!walletDoc.exists) {
    throw new Error('Wallet not found');
  }

  const currentBalance = walletDoc.data().balance || 0;
  const newBalance = operation === 'add' ? currentBalance + amount : currentBalance - amount;

  await walletRef.update({
    balance: newBalance,
    totalBalance: newBalance + (walletDoc.data().lockedBalance || 0),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function createWalletTransaction(transactionData) {
  const transactionRef = await db.collection('walletTransactions').add({
    ...transactionData,
    walletId: transactionData.userId,
    balanceBefore: 0, // Will be calculated
    balanceAfter: 0, // Will be calculated
    status: 'completed',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return transactionRef.id;
}

function getTransactionCategory(channel) {
  switch (channel) {
    case 'MTN':
    case 'VODAFONE':
    case 'AIRTELTIGO':
      return 'mobile_money';
    case 'CARD':
      return 'card_payment';
    case 'BANK':
      return 'bank_transfer';
    default:
      return 'other';
  }
}

function verifyWebhookSignature(headers, body) {
  // Implement proper signature verification
  // This is a simplified version - implement proper HMAC verification
  const signature = headers['x-zeepay-signature'];
  return signature && signature.length > 0;
}

// Get payment methods
exports.getPaymentMethods = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

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
});