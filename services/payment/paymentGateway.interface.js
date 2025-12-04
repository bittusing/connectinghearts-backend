/**
 * Payment Gateway Interface
 * Defines the contract that all payment gateways must implement
 */
class PaymentGatewayInterface {
  /**
   * Create a payment order
   * @param {Object} orderData - Order details
   * @param {Number} orderData.amount - Order amount
   * @param {String} orderData.currency - Currency code (INR, USD)
   * @param {String} orderData.orderId - Unique order ID
   * @param {Object} orderData.customer - Customer details
   * @param {Object} orderData.metadata - Additional metadata (membership_id, etc.)
   * @returns {Promise<Object>} - { orderId, sessionId, orderToken, keyId (for web) }
   */
  async createOrder(orderData) {
    throw new Error('createOrder method must be implemented');
  }

  /**
   * Verify payment status
   * @param {String} orderId - Order ID to verify
   * @returns {Promise<Object>} - { orderStatus, orderData, paymentDetails }
   */
  async verifyPayment(orderId) {
    throw new Error('verifyPayment method must be implemented');
  }

  /**
   * Get payment gateway environment
   * @returns {String} - 'SANDBOX' or 'PRODUCTION'
   */
  getEnvironment() {
    throw new Error('getEnvironment method must be implemented');
  }

  /**
   * Get gateway name
   * @returns {String} - Gateway name (e.g., 'RAZORPAY', 'CASHFREE')
   */
  getGatewayName() {
    throw new Error('getGatewayName method must be implemented');
  }
}

module.exports = PaymentGatewayInterface;


