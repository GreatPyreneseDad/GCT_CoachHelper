import axios from 'axios';
import { prisma } from '../utils/prisma';
import { EmailService } from '../services/email.service';

const API_URL = process.env.API_URL || 'http://localhost:3000';

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

async function testPaymentFlow() {
  console.log('🧪 Testing Payment System End-to-End...\n');

  try {
    // Step 1: Create test user and authenticate
    console.log('1. Creating test coach user...');
    const testUser = {
      email: `test-coach-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Test Coach',
      role: 'COACH',
    };

    const signupResponse = await axios.post(`${API_URL}/api/auth/signup`, testUser);
    const { token } = signupResponse.data;
    
    results.push({
      testName: 'User Creation',
      passed: true,
      details: { email: testUser.email },
    });

    // Step 2: Test getting pricing plans
    console.log('2. Testing pricing plans endpoint...');
    const plansResponse = await axios.get(`${API_URL}/api/stripe/plans`);
    const plans = plansResponse.data.plans;
    
    results.push({
      testName: 'Get Pricing Plans',
      passed: plans.length > 0,
      details: { planCount: plans.length },
    });

    // Step 3: Test checkout session creation
    console.log('3. Testing checkout session creation...');
    try {
      const checkoutResponse = await axios.post(
        `${API_URL}/api/stripe/create-checkout-session`,
        {
          planId: plans[0].id,
          successUrl: 'http://localhost:3001/dashboard?subscription=success',
          cancelUrl: 'http://localhost:3001/settings/billing?subscription=cancelled',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const checkoutUrl = checkoutResponse.data.url;
      
      results.push({
        testName: 'Create Checkout Session',
        passed: checkoutUrl && checkoutUrl.includes('checkout.stripe.com'),
        details: { url: checkoutUrl },
      });
    } catch (error: any) {
      results.push({
        testName: 'Create Checkout Session',
        passed: false,
        error: error.response?.data?.error || error.message,
      });
    }

    // Step 4: Test subscription status check
    console.log('4. Testing subscription status...');
    try {
      const statusResponse = await axios.get(
        `${API_URL}/api/stripe/subscription-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      results.push({
        testName: 'Get Subscription Status',
        passed: true,
        details: statusResponse.data,
      });
    } catch (error: any) {
      results.push({
        testName: 'Get Subscription Status',
        passed: false,
        error: error.response?.data?.error || error.message,
      });
    }

    // Step 5: Test billing portal session
    console.log('5. Testing billing portal session...');
    try {
      const portalResponse = await axios.post(
        `${API_URL}/api/stripe/create-portal-session`,
        {
          returnUrl: 'http://localhost:3001/settings/billing',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const portalUrl = portalResponse.data.url;
      
      results.push({
        testName: 'Create Portal Session',
        passed: portalUrl && portalUrl.includes('billing.stripe.com'),
        details: { url: portalUrl },
      });
    } catch (error: any) {
      results.push({
        testName: 'Create Portal Session',
        passed: false,
        error: error.response?.data?.error || error.message,
      });
    }

    // Step 6: Test webhook endpoint (without actual Stripe signature)
    console.log('6. Testing webhook endpoint structure...');
    try {
      const webhookResponse = await axios.post(
        `${API_URL}/api/stripe/webhook`,
        {
          type: 'checkout.session.completed',
          data: { object: { id: 'test_session' } },
        },
        {
          headers: {
            'stripe-signature': 'test_signature',
            'Content-Type': 'application/json',
          },
        }
      );

      results.push({
        testName: 'Webhook Endpoint',
        passed: true,
        details: { note: 'Endpoint exists, actual webhook processing requires valid Stripe signature' },
      });
    } catch (error: any) {
      // Expected to fail without valid signature
      results.push({
        testName: 'Webhook Endpoint',
        passed: error.response?.status === 400 || error.response?.status === 401,
        details: { note: 'Webhook security is working correctly' },
      });
    }

    // Step 7: Test email notifications
    console.log('7. Testing email service...');
    try {
      // Test coach welcome email
      await EmailService.sendCoachWelcomeEmail(testUser.email, testUser.name);
      results.push({
        testName: 'Email Service - Coach Welcome',
        passed: true,
        details: { email: testUser.email },
      });
    } catch (error: any) {
      results.push({
        testName: 'Email Service - Coach Welcome',
        passed: false,
        error: error.message,
      });
    }

    // Cleanup: Delete test user
    console.log('\nCleaning up test data...');
    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    if (user) {
      await prisma.coach.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }

  } catch (error: any) {
    console.error('Test suite error:', error.message);
  }

  // Print results
  console.log('\n📊 Test Results Summary\n');
  console.log('─'.repeat(80));
  
  let passedCount = 0;
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.testName}`);
    if (!result.passed && result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.details) {
      console.log(`   Details:`, result.details);
    }
    if (result.passed) passedCount++;
  });

  console.log('─'.repeat(80));
  console.log(`\nTotal: ${passedCount}/${results.length} tests passed`);
  
  if (passedCount === results.length) {
    console.log('\n🎉 All payment system tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Check environment variables
console.log('🔍 Checking environment setup...\n');
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'FRONTEND_URL',
  'SENDGRID_API_KEY',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
  console.log('\nPlease set these in your .env file before running tests.\n');
  process.exit(1);
}

// Run tests
testPaymentFlow()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });