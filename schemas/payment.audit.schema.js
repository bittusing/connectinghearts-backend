const mongoose = require("mongoose");

const paymentAuditSchema = new mongoose.Schema({
    cf_order_id:Number,
    customer_details:Object,
    order_amount:Number,
    order_currency:String,
    order_id:String,
    order_status:String,
    payment_session_id:String
});

const PaymentAudit = mongoose.model("payment_audit", paymentAuditSchema);
module.exports = PaymentAudit;
