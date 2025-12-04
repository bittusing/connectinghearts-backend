# Razorpay Integration - Quick Start Guide

## ✅ Implementation Status: COMPLETE

Razorpay has been fully integrated to replace Cashfree. The system is ready for testing.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```
(Razorpay package already added)

### 2. Environment Variables
Add to your `.env` file:

```env
PAYMENT_GATEWAY=RAZORPAY
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
IS_PROD=FALSE
```

**Get Test Keys:**
1. Go to https://dashboard.razorpay.com/app/keys
2. Switch to "Test Mode"
3. Copy Key ID and Key Secret

### 3. Test the Integration

**Create Order:**
```bash
GET /api/dashboard/buyMembership/:membershipId
Headers: Authorization: Bearer <token>
```

**Verify Payment:**
```bash
GET /api/dashboard/verifyPayment/:orderId
Headers: Authorization: Bearer <token>
```

## 📱 Frontend Integration

### Web (HTML/JavaScript)
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

<script>
  // 1. Get order from backend
  const order = await fetch('/api/dashboard/buyMembership/123', {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(r => r.json());

  // 2. Open Razorpay checkout
  const options = {
    key: order.keyId,
    amount: order.amount,
    currency: order.currency,
    name: "Connecting Hearts",
    order_id: order.orderId,
    handler: async function(response) {
      // 3. Verify payment
      await fetch(`/api/dashboard/verifyPayment/${response.razorpay_order_id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
    }
  };
  const razorpay = new Razorpay(options);
  razorpay.open();
</script>
```

### React Native
```bash
npm install react-native-razorpay
```

```javascript
import RazorpayCheckout from 'react-native-razorpay';

// Get order from backend
const order = await createOrder(membershipId);

// Open checkout
const response = await RazorpayCheckout.open({
  key: order.keyId,
  amount: order.amount,
  currency: order.currency,
  order_id: order.orderId,
  name: 'Connecting Hearts'
});

// Verify payment
await verifyPayment(order.orderId);
```

## 📁 Project Structure

```
backend/
├── services/
│   └── payment/
│       ├── paymentGateway.interface.js  # Gateway contract
│       ├── razorpayGateway.js           # Razorpay implementation
│       ├── paymentService.js            # Service factory
│       ├── RAZORPAY_INTEGRATION_GUIDE.md # Full guide
│       └── IMPLEMENTATION_SUMMARY.md    # Implementation details
├── api/
│   └── dashboardController/
│       └── dashboard.controller.js      # Updated controllers
└── schemas/
    └── payment.audit.schema.js          # Updated schema
```

## 🔄 What Changed

### Before (Cashfree):
- Direct Cashfree API calls in controller
- Cashfree-specific headers and URLs
- Cashfree response format

### After (Razorpay):
- Payment service abstraction layer
- Gateway-agnostic controller code
- Normalized response format
- Support for multiple gateways

## 📊 Database Schema

Payment audit now stores:
- `gateway_type`: 'RAZORPAY' or 'CASHFREE'
- `gateway_order_id`: Razorpay order ID
- `payment_details`: Structured payment info
- `raw_response`: Complete gateway response

## 🧪 Testing

### Test Cards:
- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- **3D Secure**: `4012 0010 3714 1112`

### Test Flow:
1. Create order → Get order ID and key ID
2. Open Razorpay checkout with test card
3. Complete payment
4. Verify payment → Membership activated

## 📚 Documentation

- **Full Integration Guide**: `services/payment/RAZORPAY_INTEGRATION_GUIDE.md`
- **Implementation Details**: `services/payment/IMPLEMENTATION_SUMMARY.md`
- **Razorpay Docs**: https://razorpay.com/docs/

## ⚠️ Important Notes

1. **Never expose `RAZORPAY_KEY_SECRET`** in frontend
2. Always verify payments on backend
3. Use test keys for development
4. Complete KYC before going to production

## 🆘 Troubleshooting

**"Invalid key_id"**
→ Check environment variables are set correctly

**Order creation fails**
→ Verify Razorpay dashboard for errors

**Payment not verifying**
→ Check order status in Razorpay dashboard

## ✨ Next Steps

1. ✅ Backend implementation complete
2. ⏳ Update frontend to use Razorpay Checkout
3. ⏳ Update mobile app with Razorpay SDK
4. ⏳ Test in sandbox environment
5. ⏳ Deploy to production after testing

---

**Ready to test!** 🎉


