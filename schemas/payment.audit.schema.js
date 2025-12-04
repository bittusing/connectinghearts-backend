const mongoose = require("mongoose");

const paymentAuditSchema = new mongoose.Schema({
    // Gateway-agnostic fields
    gateway_type: { type: String, default: 'RAZORPAY' }, // RAZORPAY, CASHFREE
    gateway_order_id: String, // Order ID from payment gateway
    order_id: String, // Internal order ID (receipt)
    order_amount: Number,
    order_currency: String,
    order_status: String,
    payment_session_id: String, // Session/Token ID
    
    // Customer details
    customer_details: Object,
    
    // Payment details (gateway-specific)
    payment_details: Object,
    
    // Raw gateway response for audit
    raw_response: Object,
    
    // Timestamp
    timeStamp: { type: Date, default: Date.now },
    
    // Legacy Cashfree fields (for backward compatibility)
    cf_order_id: Number
}, {
    timestamps: false // We use timeStamp field instead
});

const PaymentAudit = mongoose.model("payment_audit", paymentAuditSchema);
module.exports = PaymentAudit;
