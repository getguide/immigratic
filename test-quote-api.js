// Simple test script to verify the new quote API works
const testData = {
  name: "Test User",
  email: "test@example.com",
  quoteData: {
    totalPrice: 1000,
    applicationType: "work_permit",
    location: "inland",
    hasSpouse: false,
    dependentsCount: 0,
    priorRefusal: false
  },
  sessionData: {
    sessionId: "test_session_123",
    timeSpentSeconds: 30,
    utmSource: "direct",
    utmMedium: "website",
    utmCampaign: "pricing_calculator",
    deviceType: "desktop",
    userAgent: "Test Agent",
    referrer: "",
    landingPage: "/tools/pricing-calculator"
  }
};

async function testAPI() {
  try {
    console.log('🧪 Testing new Quote API V2...');
    
    const response = await fetch('http://localhost:4322/api/save-quote-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('🧪 Response status:', response.status);
    const result = await response.json();
    console.log('🧪 Response body:', result);

    if (result.success) {
      console.log('✅ API V2 is working!');
    } else {
      console.log('❌ API V2 failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAPI();
