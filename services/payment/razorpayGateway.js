const Razorpay = require('razorpay');
const axios = require('axios');
const PaymentGatewayInterface = require('./paymentGateway.interface');

/**
 * Razorpay Payment Gateway Implementation
 * Supports both Web and Mobile app integrations
 */
class RazorpayGateway extends PaymentGatewayInterface {
  constructor() {
    super();
    this.environment = process.env.IS_PROD === 'TRUE' ? 'PRODUCTION' : 'SANDBOX';
    
    // Initialize Razorpay instance
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Base URLs
    this.baseUrl = this.environment === 'PRODUCTION' 
      ? 'https://api.razorpay.com/v1'
      : 'https://api.razorpay.com/v1'; // Razorpay uses same URL, different keys for test/prod
  }

  /**
   * Create a payment order
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>} - Normalized response
   */
  async createOrder(orderData) {
    try {
      const { amount, currency, orderId, customer, metadata, notes } = orderData;

      // Razorpay expects amount in smallest currency unit (paise for INR, cents for USD)
      const amountInSmallestUnit = Math.round(amount * 100);

      // Prepare Razorpay order payload
      // Merge notes and metadata
      const mergedNotes = {
        ...(notes || {}),
        ...(metadata || {})
      };

      const razorpayOrderData = {
        amount: amountInSmallestUnit,
        currency: currency,
        receipt: orderId,
        notes: mergedNotes
      };

      console.log('Creating Razorpay order:', razorpayOrderData);

      // Create order using Razorpay SDK
      const razorpayOrder = await this.razorpay.orders.create(razorpayOrderData);

      console.log('Razorpay order created:', razorpayOrder.id);

      // For web integration, we need to return key_id for frontend
      // For mobile app, we return order details
      const response = {
        orderId: razorpayOrder.id,
        sessionId: razorpayOrder.id, // Razorpay uses order ID as session identifier
        orderToken: razorpayOrder.id,
        // Web-specific: Key ID for frontend Razorpay Checkout
        keyId: process.env.RAZORPAY_KEY_ID,
        // Additional Razorpay-specific data
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status,
        // For mobile app compatibility
        paymentEnvironment: this.environment,
        gateway: 'RAZORPAY'
      };

      return response;
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Verify payment status
   * @param {String} orderId - Razorpay order ID
   * @returns {Promise<Object>} - Normalized verification response
   */
  async verifyPayment(orderId) {
    try {
      console.log('Verifying Razorpay payment for order:', orderId);

      // Fetch order details from Razorpay
      const order = await this.razorpay.orders.fetch(orderId);

      // Fetch payments for this order
      const payments = await this.razorpay.orders.fetchPayments(orderId);

      // Normalize the response
      const normalizedResponse = {
        orderId: order.id,
        orderStatus: this.normalizeStatus(order.status),
        orderAmount: order.amount / 100, // Convert from paise to rupees
        orderCurrency: order.currency,
        receipt: order.receipt,
        notes: order.notes || {},
        // Payment details
        paymentDetails: payments.items && payments.items.length > 0 ? {
          paymentId: payments.items[0].id,
          paymentStatus: payments.items[0].status,
          paymentMethod: payments.items[0].method,
          amount: payments.items[0].amount / 100,
          currency: payments.items[0].currency,
          captured: payments.items[0].captured,
          createdAt: payments.items[0].created_at
        } : null,
        // Raw Razorpay response for audit
        rawResponse: {
          order: order,
          payments: payments
        }
      };

      return normalizedResponse;
    } catch (error) {
      console.error('Razorpay payment verification error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Normalize Razorpay status to common format
   * @param {String} razorpayStatus - Razorpay status
   * @returns {String} - Normalized status
   */
  normalizeStatus(razorpayStatus) {
    const statusMap = {
      'created': 'CREATED',
      'attempted': 'ATTEMPTED',
      'paid': 'PAID',
      'captured': 'PAID',
      'failed': 'FAILED',
      'cancelled': 'CANCELLED'
    };
    return statusMap[razorpayStatus?.toLowerCase()] || razorpayStatus?.toUpperCase() || 'UNKNOWN';
  }

  /**
   * Handle Razorpay errors
   * @param {Error} error - Error object
   * @returns {Error} - Formatted error
   */
  handleError(error) {
    let errorMessage = 'Payment gateway error occurred';
    let statusCode = 400;

    if (error.statusCode) {
      statusCode = error.statusCode;
    }

    if (error.error) {
      // Razorpay error format
      if (error.error.description) {
        errorMessage = error.error.description;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    const formattedError = new Error(errorMessage);
    formattedError.statusCode = statusCode;
    formattedError.originalError = error;
    return formattedError;
  }

  /**
   * Get environment
   * @returns {String}
   */
  getEnvironment() {
    return this.environment;
  }

  /**
   * Get gateway name
   * @returns {String}
   */
  getGatewayName() {
    return 'RAZORPAY';
  }
}

module.exports = RazorpayGateway;

