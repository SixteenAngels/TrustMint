import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Role Management Functions

/**
 * Assign role to a user (Admin only)
 */
export const assignUserRole = functions.https.onCall(async (data, context) => {
  // Verify admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const adminDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const adminData = adminDoc.data();
  
  if (adminData?.role !== 'admin' && !adminData?.isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin privileges required');
  }

  const { userId, role } = data;
  
  if (!userId || !role) {
    throw new functions.https.HttpsError('invalid-argument', 'userId and role are required');
  }

  if (!['user', 'manager', 'admin'].includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid role');
  }

  const userRef = admin.firestore().doc(`users/${userId}`);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }

  const updateData: any = { role };
  if (role === 'admin') {
    updateData.isAdmin = true;
    updateData.isManager = false;
  } else if (role === 'manager') {
    updateData.isManager = true;
    updateData.isAdmin = false;
  } else {
    updateData.isAdmin = false;
    updateData.isManager = false;
  }

  await userRef.update(updateData);

  // Log the role change
  await admin.firestore().collection('adminLogs').add({
    action: 'assignRole',
    adminId: context.auth.uid,
    targetUserId: userId,
    newRole: role,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: `Role ${role} assigned to user ${userId}` };
});

/**
 * Get all users with role filtering (Admin and Manager)
 */
export const getUsersByRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const userData = userDoc.data();
  
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin === true;
  const isManager = userData?.role === 'manager' || userData?.isManager === true;

  if (!isAdmin && !isManager) {
    throw new functions.https.HttpsError('permission-denied', 'Admin or Manager privileges required');
  }

  const { role } = data;
  let query: admin.firestore.Query = admin.firestore().collection('users');

  if (role) {
    query = query.where('role', '==', role);
  }

  // Managers can only see limited user data (no financial info)
  const snapshot = await query.get();
  const users = snapshot.docs.map(doc => {
    const userData = doc.data();
    if (isManager && !isAdmin) {
      // Remove sensitive data for managers
      const { balance, ...safeData } = userData;
      return { id: doc.id, ...safeData };
    }
    return { id: doc.id, ...userData };
  });

  return { users };
});

/**
 * Create support ticket (Manager and Admin)
 */
export const createSupportTicket = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { subject, description, priority, userId } = data;

  if (!subject || !description) {
    throw new functions.https.HttpsError('invalid-argument', 'Subject and description are required');
  }

  const ticketRef = admin.firestore().collection('supportTickets').doc();
  await ticketRef.set({
    id: ticketRef.id,
    subject,
    description,
    priority: priority || 'medium',
    userId: userId || context.auth.uid,
    status: 'open',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, ticketId: ticketRef.id };
});

/**
 * Update support ticket status (Manager and Admin)
 */
export const updateSupportTicket = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const userData = userDoc.data();
  
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin === true;
  const isManager = userData?.role === 'manager' || userData?.isManager === true;

  if (!isAdmin && !isManager) {
    throw new functions.https.HttpsError('permission-denied', 'Manager or Admin privileges required');
  }

  const { ticketId, status, notes } = data;

  if (!ticketId || !status) {
    throw new functions.https.HttpsError('invalid-argument', 'ticketId and status are required');
  }

  const ticketRef = admin.firestore().doc(`supportTickets/${ticketId}`);
  const ticketDoc = await ticketRef.get();

  if (!ticketDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Ticket not found');
  }

  await ticketRef.update({
    status,
    notes: notes || ticketDoc.data()?.notes,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedBy: context.auth.uid,
  });

  return { success: true, message: 'Ticket updated successfully' };
});

/**
 * Get analytics data (Manager read-only, Admin full access)
 */
