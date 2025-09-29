// Real affiliate configuration for production
const affiliateConfig = {
  'booking.com': {
    affiliateId: process.env.BOOKING_AFFILIATE_ID || 'DEMO_BOOKING_ID',
    commission: 35.0, // Booking.com actual commission: 25-40%
    reliability: 'High',
    baseUrl: 'https://www.booking.com/searchresults.html',
    logo: '🏨',
    description: 'World\'s largest accommodation booking platform',
    region: 'Global'
  },
  'expedia.com': {
    affiliateId: process.env.EXPEDIA_AFFILIATE_ID || 'DEMO_EXPEDIA_ID', 
    commission: 6.0, // Expedia actual commission: 4-7%
    reliability: 'High',
    baseUrl: 'https://www.expedia.com/Hotel-Search',
    logo: '✈️',
    description: 'Comprehensive travel booking with bundled deals',
    region: 'Global'
  },
  'hotels.com': {
    affiliateId: process.env.HOTELS_AFFILIATE_ID || 'DEMO_HOTELS_ID',
    commission: 5.0, // Hotels.com actual commission: 4-6%
    reliability: 'Medium',
    baseUrl: 'https://www.hotels.com/search.do',
    logo: '🏩',
    description: 'Specialized hotel booking with rewards program',
    region: 'Global'
  },
  'agoda.com': {
    affiliateId: process.env.AGODA_PARTNER_ID || 'DEMO_AGODA_ID',
    commission: 4.5, // Agoda actual commission: 2-7%
    reliability: 'Medium',
    baseUrl: 'https://www.agoda.com/search',
    logo: '🌟',
    description: 'Leading Asia-Pacific accommodation specialist',
    region: 'Asia-Pacific'
  },
  'trivago.com': {
    affiliateId: process.env.TRIVAGO_AFFILIATE_ID || 'DEMO_TRIVAGO_ID',
    commission: 3.5, // Trivago actual commission: 2-4%
    reliability: 'High',
    baseUrl: 'https://www.trivago.com',
    logo: '🔍',
    description: 'Hotel comparison meta-search engine',
    region: 'Global'
  },
  'goibibo.com': {
    affiliateId: process.env.GOIBIBO_AFFILIATE_ID || 'DEMO_GOIBIBO_ID',
    commission: 4.0, // GoIbibo actual commission: 2-5%
    reliability: 'High',
    baseUrl: 'https://www.goibibo.com/hotels',
    logo: '🇮🇳',
    description: 'Leading Indian travel platform with local expertise',
    region: 'India'
  },
  'makemytrip.com': {
    affiliateId: process.env.MAKEMYTRIP_AFFILIATE_ID || 'DEMO_MAKEMYTRIP_ID',
    commission: 3.5, // MakeMyTrip actual commission: 2-4%
    reliability: 'High',
    baseUrl: 'https://www.makemytrip.com/hotels',
    logo: '🏛️',
    description: 'India\'s largest online travel company',
    region: 'India'
  }
};

// Revenue tracking configuration
const revenueConfig = {
  conversionRate: 0.08, // 8% of users who see accommodations actually book
  averageBookingValue: {
    budget: 150,    // $50/night × 3 nights
    midrange: 400,  // $100/night × 4 nights  
    luxury: 1200    // $300/night × 4 nights
  },
  // Commission tiers based on monthly booking volume
  commissionTiers: {
    starter: { min: 0, max: 50, bonus: 0 },      // 0-50 bookings/month
    growth: { min: 51, max: 200, bonus: 0.5 },   // 51-200 bookings: +0.5% bonus
    scale: { min: 201, max: 500, bonus: 1.0 },   // 201-500 bookings: +1% bonus
    enterprise: { min: 501, max: 9999, bonus: 2.0 } // 500+ bookings: +2% bonus
  }
};

// Utility functions
const generateAffiliateUrl = (provider, destination, checkIn, checkOut, guests, hotelName) => {
  const config = affiliateConfig[provider];
  if (!config) return '#';
  
  const params = {
    destination: encodeURIComponent(destination),
    checkIn: encodeURIComponent(checkIn),
    checkOut: encodeURIComponent(checkOut),
    guests: guests,
    hotel: encodeURIComponent(hotelName || ''),
    affiliateId: config.affiliateId
  };
  
  // Generate platform-specific URLs
  switch (provider.toLowerCase()) {
    case 'booking.com':
      return `https://www.booking.com/searchresults.html?ss=${params.destination}&checkin=${params.checkIn}&checkout=${params.checkOut}&group_adults=${params.guests}&no_rooms=1&aid=${params.affiliateId}&selected_currency=USD`;
    
    case 'expedia.com':
      return `https://www.expedia.com/Hotel-Search?destination=${params.destination}&startDate=${params.checkIn}&endDate=${params.checkOut}&rooms=1&adults=${params.guests}&semcid=${params.affiliateId}`;
    
    case 'hotels.com':
      return `https://www.hotels.com/search.do?q-destination=${params.destination}&q-check-in=${params.checkIn}&q-check-out=${params.checkOut}&q-rooms=1&q-room-0-adults=${params.guests}&WOE=${params.affiliateId}`;
    
    case 'agoda.com':
      return `https://www.agoda.com/search?city=${params.destination}&checkIn=${params.checkIn}&checkOut=${params.checkOut}&rooms=1&adults=${params.guests}&cid=${params.affiliateId}`;
    
    case 'trivago.com':
      return `https://www.trivago.com/?query=${params.destination}&search-dates=${params.checkIn},${params.checkOut}&rooms=${params.guests}&affid=${params.affiliateId}`;
    
    case 'goibibo.com':
      return `https://www.goibibo.com/hotels/?cc=IN&checkin=${params.checkIn}&checkout=${params.checkOut}&destination=${params.destination}&rooms=1&adults=${params.guests}&partnerCode=${params.affiliateId}`;
    
    case 'makemytrip.com':
      return `https://www.makemytrip.com/hotels/hotel-listing/?checkin=${params.checkIn}&checkout=${params.checkOut}&city=${params.destination}&roomStayQualifier=1e0e&locusId=${params.destination}&locusType=city&partnerCode=${params.affiliateId}`;
    
    default:
      return `${config.baseUrl}?destination=${params.destination}&checkin=${params.checkIn}&checkout=${params.checkOut}&guests=${params.guests}&affiliate=${params.affiliateId}`;
  }
};

// Calculate potential revenue
const calculateRevenue = (bookingValue, provider, monthlyVolume = 0) => {
  const baseCommission = affiliateConfig[provider]?.commission || 0;
  const tier = Object.values(revenueConfig.commissionTiers).find(
    t => monthlyVolume >= t.min && monthlyVolume <= t.max
  );
  
  const totalCommission = baseCommission + (tier?.bonus || 0);
  const revenue = (bookingValue * totalCommission) / 100;
  
  return {
    bookingValue,
    baseCommission,
    bonusCommission: tier?.bonus || 0,
    totalCommission,
    revenue,
    provider
  };
};

// Get commission tier info
const getCommissionTier = (monthlyBookings) => {
  return Object.entries(revenueConfig.commissionTiers).find(
    ([name, tier]) => monthlyBookings >= tier.min && monthlyBookings <= tier.max
  );
};

module.exports = {
  affiliateConfig,
  revenueConfig,
  generateAffiliateUrl,
  calculateRevenue,
  getCommissionTier
};