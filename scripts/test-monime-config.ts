#!/usr/bin/env tsx

/**
 * Monime Configuration Test Script
 * 
 * This script helps verify that your Monime integration is properly configured
 * and can communicate with the Monime API.
 */

import { monimeService } from '../services/monime_service';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function testMonimeConfiguration() {
  console.log('🔍 Testing Monime Configuration...\n');

  // Test 1: Check if environment variables are set
  console.log('1. Checking Environment Variables:');
  const configStatus = monimeService.getConfigStatus();
  
  if (configStatus.configured) {
    console.log('✅ All required environment variables are set');
  } else {
    console.log('❌ Missing environment variables:', configStatus.missing.join(', '));
    console.log('\nPlease set the following in your .env.local file:');
    configStatus.missing.forEach(missing => {
      console.log(`   ${missing}=your_value_here`);
    });
    return;
  }

  // Test 2: Check if Monime service is configured
  console.log('\n2. Checking Monime Service Configuration:');
  if (monimeService.isConfigured()) {
    console.log('✅ Monime service is properly configured');
  } else {
    console.log('❌ Monime service is not configured');
    return;
  }

  // Test 3: Test API connectivity (optional - only if you want to test with real credentials)
  console.log('\n3. Testing API Connectivity:');
  console.log('⚠️  This test requires valid API credentials');
  console.log('   Set TEST_API_CONNECTIVITY=true to run this test\n');

  if (process.env.TEST_API_CONNECTIVITY === 'true') {
    try {
      // Test with a minimal payment request
      const testPayment = await monimeService.createMobileMoneyPayment({
        amount: 100, // 1 Leone (minimum amount)
        phone: '23276123456', // Test phone number
        provider: 'orange_money',
        reference: `TEST_${Date.now()}`,
        description: 'FarmTrust Configuration Test',
        customer: {
          name: 'Test Customer',
          email: 'test@farmtrust.com',
          phone: '23276123456'
        }
      });

      if (testPayment.success) {
        console.log('✅ API connectivity test successful');
        console.log('   Payment ID:', testPayment.data?.payment_id);
        console.log('   Reference:', testPayment.data?.reference);
      } else {
        console.log('❌ API connectivity test failed');
        console.log('   Error:', testPayment.error);
      }
    } catch (error) {
      console.log('❌ API connectivity test failed with exception');
      console.log('   Error:', error);
    }
  } else {
    console.log('⏭️  Skipping API connectivity test');
    console.log('   Set TEST_API_CONNECTIVITY=true to run this test');
  }

  // Test 4: Display available payment methods
  console.log('\n4. Available Payment Methods:');
  const paymentMethods = monimeService.getAvailablePaymentMethods();
  paymentMethods.forEach(method => {
    console.log(`   ${method.icon} ${method.name} (${method.id})`);
    console.log(`      ${method.description}`);
  });

  // Test 5: Check webhook configuration
  console.log('\n5. Webhook Configuration:');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const webhookUrl = `${baseUrl}/api/payments/monime/webhook`;
  console.log(`   Webhook URL: ${webhookUrl}`);
  console.log(`   Make sure this URL is configured in your Monime dashboard`);

  // Test 6: Environment information
  console.log('\n6. Environment Information:');
  console.log(`   Environment: ${process.env.MONIME_ENVIRONMENT || 'sandbox'}`);
  console.log(`   Base URL: ${process.env.MONIME_BASE_URL || 'https://api.monime.io'}`);
  console.log(`   App Base URL: ${baseUrl}`);

  console.log('\n🎉 Configuration test completed!');
  console.log('\nNext steps:');
  console.log('1. Configure webhook URL in Monime dashboard');
  console.log('2. Test with sandbox environment first');
  console.log('3. Verify webhook processing');
  console.log('4. Test payment flow end-to-end');
}

// Run the test
testMonimeConfiguration().catch(console.error);