export const getAnalytics = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const userData = userDoc.data();
  
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin === true;
  const isManager = userData?.role === 'manager' || userData?.isManager === true;

  if (!isAdmin && !isManager) {
    throw new functions.https.HttpsError('permission-denied', 'Manager or Admin privileges required');
  }

  const { timeRange } = data || { timeRange: 'week' };

  // Get user stats
  const usersSnapshot = await admin.firestore().collection('users').get();
  const totalUsers = usersSnapshot.size;
  const activeUsers = usersSnapshot.docs.filter(doc => {
    const data = doc.data();
    return data.lastActive && new Date(data.lastActive.toDate()) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }).length;

  // Get trade stats (if admin, include financial data)
  const tradesSnapshot = await admin.firestore().collection('transactions')
    .where('status', '==', 'completed')
    .get();

  const totalTrades = tradesSnapshot.size;
  let tradeVolume = 0;
  
  if (isAdmin) {
    tradeVolume = tradesSnapshot.docs.reduce((sum, doc) => {
      const data = doc.data();
      return sum + (data.total || 0);
    }, 0);
  }

  return {
    totalUsers,
    activeUsers,
    totalTrades,
    tradeVolume: isAdmin ? tradeVolume : undefined, // Only admins see financial data
    timeRange,
  };
});

/**
 * Get all trades with filtering (Manager read-only, Admin full access)
 */
export const getTrades = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const userData = userDoc.data();
  
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin === true;
  const isManager = userData?.role === 'manager' || userData?.isManager === true;

  if (!isAdmin && !isManager) {
    throw new functions.https.HttpsError('permission-denied', 'Manager or Admin privileges required');
  }

  const { status } = data || {};
  let query: admin.firestore.Query = admin.firestore().collection('transactions');

  if (status) {
    query = query.where('status', '==', status);
  }

  const snapshot = await query.orderBy('createdAt', 'desc').limit(100).get();
  const trades = snapshot.docs.map(doc => {
    const tradeData = doc.data();
    // Managers don't see financial details
    if (isManager && !isAdmin) {
      const { total, fees, ...safeData } = tradeData;
      return { id: doc.id, ...safeData };
    }
    return { id: doc.id, ...tradeData };
  });

  return { trades };
});

/**
 * Flag a trade for review (Manager and Admin)
 */
export const flagTrade = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const userData = userDoc.data();
  
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin === true;
  const isManager = userData?.role === 'manager' || userData?.isManager === true;

  if (!isAdmin && !isManager) {
    throw new functions.https.HttpsError('permission-denied', 'Manager or Admin privileges required');
  }

  const { tradeId, reason } = data;

  if (!tradeId) {
    throw new functions.https.HttpsError('invalid-argument', 'tradeId is required');
  }

  const tradeRef = admin.firestore().doc(`transactions/${tradeId}`);
  await tradeRef.update({
    flagged: true,
    flaggedBy: context.auth.uid,
    flaggedReason: reason || 'Flagged by manager',
    flaggedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: 'Trade flagged for review' };
});

/**
 * Approve or reject content (Manager and Admin)
 */
export const moderateContent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const userData = userDoc.data();
  
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin === true;
  const isManager = userData?.role === 'manager' || userData?.isManager === true;

  if (!isAdmin && !isManager) {
    throw new functions.https.HttpsError('permission-denied', 'Manager or Admin privileges required');
  }

  const { contentId, action, reason } = data; // action: 'approve' | 'reject'

  if (!contentId || !action) {
    throw new functions.https.HttpsError('invalid-argument', 'contentId and action are required');
  }

  const contentRef = admin.firestore().doc(`content/${contentId}`);
  await contentRef.update({
    status: action === 'approve' ? 'approved' : 'rejected',
    moderatedBy: context.auth.uid,
    moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
    moderationReason: reason,
  });

  return { success: true, message: `Content ${action}d successfully` };
});

/**
 * Create announcement (Manager creates, Admin approves)
 */
export const createAnnouncement = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const userData = userDoc.data();
  
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin === true;
  const isManager = userData?.role === 'manager' || userData?.isManager === true;

  if (!isAdmin && !isManager) {
    throw new functions.https.HttpsError('permission-denied', 'Manager or Admin privileges required');
  }

  const { title, message, priority } = data;

  if (!title || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'title and message are required');
  }

  const announcementRef = admin.firestore().collection('announcements').doc();
  await announcementRef.set({
    id: announcementRef.id,
    title,
    message,
    priority: priority || 'medium',
    status: isAdmin ? 'active' : 'pending', // Managers need admin approval
    createdBy: context.auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, announcementId: announcementRef.id, requiresApproval: !isAdmin };
});

