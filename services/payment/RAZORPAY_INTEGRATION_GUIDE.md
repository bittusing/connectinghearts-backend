# Razorpay Payment Integration Guide

## Overview
This guide explains how Razorpay payment gateway is integrated for both **Web** and **Mobile App** platforms.

## Architecture

The payment system uses an abstraction layer pattern:
- **Payment Service**: Unified interface for all payment operations
- **Razorpay Gateway**: Razorpay-specific implementation
- **Controller**: Business logic that uses the payment service

## Environment Variables

Add these to your `.env` file:

```env
# Payment Gateway Configuration
PAYMENT_GATEWAY=RAZORPAY

# Razorpay Credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Environment
IS_PROD=FALSE  # Set to TRUE for production
```

### Getting Razorpay Credentials

1. **Sandbox (Testing)**:
   - Go to https://dashboard.razorpay.com/app/keys
   - Use Test Mode keys

2. **Production**:
   - Complete KYC verification
   - Get Live Mode keys from dashboard

## API Endpoints

### 1. Create Payment Order
**Endpoint**: `GET /api/dashboard/buyMembership/:id`

**Description**: Creates a Razorpay order for membership purchase

**Parameters**:
- `id`: Membership plan ID (from `membershipDetails` schema)

**Response** (Web):
```json
{
  "orderId": "order_xxxxxxxxxxxxx",
  "sessionId": "order_xxxxxxxxxxxxx",
  "orderToken": "order_xxxxxxxxxxxxx",
  "keyId": "rzp_test_xxxxxxxxxxxxx",
  "amount": 10000,
  "currency": "INR",
  "paymentEnvironment": "SANDBOX",
  "gateway": "RAZORPAY",
  "receipt": "1234567890123"
}
```

**Response** (Mobile App):
```json
{
  "orderId": "order_xxxxxxxxxxxxx",
  "sessionId": "order_xxxxxxxxxxxxx",
  "orderToken": "order_xxxxxxxxxxxxx",
  "keyId": "rzp_test_xxxxxxxxxxxxx",
  "amount": 10000,
  "currency": "INR",
  "paymentEnvironment": "SANDBOX",
  "gateway": "RAZORPAY"
}
```

### 2. Verify Payment
**Endpoint**: `GET /api/dashboard/verifyPayment/:orderID`

**Description**: Verifies payment status and activates membership

**Parameters**:
- `orderID`: Razorpay order ID (from create order response)

**Response**:
```json
{
  "code": "CH200",
  "status": "success",
  "message": "Membership purchased successfully.",
  "orderId": "order_xxxxxxxxxxxxx",
  "paymentDetails": {
    "paymentId": "pay_xxxxxxxxxxxxx",
    "paymentStatus": "captured",
    "paymentMethod": "card",
    "amount": 100,
    "currency": "INR"
  }
}
```

---

## Web Integration (Frontend)

### Step 1: Include Razorpay Checkout Script

Add to your HTML:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Step 2: Create Payment Order (Backend Call)

