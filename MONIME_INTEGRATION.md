# Monime Payment Integration Guide

This document provides comprehensive instructions for integrating Monime payment services into the FarmTrust platform.

## Overview

Monime is a payment orchestration platform that enables mobile money payments in Sierra Leone. Our integration supports:
- Orange Money
- Afrimoney  
- Africell Money

## Prerequisites

1. **Monime Account**: Sign up at [Monime Dashboard](https://dashboard.monime.io)
2. **API Credentials**: Obtain your API key, secret key, and space ID from the Monime dashboard
3. **Webhook URL**: Ensure your server can receive webhooks from Monime

## Environment Configuration

Add the following environment variables to your `.env.local` file:

```bash
# Monime Configuration
MONIME_API_KEY=your_api_key_here
MONIME_SECRET_KEY=your_secret_key_here
MONIME_SPACE_ID=your_space_id_here
MONIME_BASE_URL=https://api.monime.io
MONIME_ENVIRONMENT=sandbox  # or 'live' for production

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Your app's base URL
```

## API Credentials Setup

### 1. Get Your API Key
1. Log into your [Monime Dashboard](https://dashboard.monime.io)
2. Navigate to **Settings** → **API Keys**
3. Create a new API key or copy your existing one
4. Set the API key in your environment variables

### 2. Get Your Secret Key
1. In the Monime Dashboard, go to **Settings** → **Webhooks**
2. Copy your webhook secret key
3. Set the secret key in your environment variables

### 3. Get Your Space ID
1. In the Monime Dashboard, go to **Settings** → **Spaces**
2. Copy your space ID
3. Set the space ID in your environment variables

## Webhook Configuration

### 1. Configure Webhook URL
In your Monime Dashboard:
1. Go to **Settings** → **Webhooks**
2. Add your webhook URL: `https://yourdomain.com/api/payments/monime/webhook`
3. Select the following events:
   - `payment.completed`
   - `payment.failed`
   - `payment.cancelled`
   - `payment.processing`

### 2. Test Webhook
1. Use the "Test Webhook" feature in the Monime Dashboard
2. Verify that your webhook endpoint receives the test event
3. Check your server logs for successful webhook processing

## Payment Flow

### 1. Payment Initialization
When a user selects mobile money payment:

```typescript
// Frontend initiates payment
const response = await fetch('/api/payments/initialize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 'order_123',
    paymentMethod: 'orange_money', // or 'afrimoney', 'africell_money'
    phoneNumber: '23276123456',
    amount: 50000, // in Leones
    customerInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+23276123456'
    }
  })
});
```

### 2. Payment Processing
1. User receives payment prompt on their phone
2. User authorizes the payment
3. Monime processes the transaction
4. Webhook notification is sent to your server

### 3. Payment Verification
The system automatically verifies payment status:

```typescript
// Polling for payment status
const verifyResponse = await fetch(`/api/payments/verify?reference=${reference}`);
const result = await verifyResponse.json();
```

## Supported Payment Methods

### Orange Money
- **Provider ID**: `orange_money`
- **Description**: Orange Sierra Leone mobile money service
- **Phone Format**: +232 followed by 8 digits

### Afrimoney
- **Provider ID**: `afrimoney`
- **Description**: Afrimoney mobile money service
- **Phone Format**: +232 followed by 8 digits

### Africell Money
- **Provider ID**: `africell_money`
- **Description**: Africell Sierra Leone mobile money service
- **Phone Format**: +232 followed by 8 digits

## Error Handling

### Common Error Codes
- `400`: Invalid request parameters
- `401`: Authentication failed
- `403`: Insufficient permissions
- `404`: Payment not found
- `422`: Payment validation failed
- `500`: Internal server error

### Error Response Format
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

## Testing

### Sandbox Environment
1. Use the sandbox environment for testing
2. Test with sample phone numbers provided by Monime
3. Verify webhook processing in sandbox mode

### Test Phone Numbers
- **Orange Money**: Use test numbers provided in Monime documentation
- **Afrimoney**: Use test numbers provided in Monime documentation
- **Africell Money**: Use test numbers provided in Monime documentation

## Security Considerations

### 1. Webhook Signature Verification
All webhooks are verified using HMAC-SHA256 signatures:

```typescript
// Automatic verification in webhook handler
if (!monimeService.validateWebhookSignature(rawBody, signature)) {
  return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
}
```

### 2. API Key Security
- Never expose API keys in client-side code
- Use environment variables for all sensitive data
- Rotate API keys regularly

### 3. HTTPS Requirements
- Always use HTTPS in production
- Ensure webhook URLs are HTTPS
- Validate SSL certificates

## Monitoring and Logging

### 1. Payment Logs
Monitor payment processing through:
- Server logs for API calls
- Monime Dashboard for transaction status
- Database records for payment history

### 2. Webhook Monitoring
- Monitor webhook delivery status
- Set up alerts for failed webhooks
- Log all webhook events for debugging

## Troubleshooting

### Payment Not Initializing
1. Check API credentials are correct
2. Verify space ID is valid
3. Ensure all required fields are provided
4. Check server logs for detailed error messages

### Webhook Not Receiving
1. Verify webhook URL is accessible
2. Check webhook secret key matches
3. Ensure HTTPS is enabled
4. Test webhook endpoint manually

### Payment Status Not Updating
1. Check webhook processing logs
2. Verify payment reference matches
3. Ensure database updates are working
4. Check Monime Dashboard for payment status

## Production Checklist

Before going live:

- [ ] API credentials configured
- [ ] Webhook URL configured and tested
- [ ] HTTPS enabled
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Monitoring set up
- [ ] Test payments completed
- [ ] Documentation updated

## Support

For technical support:
1. Check Monime documentation: https://docs.monime.io
2. Contact Monime support through their dashboard
3. Review server logs for detailed error information
4. Test with sandbox environment first

## API Reference

### Initialize Payment
```http
POST /api/payments/initialize
Content-Type: application/json

{
  "orderId": "string",
  "paymentMethod": "orange_money|afrimoney|africell_money",
  "phoneNumber": "23276123456",
  "amount": number,
  "customerInfo": {
    "name": "string",
    "email": "string",
    "phone": "string"
  }
}
```

### Verify Payment
```http
GET /api/payments/verify?reference=string
```

### Webhook Endpoint
```http
POST /api/payments/monime/webhook
Content-Type: application/json
X-Monime-Signature: sha256=...
```

## Changelog

### v2.0.0 (Current)
- Added Africell Money support
- Improved error handling and validation
- Enhanced webhook security
- Updated API endpoints
- Added comprehensive logging

### v1.0.0
- Initial Monime integration
- Orange Money and Afrimoney support
- Basic webhook handling
- Payment verification system