/**
 * Flag user for review (Manager can flag, Admin can suspend/ban)
 */
export const flagUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const userData = userDoc.data();
  
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin === true;
  const isManager = userData?.role === 'manager' || userData?.isManager === true;

  if (!isAdmin && !isManager) {
    throw new functions.https.HttpsError('permission-denied', 'Manager or Admin privileges required');
  }

  const { userId, reason } = data;

  if (!userId || !reason) {
    throw new functions.https.HttpsError('invalid-argument', 'userId and reason are required');
  }

  const targetUserRef = admin.firestore().doc(`users/${userId}`);
  await targetUserRef.update({
    flagged: true,
    flaggedBy: context.auth.uid,
    flaggedReason: reason,
    flaggedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Log the action
  await admin.firestore().collection('adminLogs').add({
    action: 'flagUser',
    performedBy: context.auth.uid,
    targetUserId: userId,
    reason,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: 'User flagged for review' };
});

/**
 * Suspend or ban user (Admin only)
 */
export const suspendUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const userData = userDoc.data();
  
  if (userData?.role !== 'admin' && !userData?.isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin privileges required');
  }

  const { userId, action, reason } = data; // action: 'suspend' | 'ban' | 'unsuspend'

  if (!userId || !action) {
    throw new functions.https.HttpsError('invalid-argument', 'userId and action are required');
  }

  const targetUserRef = admin.firestore().doc(`users/${userId}`);
  const updateData: any = {
    status: action === 'ban' ? 'banned' : action === 'suspend' ? 'suspended' : 'active',
    updatedBy: context.auth.uid,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (reason) {
    updateData.suspensionReason = reason;
  }

  await targetUserRef.update(updateData);

  // Log the action
  await admin.firestore().collection('adminLogs').add({
    action: 'suspendUser',
    adminId: context.auth.uid,
    targetUserId: userId,
    actionType: action,
    reason,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: `User ${action}ed successfully` };
});

/**
 * Get system activity logs (Manager read-only, Admin full access)
 */
export const getActivityLogs = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const userData = userDoc.data();
  
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin === true;
  const isManager = userData?.role === 'manager' || userData?.isManager === true;

  if (!isAdmin && !isManager) {
    throw new functions.https.HttpsError('permission-denied', 'Manager or Admin privileges required');
  }

  const { limit = 50, type } = data;
  let query: admin.firestore.Query = admin.firestore().collection('activityLogs');

  if (type) {
    query = query.where('type', '==', type);
  }

  const snapshot = await query.orderBy('timestamp', 'desc').limit(limit).get();
  const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return { logs };
});

// ============================================
// TRADE EXECUTION FUNCTIONS
// ============================================

/**
 * Execute a trade order (validates and executes trades)
 */