```javascript
// Call your backend API
const response = await fetch(`/api/dashboard/buyMembership/${membershipId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const orderData = await response.json();
```

### Step 3: Initialize Razorpay Checkout

```javascript
const options = {
  key: orderData.keyId, // From backend response
  amount: orderData.amount, // Amount in paise
  currency: orderData.currency,
  name: "Connecting Hearts",
  description: "Membership Purchase",
  order_id: orderData.orderId, // Razorpay order ID
  handler: async function (response) {
    // Payment successful
    console.log('Payment ID:', response.razorpay_payment_id);
    console.log('Order ID:', response.razorpay_order_id);
    console.log('Signature:', response.razorpay_signature);
    
    // Verify payment with backend
    await verifyPayment(response.razorpay_order_id);
  },
  prefill: {
    name: userData.name,
    email: userData.email,
    contact: userData.phoneNumber
  },
  theme: {
    color: "#3399cc"
  },
  modal: {
    ondismiss: function() {
      console.log('Payment cancelled');
    }
  }
};

const razorpay = new Razorpay(options);
razorpay.open();
```

### Step 4: Verify Payment

```javascript
async function verifyPayment(orderId) {
  try {
    const response = await fetch(`/api/dashboard/verifyPayment/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      // Show success message
      alert('Membership activated successfully!');
      // Redirect or refresh membership status
    } else {
      alert('Payment verification failed: ' + result.err);
    }
  } catch (error) {
    console.error('Verification error:', error);
    alert('Error verifying payment. Please contact support.');
  }
}
```

### Complete Web Example (React)

```jsx
import React, { useState } from 'react';

function MembershipPurchase({ membershipId, userToken }) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      
      // Step 1: Create order
      const orderResponse = await fetch(
        `/api/dashboard/buyMembership/${membershipId}`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        }
      );
      
      const orderData = await orderResponse.json();
      
      // Step 2: Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Connecting Hearts",
        description: "Membership Purchase",
        order_id: orderData.orderId,
        handler: async function (response) {
          // Step 3: Verify payment
          const verifyResponse = await fetch(
            `/api/dashboard/verifyPayment/${response.razorpay_order_id}`,
            {
              headers: {
                'Authorization': `Bearer ${userToken}`
              }
            }
          );
          
          const verifyResult = await verifyResponse.json();
          
          if (verifyResult.status === 'success') {
            alert('Membership activated!');
            window.location.reload();
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#3399cc"
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePurchase} disabled={loading}>
      {loading ? 'Processing...' : 'Buy Membership'}
    </button>
  );
}
```

---

## Mobile App Integration (React Native / Flutter)

### React Native Integration

#### Step 1: Install Razorpay Package

```bash
npm install react-native-razorpay
# For iOS
cd ios && pod install
```

#### Step 2: Create Payment Order (Backend Call)

```javascript
const createOrder = async (membershipId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/dashboard/buyMembership/${membershipId}`,
      {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      }
    );
    
    const orderData = await response.json();
    return orderData;
  } catch (error) {
    console.error('Order creation error:', error);
    throw error;
  }
};
```

#### Step 3: Initialize Razorpay Checkout

```javascript
import RazorpayCheckout from 'react-native-razorpay';

const handlePayment = async (membershipId) => {
  try {
    // Step 1: Create order
    const orderData = await createOrder(membershipId);
    
    // Step 2: Open Razorpay checkout
    const paymentData = {
      description: 'Membership Purchase',
      image: 'https://your-logo-url.com/logo.png',
      currency: orderData.currency,
      key: orderData.keyId,
      amount: orderData.amount.toString(),
      name: 'Connecting Hearts',
      order_id: orderData.orderId,
      prefill: {
        email: userData.email,
        contact: userData.phoneNumber,
        name: userData.name
      },
      theme: { color: '#3399cc' }
    };
    
    const razorpayResponse = await RazorpayCheckout.open(paymentData);
    
    console.log('Payment Success:', razorpayResponse);
    
    // Step 3: Verify payment
    await verifyPayment(orderData.orderId);
    
  } catch (error) {
    console.error('Payment Error:', error);
    
    if (error.code !== 'RazorpayCheckout') {
      // User cancelled payment
      alert('Payment cancelled');
    } else {
      alert('Payment failed: ' + error.description);
    }
  }
};
```

#### Step 4: Verify Payment

```javascript
const verifyPayment = async (orderId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/dashboard/verifyPayment/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      }
    );
    
    const result = await response.json();
    
    if (result.status === 'success') {
      Alert.alert('Success', 'Membership activated successfully!');
      // Refresh membership status
    } else {
      Alert.alert('Error', result.err || 'Payment verification failed');
    }
  } catch (error) {
    console.error('Verification error:', error);
    Alert.alert('Error', 'Failed to verify payment');
  }
};
```

### Flutter Integration

#### Step 1: Add Dependency

```yaml
dependencies:
  razorpay_flutter: ^1.3.0
```

#### Step 2: Initialize Razorpay

```dart
import 'package:razorpay_flutter/razorpay_flutter.dart';

Razorpay _razorpay = Razorpay();

@override
void initState() {
  super.initState();
  _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
  _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
  _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
}

void _handlePaymentSuccess(PaymentSuccessResponse response) {
  // Verify payment with backend
  verifyPayment(response.orderId);
}

