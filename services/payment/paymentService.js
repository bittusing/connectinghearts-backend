const RazorpayGateway = require('./razorpayGateway');

/**
 * Payment Service Factory
 * Manages payment gateway instances and provides unified interface
 */
class PaymentService {
  constructor() {
    // Get gateway type from environment (default: RAZORPAY)
    const gatewayType = (process.env.PAYMENT_GATEWAY || 'RAZORPAY').toUpperCase();
    this.gateway = this.getGateway(gatewayType);
    console.log(`Payment Service initialized with gateway: ${gatewayType}`);
  }

  /**
   * Get payment gateway instance
   * @param {String} gatewayType - Gateway type (RAZORPAY, CASHFREE)
   * @returns {PaymentGatewayInterface} - Gateway instance
   */
  getGateway(gatewayType) {
    switch (gatewayType) {
      case 'RAZORPAY':
        return new RazorpayGateway();
      case 'CASHFREE':
        // For backward compatibility, you can add CashfreeGateway here
        // const CashfreeGateway = require('./cashfreeGateway');
        // return new CashfreeGateway();
        throw new Error('Cashfree gateway is deprecated. Please use RAZORPAY.');
      default:
        console.warn(`Unknown gateway type: ${gatewayType}. Defaulting to RAZORPAY.`);
        return new RazorpayGateway();
    }
  }

  /**
   * Create payment order
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>} - Order response
   */
  async createOrder(orderData) {
    return await this.gateway.createOrder(orderData);
  }

  /**
   * Verify payment
   * @param {String} orderId - Order ID
   * @returns {Promise<Object>} - Verification response
   */
  async verifyPayment(orderId) {
    return await this.gateway.verifyPayment(orderId);
  }

  /**
   * Get current gateway
   * @returns {PaymentGatewayInterface}
   */
  getCurrentGateway() {
    return this.gateway;
  }
}

// Export singleton instance
module.exports = new PaymentService();