export const executeTrade = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { orderId, userId, symbol, type, quantity, price } = data;

  if (!orderId || !userId || !symbol || !type || !quantity) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  // Verify user owns the order
  if (userId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Cannot execute trade for another user');
  }

  // Get user balance
  const userDoc = await admin.firestore().doc(`users/${userId}`).get();
  const userData = userDoc.data();
  const balance = userData?.balance || 0;

  // Get current stock price (mock if no API key)
  const stockDoc = await admin.firestore().doc(`stocks/${symbol}`).get();
  const stockData = stockDoc.data();
  const currentPrice = stockData?.price || price || 1.0;

  // Calculate total cost
  const totalCost = quantity * currentPrice;
  const fees = totalCost * 0.001; // 0.1% fee
  const totalWithFees = totalCost + fees;

  // Validate buy order
  if (type === 'buy' && balance < totalWithFees) {
    throw new functions.https.HttpsError('failed-precondition', 'Insufficient balance');
  }

  // Execute trade
  const tradeRef = admin.firestore().collection('transactions').doc();
  const tradeData = {
    id: tradeRef.id,
    userId,
    orderId,
    symbol,
    type,
    quantity,
    price: currentPrice,
    total: totalCost,
    fees,
    status: 'completed',
    executedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await tradeRef.set(tradeData);

  // Update user balance
  const newBalance = type === 'buy' 
    ? balance - totalWithFees 
    : balance + totalCost - fees;

  await admin.firestore().doc(`users/${userId}`).update({
    balance: newBalance,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Update order status
  await admin.firestore().doc(`orders/${orderId}`).update({
    status: 'completed',
    filledQuantity: quantity,
    averageFillPrice: currentPrice,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, tradeId: tradeRef.id, balance: newBalance };
});

// ============================================
// PAYMENT PROCESSING FUNCTIONS
// ============================================

/**
 * Initiate Flutterwave payment
 */
export const flutterwaveInitiatePayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, currency } = data;
  const FLUTTERWAVE_SECRET_KEY = functions.config().flutterwave?.secret_key;

  if (!amount || !currency) {
    throw new functions.https.HttpsError('invalid-argument', 'Amount and currency are required');
  }

  // Mock response if no API key
  if (!FLUTTERWAVE_SECRET_KEY) {
    return {
      success: true,
      paymentUrl: 'https://flutterwave.com/mock-payment',
      transactionId: `FLW_${Date.now()}`,
      status: 'pending',
      message: 'Mock payment initiated (API key not configured)',
    };
  }

  // Real Flutterwave integration would go here
  // const axios = require('axios');
  // const response = await axios.post('https://api.flutterwave.com/v3/payments', {...});

  return {
    success: true,
    paymentUrl: 'https://flutterwave.com/pay',
    transactionId: `FLW_${Date.now()}`,
    status: 'pending',
  };
});

/**
 * Create Stripe payment intent
 */
export const stripeCreatePaymentIntent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, currency } = data;
  const STRIPE_SECRET_KEY = functions.config().stripe?.secret_key;

  if (!amount || !currency) {
    throw new functions.https.HttpsError('invalid-argument', 'Amount and currency are required');
  }

  // Mock response if no API key
  if (!STRIPE_SECRET_KEY) {
    return {
      success: true,
      clientSecret: `pi_mock_${Date.now()}`,
      paymentIntentId: `pi_${Date.now()}`,
      message: 'Mock payment intent created (API key not configured)',
    };
  }

  return {
    success: true,
    clientSecret: `pi_${Date.now()}`,
    paymentIntentId: `pi_${Date.now()}`,
  };
});

/**
 * Process MTN Mobile Money payment
 */
export const mtnMobileMoneyPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, phone } = data;
  const MTN_MOMO_API_KEY = functions.config().mtn?.api_key;

  if (!amount || !phone) {
    throw new functions.https.HttpsError('invalid-argument', 'Amount and phone are required');
  }

  // Mock response if no API key
  if (!MTN_MOMO_API_KEY) {
    return {
      success: true,
      transactionId: `MTN_${Date.now()}`,
      status: 'pending',
      message: 'Mock MTN Mobile Money payment initiated (API key not configured)',
    };
  }

  return {
    success: true,
    transactionId: `MTN_${Date.now()}`,
    status: 'pending',
  };
});

/**
 * Process Vodafone Cash payment
 */
export const vodafoneCashPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, phone } = data;
  const VODAFONE_API_KEY = functions.config().vodafone?.api_key;

  if (!amount || !phone) {
    throw new functions.https.HttpsError('invalid-argument', 'Amount and phone are required');
  }

  // Mock response if no API key
  if (!VODAFONE_API_KEY) {
    return {
      success: true,
      transactionId: `VOD_${Date.now()}`,
      status: 'pending',
      message: 'Mock Vodafone Cash payment initiated (API key not configured)',
    };
  }

  return {
    success: true,
    transactionId: `VOD_${Date.now()}`,
    status: 'pending',
  };
});

/**
 * Process AirtelTigo Money payment
 */
export const airteltigoMoneyPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, phone } = data;
  const AIRTELTIGO_API_KEY = functions.config().airteltigo?.api_key;

  if (!amount || !phone) {
    throw new functions.https.HttpsError('invalid-argument', 'Amount and phone are required');
  }

  // Mock response if no API key
  if (!AIRTELTIGO_API_KEY) {
    return {
      success: true,
      transactionId: `AT_${Date.now()}`,
      status: 'pending',
      message: 'Mock AirtelTigo Money payment initiated (API key not configured)',
    };
  }

  return {
    success: true,
    transactionId: `AT_${Date.now()}`,
    status: 'pending',
  };
});

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

