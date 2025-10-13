const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

const db = admin.firestore();

// Generate virtual account number
exports.generateVirtualAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, userInfo } = data;

  try {
    // Generate account number (format: 1234567890)
    const accountNumber = generateAccountNumber();
    const bankCode = 'CALB'; // CalBank partner
    const bankName = 'CalBank';
    const accountName = `Mint Trade Account - ${userInfo.name}`;

    const virtualAccount = {
      accountNumber,
      bankCode,
      bankName,
      accountName,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Store virtual account
    await db.collection('virtualAccounts').doc(userId).set(virtualAccount);

    return virtualAccount;
  } catch (error) {
    console.error('Error generating virtual account:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate virtual account');
  }
});

// Create wallet for user
exports.createWallet = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, userInfo } = data;

  try {
    // Generate virtual account first
    const virtualAccount = await generateVirtualAccount(userId, userInfo);

    const wallet = {
      userId,
      accountNumber: virtualAccount.accountNumber,
      bankCode: virtualAccount.bankCode,
      accountName: virtualAccount.accountName,
      balance: 0,
      lockedBalance: 0,
      totalBalance: 0,
      currency: 'GHS',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Create wallet
    await db.collection('wallets').doc(userId).set(wallet);

    // Create default wallet settings
    const walletSettings = {
      userId,
      autoSaveEnabled: false,
      autoSavePercentage: 10,
      roundUpEnabled: false,
      roundUpAmount: 1,
      dailySpendLimit: 10000,
      monthlySpendLimit: 100000,
      transactionNotifications: true,
      lowBalanceAlert: true,
      lowBalanceThreshold: 100,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('walletSettings').doc(userId).set(walletSettings);

    return wallet;
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create wallet');
  }
});

// Send money (P2P transfer)
exports.sendMoney = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { senderId, recipientPhone, amount, description } = data;

  if (!senderId || !recipientPhone || !amount || amount <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid parameters');
  }

  try {
    // Get sender's wallet
    const senderWalletRef = db.collection('wallets').doc(senderId);
    const senderWalletDoc = await senderWalletRef.get();

    if (!senderWalletDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Sender wallet not found');
    }

    const senderWallet = senderWalletDoc.data();

    // Check sufficient balance
    if (senderWallet.balance < amount) {
      throw new functions.https.HttpsError('failed-precondition', 'Insufficient balance');
    }

    // Find recipient by phone
    const usersQuery = await db.collection('users')
      .where('phone', '==', recipientPhone)
      .limit(1)
      .get();

    if (usersQuery.empty) {
      throw new functions.https.HttpsError('not-found', 'Recipient not found');
    }

    const recipientId = usersQuery.docs[0].id;
    const recipientWalletRef = db.collection('wallets').doc(recipientId);

    // Create transfer record
    const transferRef = db.collection('p2pTransfers').doc();
    const transfer = {
      id: transferRef.id,
      senderId,
      recipientId,
      recipientPhone,
      amount,
      currency: 'GHS',
      description,
      status: 'pending',
      reference: generateTransactionReference(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await transferRef.set(transfer);

    // Update balances
    const batch = db.batch();

    // Deduct from sender
    batch.update(senderWalletRef, {
      balance: admin.firestore.FieldValue.increment(-amount),
      totalBalance: admin.firestore.FieldValue.increment(-amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Add to recipient
    batch.update(recipientWalletRef, {
      balance: admin.firestore.FieldValue.increment(amount),
      totalBalance: admin.firestore.FieldValue.increment(amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    // Create transaction records
    const transactionData = {
      walletId: senderId,
      userId: senderId,
      type: 'transfer_out',
      category: 'p2p',
      amount: -amount,
      currency: 'GHS',
      balanceBefore: senderWallet.balance,
      balanceAfter: senderWallet.balance - amount,
      description: `Sent to ${recipientPhone}`,
      reference: transfer.reference,
      status: 'completed',
      metadata: {
        recipientPhone,
        transferId: transfer.id,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('walletTransactions').add(transactionData);

    // Update transfer status
    await transferRef.update({
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return transfer;
  } catch (error) {
    console.error('Error sending money:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to send money');
  }
});

// Pay bill
exports.payBill = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, billType, provider, accountNumber, amount } = data;

  if (!userId || !billType || !provider || !accountNumber || !amount || amount <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid parameters');
  }

  try {
    // Get user's wallet
    const walletRef = db.collection('wallets').doc(userId);
    const walletDoc = await walletRef.get();

    if (!walletDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Wallet not found');
    }

    const wallet = walletDoc.data();

    // Check sufficient balance
    if (wallet.balance < amount) {
      throw new functions.https.HttpsError('failed-precondition', 'Insufficient balance');
    }

    // Create bill payment record
    const billPaymentRef = db.collection('billPayments').doc();
    const billPayment = {
      id: billPaymentRef.id,
      userId,
      walletId: userId,
      billType,
      provider,
      accountNumber,
      customerName: wallet.accountName,
      amount,
      currency: 'GHS',
      reference: generateTransactionReference(),
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await billPaymentRef.set(billPayment);

    // Simulate bill payment processing (in real app, integrate with bill payment API)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update wallet balance
    await walletRef.update({
      balance: admin.firestore.FieldValue.increment(-amount),
      totalBalance: admin.firestore.FieldValue.increment(-amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create transaction record
    const transactionData = {
      walletId: userId,
      userId,
      type: 'withdrawal',
      category: 'bill_payment',
      amount: -amount,
      currency: 'GHS',
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance - amount,
      description: `${billType} payment to ${provider}`,
      reference: billPayment.reference,
      status: 'completed',
      metadata: {
        billType,
        provider,
        accountNumber,
        billPaymentId: billPayment.id,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('walletTransactions').add(transactionData);

    // Update bill payment status
    await billPaymentRef.update({
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return billPayment;
  } catch (error) {
    console.error('Error paying bill:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to pay bill');
  }
});

// Get wallet analytics
exports.getWalletAnalytics = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, period } = data;

  try {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get transactions for the period
    const transactionsQuery = await db.collection('walletTransactions')
      .where('userId', '==', userId)
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(startDate))
      .get();

    const transactions = transactionsQuery.docs.map(doc => doc.data());

    // Calculate analytics
    const totalInflow = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOutflow = Math.abs(transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    const netFlow = totalInflow - totalOutflow;
    const transactionCount = transactions.length;
    const averageTransactionAmount = transactionCount > 0 ? (totalInflow + totalOutflow) / transactionCount : 0;

    // Calculate top categories
    const categoryTotals = {};
    transactions.forEach(t => {
      const category = t.category || 'other';
      categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(t.amount);
    });

    const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totalInflow,
      totalOutflow,
      netFlow,
      transactionCount,
      averageTransactionAmount,
      topCategories,
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  } catch (error) {
    console.error('Error getting wallet analytics:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get wallet analytics');
  }
});

// Helper functions
function generateAccountNumber() {
  // Generate 10-digit account number
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function generateTransactionReference() {
  // Generate transaction reference
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MT${timestamp.slice(-8)}${random}`;
}

async function generateVirtualAccount(userId, userInfo) {
  const accountNumber = generateAccountNumber();
  const bankCode = 'CALB';
  const bankName = 'CalBank';
  const accountName = `Mint Trade Account - ${userInfo.name}`;

  const virtualAccount = {
    accountNumber,
    bankCode,
    bankName,
    accountName,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection('virtualAccounts').doc(userId).set(virtualAccount);
  return virtualAccount;
}