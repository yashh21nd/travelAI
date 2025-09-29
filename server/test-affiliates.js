// Test script to verify affiliate URL generation and tracking
// PowerShell-compatible version

console.log('🧪 Testing Affiliate System...\n');

// Test affiliate configuration loading
try {
  const { generateAffiliateUrl, calculateRevenue, affiliateConfig } = require('./config/affiliates');
  
  console.log('✅ Affiliate configuration loaded successfully');
  console.log('📊 Available providers:', Object.keys(affiliateConfig).join(', '));
  
  // Test data
  const testData = {
    destination: 'Paris',
    checkIn: '2025-12-15',
    checkOut: '2025-12-18',
    guests: 2,
    hotelName: 'Hotel des Arts Montmartre'
  };

  console.log('\n📊 Test Parameters:');
  console.log('Destination:', testData.destination);
  console.log('Check-in:', testData.checkIn);
  console.log('Check-out:', testData.checkOut);
  console.log('Guests:', testData.guests);
  console.log('Hotel:', testData.hotelName);

  // Test URL generation for each provider
  console.log('\n🔗 Generated Affiliate URLs:');
  console.log('='.repeat(80));

  Object.keys(affiliateConfig).forEach(provider => {
    try {
      const url = generateAffiliateUrl(
        provider,
        testData.destination,
        testData.checkIn,
        testData.checkOut,
        testData.guests,
        testData.hotelName
      );
      
      const config = affiliateConfig[provider];
      console.log('\n' + config.logo + ' ' + provider.toUpperCase());
      console.log('Commission:', config.commission + '%');
      console.log('URL:', url);
      console.log('Contains Affiliate ID:', url.includes(config.affiliateId) ? '✅' : '❌');
    } catch (error) {
      console.log('\n❌ Error generating URL for', provider, ':', error.message);
    }
  });

  // Test revenue calculations
  console.log('\n💰 Revenue Calculations:');
  console.log('='.repeat(80));

  const bookingScenarios = [
    { name: 'Budget Booking', value: 150 },
    { name: 'Mid-Range Booking', value: 400 },
    { name: 'Luxury Booking', value: 1200 }
  ];

  bookingScenarios.forEach(scenario => {
    console.log('\n🏨 ' + scenario.name + ' ($' + scenario.value + ')');
    
    Object.keys(affiliateConfig).forEach(provider => {
      try {
        const revenue = calculateRevenue(scenario.value, provider);
        console.log('  ' + provider + ': $' + revenue.revenue.toFixed(2) + ' (' + revenue.totalCommission + '%)');
      } catch (error) {
        console.log('  ' + provider + ': Error -', error.message);
      }
    });
  });

  // Environment check
  console.log('\n⚙️  Environment Check:');
  console.log('='.repeat(80));

  let hasRealIds = false;
  Object.keys(affiliateConfig).forEach(provider => {
    const config = affiliateConfig[provider];
    const isDemo = config.affiliateId.includes('DEMO');
    console.log(provider + ':', (isDemo ? '⚠️  Using DEMO ID' : '✅ Real Affiliate ID') + ' (' + config.affiliateId + ')');
    if (!isDemo) hasRealIds = true;
  });

  if (!hasRealIds) {
    console.log('\n🚨 WARNING: All affiliate IDs are DEMO versions!');
    console.log('   1. Apply to affiliate programs (see AFFILIATE_CHECKLIST.md)');
    console.log('   2. Create .env file with real affiliate IDs');
    console.log('   3. Replace DEMO_* values with actual partner IDs');
  }

  // Success summary
  console.log('\n✅ Affiliate System Test Complete!');
  console.log('\n🎯 Next Steps:');
  console.log('1. Apply to Booking.com Partner Hub (highest priority)');
  console.log('2. Update .env file with real affiliate IDs');
  console.log('3. Test booking flows with actual URLs');
  console.log('4. Set up Google Analytics conversion tracking');
  
  console.log('\n💰 Revenue Potential:');
  console.log('- Month 1-3: $500-2,000 (building traffic)');
  console.log('- Month 4-6: $2,000-8,000 (established users)');
  console.log('- Year 1+: $18,000-360,000+ (scale dependent)');

} catch (error) {
  console.log('❌ Error loading affiliate configuration:', error.message);
  console.log('\nPlease ensure:');
  console.log('1. config/affiliates.js exists');
  console.log('2. All required dependencies are installed');
  console.log('3. No syntax errors in the configuration');
}