/**
 * Send push notification via FCM
 */
export const sendPushNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, title, body, data: notificationData } = data;
  const FCM_SERVER_KEY = functions.config().fcm?.server_key;

  if (!userId || !title || !body) {
    throw new functions.https.HttpsError('invalid-argument', 'userId, title, and body are required');
  }

  // Get user's device tokens
  const devicesSnapshot = await admin.firestore()
    .collection('user_devices')
    .where('userId', '==', userId)
    .get();

  if (devicesSnapshot.empty) {
    return { success: false, message: 'No device tokens found for user' };
  }

  const tokens = devicesSnapshot.docs.map(doc => doc.data().token);

  // Mock response if no API key
  if (!FCM_SERVER_KEY) {
    // Store notification in Firestore
    await admin.firestore().collection('notifications').add({
      userId,
      title,
      body,
      data: notificationData,
      type: 'push',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Mock push notification sent (FCM key not configured)',
      tokensCount: tokens.length,
    };
  }

  // Real FCM integration would go here
  // const messaging = admin.messaging();
  // await messaging.sendToDevice(tokens, { notification: { title, body }, data: notificationData });

  return { success: true, tokensCount: tokens.length };
});

/**
 * Send email notification
 */
export const sendEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { to, subject, html, text } = data;
  const SENDGRID_API_KEY = functions.config().sendgrid?.api_key;

  if (!to || !subject || (!html && !text)) {
    throw new functions.https.HttpsError('invalid-argument', 'to, subject, and content are required');
  }

  // Mock response if no API key
  if (!SENDGRID_API_KEY) {
    // Store email in Firestore for logging
    await admin.firestore().collection('email_logs').add({
      to,
      subject,
      html,
      text,
      status: 'sent',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Mock email sent (SendGrid key not configured)',
    };
  }

  // Real SendGrid integration would go here
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(SENDGRID_API_KEY);
  // await sgMail.send({ to, from: 'noreply@trustmint.com', subject, html, text });

  return { success: true };
});

/**
 * Send SMS notification
 */
export const sendSMS = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { to, message } = data;
  const TWILIO_ACCOUNT_SID = functions.config().twilio?.account_sid;
  const TWILIO_AUTH_TOKEN = functions.config().twilio?.auth_token;

  if (!to || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'to and message are required');
  }

  // Mock response if no API key
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    // Store SMS in Firestore for logging
    await admin.firestore().collection('sms_logs').add({
      to,
      message,
      status: 'sent',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Mock SMS sent (Twilio keys not configured)',
    };
  }

  // Real Twilio integration would go here
  // const twilio = require('twilio');
  // const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  // await client.messages.create({ to, from: '+1234567890', body: message });

  return { success: true };
});

// ============================================
// MARKET DATA FUNCTIONS
// ============================================

/**
 * Fetch market data from external APIs
 */
export const fetchMarketData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { symbol } = data;
  const TWELVE_DATA_API_KEY = functions.config().twelvedata?.api_key;
  const ALPHA_VANTAGE_API_KEY = functions.config().alphavantage?.api_key;

  if (!symbol) {
    throw new functions.https.HttpsError('invalid-argument', 'Symbol is required');
  }

  // Mock response if no API keys
  if (!TWELVE_DATA_API_KEY && !ALPHA_VANTAGE_API_KEY) {
    return {
      success: true,
      symbol,
      price: Math.random() * 100 + 10,
      change: (Math.random() - 0.5) * 5,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 1000000),
      message: 'Mock market data (API keys not configured)',
    };
  }

  // Real API integration would go here
  // const axios = require('axios');
  // const response = await axios.get(`https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`);

  return {
    success: true,
    symbol,
    price: Math.random() * 100 + 10,
    change: (Math.random() - 0.5) * 5,
    changePercent: (Math.random() - 0.5) * 5,
    volume: Math.floor(Math.random() * 1000000),
  };
});