void _handlePaymentError(PaymentFailureResponse response) {
  print('Payment Error: ${response.message}');
}

void _handleExternalWallet(ExternalWalletResponse response) {
  print('External Wallet: ${response.walletName}');
}
```

#### Step 3: Create Order and Open Checkout

```dart
Future<void> initiatePayment(String membershipId) async {
  try {
    // Create order via backend
    final orderResponse = await http.get(
      Uri.parse('$apiBaseUrl/api/dashboard/buyMembership/$membershipId'),
      headers: {'Authorization': 'Bearer $userToken'},
    );
    
    final orderData = json.decode(orderResponse.body);
    
    // Open Razorpay checkout
    var options = {
      'key': orderData['keyId'],
      'amount': orderData['amount'],
      'name': 'Connecting Hearts',
      'description': 'Membership Purchase',
      'order_id': orderData['orderId'],
      'prefill': {
        'contact': userPhone,
        'email': userEmail,
        'name': userName
      },
      'external': {
        'wallets': ['paytm']
      }
    };
    
    _razorpay.open(options);
  } catch (e) {
    print('Error: $e');
  }
}

Future<void> verifyPayment(String orderId) async {
  try {
    final response = await http.get(
      Uri.parse('$apiBaseUrl/api/dashboard/verifyPayment/$orderId'),
      headers: {'Authorization': 'Bearer $userToken'},
    );
    
    final result = json.decode(response.body);
    
    if (result['status'] == 'success') {
      // Show success message
      // Refresh membership status
    }
  } catch (e) {
    print('Verification error: $e');
  }
}
```

---

## Payment Flow Diagram

```
┌─────────────┐
│   Frontend  │
│  (Web/App)  │
└──────┬──────┘
       │
       │ 1. GET /buyMembership/:id
       ▼
┌─────────────────┐
│  Backend API    │
│  Controller     │
└──────┬──────────┘
       │
       │ 2. paymentService.createOrder()
       ▼
┌─────────────────┐
│ Payment Service │
│  (Razorpay)     │
└──────┬──────────┘
       │
       │ 3. Razorpay API
       ▼
┌─────────────────┐
│   Razorpay      │
│   Gateway       │
└──────┬──────────┘
       │
       │ 4. Return Order Details
       ▼
┌─────────────┐
│   Frontend  │
│  Opens      │
│  Checkout   │
└──────┬──────┘
       │
       │ 5. User Pays
       ▼
┌─────────────────┐
│   Razorpay      │
│   Processes     │
│   Payment       │
└──────┬──────────┘
       │
       │ 6. Payment Success
       ▼
┌─────────────┐
│   Frontend  │
│  Calls      │
│  verifyPayment
└──────┬──────┘
       │
       │ 7. GET /verifyPayment/:orderID
       ▼
┌─────────────────┐
│  Backend API    │
│  Verifies &     │
│  Activates      │
│  Membership     │
└─────────────────┘
```

---

## Testing

### Sandbox Testing

1. Use test keys from Razorpay dashboard
2. Test cards:
   - **Success**: `4111 1111 1111 1111`
   - **Failure**: `4000 0000 0000 0002`
   - **3D Secure**: `4012 0010 3714 1112`

### Production Checklist

- [ ] Complete Razorpay KYC
- [ ] Get production keys
- [ ] Update environment variables
- [ ] Test with small amount first
- [ ] Monitor payment logs
- [ ] Set up webhooks (optional)

---

## Troubleshooting

### Common Issues

1. **"Invalid key_id"**
   - Check `RAZORPAY_KEY_ID` in environment variables
   - Ensure correct test/production keys

2. **"Order not found"**
   - Verify order ID format
   - Check if order exists in Razorpay dashboard

3. **Payment not verifying**
   - Check order status in Razorpay dashboard
   - Verify backend logs for errors
   - Ensure membership ID is in order notes

4. **Mobile app not opening checkout**
   - Check Razorpay SDK installation
   - Verify key_id is passed correctly
   - Check platform-specific setup (iOS/Android)

---

## Support

For Razorpay-specific issues:
- Documentation: https://razorpay.com/docs/
- Support: support@razorpay.com

For integration issues:
- Check backend logs
- Verify environment variables
- Review payment audit schema in database