// ============================================
// KYC PROCESSING FUNCTIONS
// ============================================

/**
 * Process KYC verification
 */
export const processKYC = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, documentType, documentNumber } = data;
  const SMILE_ID_API_KEY = functions.config().smileid?.api_key;
  const JUMIO_API_KEY = functions.config().jumio?.api_key;

  if (!userId || !documentType || !documentNumber) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required KYC fields');
  }

  // Mock response if no API key
  if (!SMILE_ID_API_KEY && !JUMIO_API_KEY) {
    // Store KYC submission
    const kycRef = admin.firestore().collection('kyc_submissions').doc();
    await kycRef.set({
      id: kycRef.id,
      userId,
      documentType,
      documentNumber,
      status: 'pending',
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      kycId: kycRef.id,
      status: 'pending',
      message: 'Mock KYC submitted (API keys not configured)',
    };
  }

  // Real KYC integration would go here
  // const axios = require('axios');
  // const response = await axios.post('https://api.smileidentity.com/v1/kyc', {...});

  return {
    success: true,
    kycId: `KYC_${Date.now()}`,
    status: 'pending',
  };
});

// ============================================
// ANALYTICS FUNCTIONS
// ============================================

/**
 * Track analytics event
 */
export const trackAnalyticsEvent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventName, properties } = data;
  const GOOGLE_ANALYTICS_ID = functions.config().analytics?.ga_id;
  const MIXPANEL_TOKEN = functions.config().analytics?.mixpanel_token;

  if (!eventName) {
    throw new functions.https.HttpsError('invalid-argument', 'eventName is required');
  }

  // Store event in Firestore
  await admin.firestore().collection('analytics_events').add({
    userId: context.auth.uid,
    eventName,
    properties: properties || {},
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Mock response if no API keys
  if (!GOOGLE_ANALYTICS_ID && !MIXPANEL_TOKEN) {
    return {
      success: true,
      message: 'Event logged to Firestore (Analytics keys not configured)',
    };
  }

  // Real analytics integration would go here
  // const { MeasurementProtocol } = require('@google-analytics/measurement-protocol');
  // await MeasurementProtocol.send({...});

  return { success: true };
});

/**
 * Get business metrics
 */
export const getBusinessMetrics = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const userData = userDoc.data();
  
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin === true;

  if (!isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin privileges required');
  }

  const { timeRange = 'week' } = data;

  // Get metrics from Firestore
  const usersSnapshot = await admin.firestore().collection('users').get();
  const transactionsSnapshot = await admin.firestore()
    .collection('transactions')
    .where('status', '==', 'completed')
    .get();

  const totalUsers = usersSnapshot.size;
  const totalRevenue = transactionsSnapshot.docs.reduce((sum, doc) => {
    const data = doc.data();
    return sum + (data.fees || 0);
  }, 0);

  return {
    totalUsers,
    totalRevenue,
    totalTransactions: transactionsSnapshot.size,
    timeRange,
  };
});

// ============================================
// NEONDB BACKUP FUNCTIONS
// ============================================

/**
 * Sync a single document from Firestore to NeonDB
 */
export const syncToNeonDb = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Only admins can trigger manual syncs
  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const userData = userDoc.data();
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin === true;

  if (!isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin privileges required');
  }

  const { collection, documentId, data: documentData } = data;
  // Firebase Secrets are available as environment variables
  // Try: Firebase Secrets -> Firebase Config -> Environment Variable
  const NEON_DB_URL = 
    process.env.NEON_DB_URL ||
    functions.config().neondb?.url ||
    process.env.DATABASE_URL;

  if (!NEON_DB_URL) {
    return {
      success: false,
      error: 'NeonDB not configured',
    };
  }

  if (!collection || !documentId || !documentData) {
    throw new functions.https.HttpsError('invalid-argument', 'collection, documentId, and data are required');
  }

  try {
    // Import pg dynamically (only if NeonDB is configured)
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: NEON_DB_URL,
      ssl: { rejectUnauthorized: false },
    });

    // Create table if it doesn't exist
    const tableName = `firestore_${collection}`;
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert or update document
    await pool.query(
      `INSERT INTO ${tableName} (id, data, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) 
       DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [documentId, JSON.stringify(documentData)]
    );

    await pool.end();

    // Log sync
    await admin.firestore().collection('backup_logs').add({
      collection,
      documentId,
      status: 'success',
      syncedAt: admin.firestore.FieldValue.serverTimestamp(),
      syncedBy: context.auth.uid,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error syncing to NeonDB:', error);

    // Log error
    await admin.firestore().collection('backup_logs').add({
      collection,
      documentId,
      status: 'error',
      error: error.message,
      syncedAt: admin.firestore.FieldValue.serverTimestamp(),
      syncedBy: context.auth.uid,
    });

    return {
      success: false,
      error: error.message,
    };
  }
});

/**
 * Sync multiple documents in batch
 */
export const syncBatchToNeonDb = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const userData = userDoc.data();
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin === true;

  if (!isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin privileges required');
  }

  const { collection, documents } = data;
  const NEON_DB_URL = functions.config().neondb?.url || process.env.NEON_DB_URL;

  if (!NEON_DB_URL) {
    return {
      results: documents.map((doc: any) => ({
        collection,
        documentId: doc.id,
        synced: false,
        error: 'NeonDB not configured',
      })),
    };
  }

  if (!collection || !documents || !Array.isArray(documents)) {
    throw new functions.https.HttpsError('invalid-argument', 'collection and documents array are required');
  }

  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: NEON_DB_URL,
      ssl: { rejectUnauthorized: false },
    });

    const tableName = `firestore_${collection}`;
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const results = [];
    for (const doc of documents) {
      try {
        await pool.query(
          `INSERT INTO ${tableName} (id, data, updated_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (id) 
           DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
          [doc.id, JSON.stringify(doc.data)]
        );

        results.push({
          collection,
          documentId: doc.id,
          synced: true,
          syncedAt: new Date().toISOString(),
        });
      } catch (error: any) {
        results.push({
          collection,
          documentId: doc.id,
          synced: false,
          error: error.message,
        });
      }
    }

    await pool.end();

    return { results };
  } catch (error: any) {
    console.error('Error batch syncing to NeonDB:', error);
    return {
      results: documents.map((doc: any) => ({
        collection,
        documentId: doc.id,
        synced: false,
        error: error.message,
      })),
    };
  }
});

/**
 * Get sync status for a document
 */
export const getNeonDbSyncStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { collection, documentId } = data;
  const NEON_DB_URL = functions.config().neondb?.url || process.env.NEON_DB_URL;

  if (!NEON_DB_URL) {
    return { status: null };
  }

  if (!collection || !documentId) {
    throw new functions.https.HttpsError('invalid-argument', 'collection and documentId are required');
  }

  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: NEON_DB_URL,
      ssl: { rejectUnauthorized: false },
    });

    const tableName = `firestore_${collection}`;
    const result = await pool.query(
      `SELECT id, synced_at, updated_at FROM ${tableName} WHERE id = $1`,
      [documentId]
    );

    await pool.end();

    if (result.rows.length === 0) {
      return { status: null };
    }

    return {
      status: {
        collection,
        documentId,
        synced: true,
        syncedAt: result.rows[0].synced_at,
        updatedAt: result.rows[0].updated_at,
      },
    };
  } catch (error: any) {
    console.error('Error getting sync status:', error);
    return { status: null };
  }
});

/**
 * Sync entire collection to NeonDB
 */
export const syncCollectionToNeonDb = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const userData = userDoc.data();
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin === true;

  if (!isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin privileges required');
  }

  const { collection } = data;
  const NEON_DB_URL = functions.config().neondb?.url || process.env.NEON_DB_URL;

  if (!NEON_DB_URL) {
    return {
      success: false,
      synced: 0,
      failed: 0,
      errors: ['NeonDB not configured'],
    };
  }

  if (!collection) {
    throw new functions.https.HttpsError('invalid-argument', 'collection is required');
  }

  try {
    // Get all documents from Firestore
    const snapshot = await admin.firestore().collection(collection).get();
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data(),
    }));

    // Sync batch
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: NEON_DB_URL,
      ssl: { rejectUnauthorized: false },
    });

    const tableName = `firestore_${collection}`;
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const doc of documents) {
      try {
        await pool.query(
          `INSERT INTO ${tableName} (id, data, updated_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (id) 
           DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
          [doc.id, JSON.stringify(doc.data)]
        );
        synced++;
      } catch (error: any) {
        failed++;
        errors.push(`${doc.id}: ${error.message}`);
      }
    }

    await pool.end();

    return {
      success: true,
      synced,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    console.error('Error syncing collection:', error);
    return {
      success: false,
      synced: 0,
      failed: 0,
      errors: [error.message],
    };
  }
});

/**
 * Get backup statistics
 */
export const getNeonDbBackupStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const userData = userDoc.data();
  const isAdmin = userData?.role === 'admin' || userData?.isAdmin === true;

  if (!isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin privileges required');
  }

  const NEON_DB_URL = functions.config().neondb?.url || process.env.NEON_DB_URL;

  if (!NEON_DB_URL) {
    return {
      totalCollections: 0,
      totalDocuments: 0,
      syncEnabled: false,
    };
  }

  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: NEON_DB_URL,
      ssl: { rejectUnauthorized: false },
    });

    // Get all firestore_* tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE 'firestore_%'
    `);

    const collections = tablesResult.rows.map((row: any) => row.table_name);
    let totalDocuments = 0;

    for (const table of collections) {
      const countResult = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      totalDocuments += parseInt(countResult.rows[0].count);
    }

    // Get last sync time from backup_logs
    const lastSyncLog = await admin.firestore()
      .collection('backup_logs')
      .orderBy('syncedAt', 'desc')
      .limit(1)
      .get();

    await pool.end();

    return {
      totalCollections: collections.length,
      totalDocuments,
      lastSyncTime: lastSyncLog.empty
        ? undefined
        : lastSyncLog.docs[0].data().syncedAt?.toDate().toISOString(),
      syncEnabled: true,
    };
  } catch (error: any) {
    console.error('Error getting backup stats:', error);
    return {
      totalCollections: 0,
      totalDocuments: 0,
      syncEnabled: false,
    };
  }
});

/**
 * Firestore trigger: Auto-sync on document create/update
 */
export const onFirestoreWrite = functions.firestore
  .document('{collection}/{documentId}')
  .onWrite(async (change, context) => {
    const NEON_DB_URL = functions.config().neondb?.url || process.env.NEON_DB_URL;

    if (!NEON_DB_URL) {
      return null; // NeonDB not configured, skip sync
    }

    const collection = context.params.collection;
    const documentId = context.params.documentId;

    // Skip backup_logs collection to avoid infinite loop
    if (collection === 'backup_logs') {
      return null;
    }

    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: NEON_DB_URL,
        ssl: { rejectUnauthorized: false },
      });

      const tableName = `firestore_${collection}`;

      // Create table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id VARCHAR(255) PRIMARY KEY,
          data JSONB NOT NULL,
          synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      if (change.after.exists) {
        // Document created or updated
        const data = change.after.data();
        await pool.query(
          `INSERT INTO ${tableName} (id, data, updated_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (id) 
           DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
          [documentId, JSON.stringify(data)]
        );
      } else {
        // Document deleted - optionally keep in backup or mark as deleted
        // For now, we'll keep it (soft delete by adding deleted flag)
        await pool.query(
          `UPDATE ${tableName} 
           SET data = jsonb_set(data, '{deleted}', 'true'::jsonb), updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [documentId]
        );
      }

      await pool.end();

      // Log successful sync
      await admin.firestore().collection('backup_logs').add({
        collection,
        documentId,
        status: 'success',
        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        trigger: 'auto',
      });

      return null;
    } catch (error: any) {
      console.error('Error auto-syncing to NeonDB:', error);

      // Log error
      await admin.firestore().collection('backup_logs').add({
        collection,
        documentId,
        status: 'error',
        error: error.message,
        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        trigger: 'auto',
      });

      return null;
    }
  });

