require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const htmlPdf = require('html-pdf-node');
const { getPlacesByCity, createDetailedItinerary, getPlacesByRequirement } = require('./locationService');
const { affiliateConfig, generateAffiliateUrl, calculateRevenue } = require('./config/affiliates');

const app = express();

// Enhanced CORS configuration for production deployment
const corsOptions = {
  origin: [
    // Your current working Vercel deployment domains
    'https://ai-travel-planner-unique-2025.vercel.app',
    'https://travelai-yashh21nd-frontend.vercel.app',
    
    // Development domains
    'http://localhost:3000',
    'http://localhost:5000',
    
    // Regex patterns for dynamic Vercel domains (more permissive)
    /^https:\/\/.*yashs-projects-dadc759f\.vercel\.app$/,
    /^https:\/\/ai-travel-planner-unique-2025.*\.vercel\.app$/,
    /\.vercel\.app$/,  // Allow any Vercel subdomain
    /\.onrender\.com$/ // Allow Render domains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`🌐 Request from origin: ${origin} | Method: ${req.method} | Path: ${req.path}`);
  
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 Handling OPTIONS preflight request for:', req.path);
    return res.status(200).end();
  }
  
  next();
});

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    email: {
      configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
      user: process.env.EMAIL_USER || 'not set',
      passwordLength: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0
    }
  });
});

// Test POST endpoint for frontend connectivity testing
app.post('/api/test-post', (req, res) => {
  console.log('🔍 Test POST endpoint hit');
  res.json({
    success: true,
    message: 'Backend connectivity test successful',
    timestamp: new Date().toISOString(),
    method: req.method,
    body: req.body
  });
});

// Root endpoint - Health check
app.get('/', (req, res) => {
  res.json({
    message: '🌍 TravelAI Backend API is running!',
    status: 'healthy',
    version: '1.0.0',
    endpoints: {
      plan: '/api/plan',
      sendItinerary: '/api/send-itinerary',
      accommodations: '/api/accommodations',
      places: '/api/places/:destination'
    },
    timestamp: new Date().toISOString()
  });
});

// Professional accommodation price comparison API with real hotel data
async function getAccommodationPrices(destination, checkIn, checkOut, guests, currency, tripDuration) {
  // Date validation - check if accommodation dates match trip duration
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const daysDifference = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  
  if (daysDifference > tripDuration) {
    return {
      error: true,
      message: `⚠️ Accommodation duration (${daysDifference} days) exceeds your trip duration (${tripDuration} days). Please adjust your check-in/check-out dates.`,
      suggestedCheckOut: new Date(checkInDate.getTime() + (tripDuration * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
    };
  }
  
  if (daysDifference < 1) {
    return {
      error: true,
      message: '⚠️ Check-out date must be after check-in date. Please select valid dates.',
      minCheckOut: new Date(checkInDate.getTime() + (24 * 60 * 60 * 1000)).toISOString().split('T')[0]
    };
  }

  const accommodationProviders = affiliateConfig;

  const currencySymbols = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: 'C$', AUD: 'A$', CNY: '¥'
  };

  // Smart provider prioritization based on destination
  const getProvidersForDestination = (destination) => {
    const indianDestinations = ['delhi', 'mumbai', 'kerala', 'jaipur', 'agra', 'bangalore', 'pune', 'hyderabad', 'chennai', 'kolkata', 'goa'];
    const destinationLower = destination.toLowerCase();
    
    let providers = Object.keys(accommodationProviders);
    
    // Prioritize Indian platforms for Indian destinations
    if (indianDestinations.some(city => destinationLower.includes(city))) {
      providers = [
        'goibibo.com',
        'makemytrip.com', 
        'booking.com',
        'agoda.com',
        'expedia.com',
        'hotels.com',
        'trivago.com'
      ];
    } else {
      // Global destinations - prioritize international platforms
      providers = [
        'booking.com',
        'expedia.com',
        'agoda.com',
        'hotels.com',
        'trivago.com',
        'goibibo.com',
        'makemytrip.com'
      ];
    }
    
    return providers.filter(provider => accommodationProviders[provider]);
  };

  // Function to generate booking URL with real affiliate tracking
  const generateBookingUrl = (provider, destination, checkIn, checkOut, guests, hotelName) => {
    return generateAffiliateUrl(provider, destination, checkIn, checkOut, guests, hotelName);
  };

  // Real hotel data by destination - Expanded with more options
  const hotelDatabase = {
    'kerala': {
      budget: [
        { name: 'Backwater Retreat Homestay', amenities: 'Free WiFi, AC, Traditional Breakfast', rating: 4.2 },
        { name: 'Cochin Backpackers Hostel', amenities: 'Shared Kitchen, Free WiFi, Tours', rating: 4.0 },
        { name: 'Alappuzha Budget Inn', amenities: 'Clean Rooms, Local Food, AC', rating: 3.8 },
        { name: 'Spice Garden Homestay', amenities: 'Organic Spice Farm, Family-Run, Authentic Experience', rating: 4.1 },
        { name: 'Coconut Creek Farm', amenities: 'Eco-Friendly, Rural Setting, Bicycle Tours', rating: 4.0 },
        { name: 'Beach Castle Homestay', amenities: 'Beachfront Location, Traditional Kerala, Seafood', rating: 4.3 },
        { name: 'Munnar Tea Estate Stay', amenities: 'Hill Station, Tea Plantation, Mountain Views', rating: 4.1 }
      ],
      midrange: [
        { name: 'Spice Coast Cruises Houseboat', amenities: 'Private Deck, All Meals, AC', rating: 4.6 },
        { name: 'Tea Valley Resort', amenities: 'Mountain View, Spa, Restaurant', rating: 4.4 },
        { name: 'Backwater Ripples Resort', amenities: 'Pool, Ayurveda, Traditional Architecture', rating: 4.3 },
        { name: 'Hill View Munnar', amenities: 'Tea Garden View, Trekking, Bonfire', rating: 4.1 },
        { name: 'Marari Beach Resort', amenities: 'Pristine Beach, Sustainable Tourism, Cultural Programs', rating: 4.6 },
        { name: 'Fragrant Nature Kochi', amenities: 'Backwater Resort, Luxury Houseboats, Spa Treatments', rating: 4.3 },
        { name: 'Windermere Estate Munnar', amenities: 'Colonial Heritage, Tea Plantation, Mountain Resort', rating: 4.4 },
        { name: 'Coconut Lagoon Resort', amenities: 'Heritage Property, Traditional Kerala, Cultural Shows', rating: 4.5 }
      ],
      luxury: [
        { name: 'Kumarakom Lake Resort', amenities: 'Luxury Villas, Spa, Private Beach', rating: 4.8 },
        { name: 'Taj Malabar Resort & Spa', amenities: '5-Star Service, Ocean View, Fine Dining', rating: 4.9 },
        { name: 'Leela Kovalam Beach', amenities: 'Clifftop Resort, Arabian Sea Views, Ayurvedic Treatments', rating: 4.9 },
        { name: 'Grand Hyatt Kochi', amenities: 'Bolgatty Island, Lagoon Views, International Dining', rating: 4.7 },
        { name: 'Vivanta by Taj Bekal', amenities: 'Beachfront Luxury, Golf Course, Multiple Restaurants', rating: 4.6 },
        { name: 'Brunton Boatyard Kochi', amenities: 'Colonial Heritage, Harbor Views, Boutique Luxury', rating: 4.7 }
      ]
    },
    'delhi': {
      budget: [
        { name: 'Zostel Delhi', amenities: 'Hostel, Free WiFi, Common Area', rating: 4.1 },
        { name: 'Hotel City Park', amenities: 'Central Location, AC, Restaurant', rating: 3.9 },
        { name: 'Smyle Inn', amenities: 'Budget Rooms, Metro Nearby, Clean', rating: 3.7 },
        { name: 'Backpacker Panda New Delhi', amenities: 'Social Hostel, Tours, Kitchen', rating: 4.0 },
        { name: 'Hotel Tara Palace', amenities: 'Heritage Building, Budget-Friendly, Central', rating: 3.8 },
        { name: 'OYO Flagship Karol Bagh', amenities: 'Modern Rooms, AC, Good Connectivity', rating: 4.2 }
      ],
      midrange: [
        { name: 'The Lalit New Delhi', amenities: 'Business Center, Pool, Multiple Restaurants', rating: 4.5 },
        { name: 'Hotel Tara Palace', amenities: 'Heritage Building, Rooftop, Central Delhi', rating: 4.2 },
        { name: 'FabHotel Prime Epicuria', amenities: 'Modern Rooms, Free Breakfast, WiFi', rating: 4.0 },
        { name: 'Treebo Trend Ambassador', amenities: 'Comfortable Stays, Good Service, Clean', rating: 4.1 },
        { name: 'The Metropolitan Hotel & Spa', amenities: 'Spa Services, Business Center, Fine Dining', rating: 4.4 },
        { name: 'Hotel Diplomat', amenities: 'Karol Bagh, Shopping Area, Traditional Indian', rating: 4.3 },
        { name: 'Bloom Hotel', amenities: 'Contemporary Design, Rooftop Restaurant, Central Location', rating: 4.2 }
      ],
      luxury: [
        { name: 'The Imperial New Delhi', amenities: 'Heritage Hotel, Luxury Spa, Fine Dining', rating: 4.8 },
        { name: 'The Oberoi New Delhi', amenities: '5-Star Luxury, City Views, Premium Service', rating: 4.9 },
        { name: 'The Leela Palace New Delhi', amenities: 'Palace Architecture, Butler Service, Royal Experience', rating: 4.8 },
        { name: 'ITC Maurya Delhi', amenities: 'Diplomatic Enclave, Multiple Restaurants, Heritage', rating: 4.7 },
        { name: 'Shangri-La Eros New Delhi', amenities: 'Connaught Place, Luxury Shopping, Premium Dining', rating: 4.6 }
      ]
    },
    'mumbai': {
      budget: [
        { name: 'Zostel Mumbai', amenities: 'Backpacker Friendly, Events, WiFi', rating: 4.2 },
        { name: 'Hotel Sagar', amenities: 'Near Colaba, Budget Friendly, Clean', rating: 3.8 },
        { name: 'YMCA International House', amenities: 'Central Location, Gym, Restaurant', rating: 3.9 },
        { name: 'Backpacker Panda Fort', amenities: 'Social Hostel, Heritage District, Tours', rating: 4.1 },
        { name: 'Hotel City Palace', amenities: 'Budget Rooms, Near Station, Basic Amenities', rating: 3.7 },
        { name: 'Residency Hotel Fort', amenities: 'Business District, Clean Rooms, Good Value', rating: 4.0 }
      ],
      midrange: [
        { name: 'The Gordon House Hotel', amenities: 'Boutique Hotel, Stylish Rooms, Colaba', rating: 4.3 },
        { name: 'Hotel Marine Plaza', amenities: 'Sea View, Business Center, Restaurant', rating: 4.1 },
        { name: 'FabHotel Prime Seasons', amenities: 'Modern Amenities, Good Location, Service', rating: 4.0 },
        { name: 'Treebo Trend Harbour View', amenities: 'Harbor Views, Comfortable, Central', rating: 4.2 },
        { name: 'The Fern Residency', amenities: 'Eco-Friendly, Business Hotel, Central Mumbai', rating: 4.4 },
        { name: 'Hotel Diplomat Mumbai', amenities: 'Colaba Causeway, Shopping Area, Traditional Service', rating: 4.1 },
        { name: 'Astoria Hotel', amenities: 'Heritage Building, Central Location, Classic Rooms', rating: 4.3 }
      ],
      luxury: [
        { name: 'The Taj Mahal Palace Mumbai', amenities: 'Iconic Luxury, Heritage, Sea View', rating: 4.9 },
        { name: 'Four Seasons Hotel Mumbai', amenities: 'Ultra Luxury, Spa, Fine Dining', rating: 4.8 },
        { name: 'The Oberoi Mumbai', amenities: 'Nariman Point, Business District, Premium Service', rating: 4.8 },
        { name: 'Grand Hyatt Mumbai', amenities: 'Santacruz, Airport Hotel, Multiple Dining Options', rating: 4.6 },
        { name: 'ITC Maratha Mumbai', amenities: 'Andheri, Luxury Amenities, Business Hotel', rating: 4.7 }
      ]
    },
    'paris': {
      budget: [
        { name: 'MIJE Hostel', amenities: 'Historic Building, Breakfast, WiFi', rating: 4.0 },
        { name: 'Hotel des Jeunes', amenities: 'Central Paris, Budget, Clean', rating: 3.8 },
        { name: 'Three Ducks Hostel', amenities: 'Social Atmosphere, Tours, Kitchen', rating: 3.9 },
        { name: 'Hotel Nation Montmartre', amenities: 'Near Sacré-Cœur, Budget-Friendly, Clean Rooms', rating: 3.9 },
        { name: 'Hotel du Vieux Saule', amenities: 'Marais District, Boutique Style, Free WiFi', rating: 4.0 },
        { name: 'Best Western Premier Trocadéro', amenities: 'Near Eiffel Tower, Modern Amenities, 24h Reception', rating: 4.3 },
        { name: 'Hotel Malte Opera Budget', amenities: 'Opera District, Basic Comfort, Central Location', rating: 4.1 }
      ],
      midrange: [
        { name: 'Hotel Malte Opera', amenities: 'Opera District, Elegant, Breakfast', rating: 4.4 },
        { name: 'Hotel des Grands Boulevards', amenities: 'Boutique Hotel, Restaurant, Bar', rating: 4.3 },
        { name: 'Hotel Jeanne d\'Arc', amenities: 'Marais District, Historic, Charming', rating: 4.1 },
        { name: 'Best Western Premier Marais', amenities: 'Modern Comfort, Central, Business', rating: 4.2 },
        { name: 'Hotel de l\'Université', amenities: 'Saint-Germain, Antique Furnished, Quiet Location', rating: 4.4 },
        { name: 'Hotel des Saints-Pères', amenities: 'Left Bank, Garden Courtyard, Historic Charm', rating: 4.6 },
        { name: 'Hotel Bel Ami', amenities: 'Saint-Germain-des-Prés, Modern Design, Fitness Center', rating: 4.5 },
        { name: 'Hotel Villa Panthéon', amenities: 'Latin Quarter, Near Sorbonne, Business Center', rating: 4.3 }
      ],
      luxury: [
        { name: 'Le Meurice', amenities: 'Palace Hotel, Michelin Dining, Tuileries View', rating: 4.9 },
        { name: 'Hotel Plaza Athénée', amenities: 'Champs-Élysées, Haute Couture, Spa', rating: 4.8 },
        { name: 'The Ritz Paris', amenities: 'Place Vendôme, Legendary Luxury, Coco Chanel Suite', rating: 4.9 },
        { name: 'Le Bristol Paris', amenities: 'Faubourg Saint-Honoré, Michelin Stars, Rooftop Pool', rating: 4.8 },
        { name: 'Shangri-La Paris', amenities: 'Palace Hotel, Eiffel Tower Views, Asian Luxury', rating: 4.7 },
        { name: 'Hotel de Crillon', amenities: 'Place de la Concorde, Historic Palace, Rosewood', rating: 4.8 }
      ]
    },
    'london': {
      budget: [
        { name: 'Premier Inn London County Hall', amenities: 'Thames Views, Comfortable Beds, Near London Eye', rating: 4.2 },
        { name: 'Hub by Premier Inn London', amenities: 'Modern Compact Rooms, Tech-Enabled, Central', rating: 4.1 },
        { name: 'YHA London Central', amenities: 'Great Portland Street, Clean Hostel, Budget-Friendly', rating: 4.0 },
        { name: 'Generator London', amenities: 'Russell Square, Stylish Hostel, Social Spaces', rating: 4.2 },
        { name: 'Point A Hotel London', amenities: 'Multiple Locations, Efficient Design, Good Value', rating: 4.0 },
        { name: 'Travelodge London Central', amenities: 'Kings Cross, Basic Comfort, Free WiFi', rating: 3.9 }
      ],
      midrange: [
        { name: 'The Z Hotel Piccadilly', amenities: 'West End Location, Compact Luxury, Sky Lounge', rating: 4.4 },
        { name: 'Hotel Amano London', amenities: 'Covent Garden, Modern German Design, Restaurant', rating: 4.3 },
        { name: 'The Resident Covent Garden', amenities: 'Apartment-Style Suites, Kitchenette, Central', rating: 4.5 },
        { name: 'Henrietta Hotel', amenities: 'Covent Garden, Boutique Design, Italian Restaurant', rating: 4.4 },
        { name: 'The Hoxton Holborn', amenities: 'Victorian Building, Industrial Chic, Lobby Restaurant', rating: 4.6 },
        { name: 'Strand Palace Hotel', amenities: 'Historic Hotel, Theatre District, Traditional English', rating: 4.2 },
        { name: 'The Zetter Townhouse', amenities: 'Marylebone, Georgian Townhouse, Quirky Interiors', rating: 4.5 }
      ],
      luxury: [
        { name: 'Claridge\'s', amenities: 'Mayfair, Art Deco Elegance, Afternoon Tea', rating: 4.9 },
        { name: 'The Langham London', amenities: 'Regent Street, Victorian Grandeur, Roux Restaurant', rating: 4.8 },
        { name: 'Shangri-La At The Shard', amenities: 'Panoramic Views, Asian Hospitality, Infinity Pool', rating: 4.7 },
        { name: 'The Savoy', amenities: 'Strand, Legendary Hotel, American Bar, Thames Views', rating: 4.8 },
        { name: 'Corinthia London', amenities: 'Whitehall, Grand Hotel, ESPA Spa, Multiple Restaurants', rating: 4.7 },
        { name: 'The Connaught', amenities: 'Mayfair, Michelin Stars, Timeless Elegance, Butler Service', rating: 4.9 }
      ]
    },
    'tokyo': {
      budget: [
        { name: 'Khaosan World Asakusa', amenities: 'Traditional Area, Capsule Pods, Free WiFi', rating: 4.1 },
        { name: 'Hotel Gracery Shinjuku', amenities: 'Godzilla Hotel, Entertainment District', rating: 4.2 },
        { name: 'Sakura Hotel Hatagaya', amenities: 'Traditional Japanese, Budget-Friendly, English Staff', rating: 4.0 },
        { name: 'Hotel Villa Fontaine Tokyo-Shiodome', amenities: 'Business District, Compact Rooms, Good Location', rating: 4.1 },
        { name: 'APA Hotel Tokyo Shiomi-Ekimae', amenities: 'Near Station, Efficient Rooms, 24h Reception', rating: 3.9 },
        { name: 'Toyoko Inn Tokyo Shinagawa-eki', amenities: 'Station Access, Business Hotel, Free Breakfast', rating: 4.0 }
      ],
      midrange: [
        { name: 'Hotel Ryumeikan Tokyo', amenities: 'Near Tokyo Station, Business Hotel, Japanese Service', rating: 4.4 },
        { name: 'Mitsui Garden Hotel Ginza', amenities: 'Ginza Shopping, Modern Design, Central Location', rating: 4.3 },
        { name: 'Hotel East 21 Tokyo', amenities: 'Skytree Views, Multiple Restaurants, Large Rooms', rating: 4.2 },
        { name: 'Shinjuku Granbell Hotel', amenities: 'Entertainment District, Boutique Design, Nightlife Access', rating: 4.5 },
        { name: 'Hotel Metropolitan Tokyo Marunouchi', amenities: 'JR Tokyo Station, Business Luxury, Multiple Dining', rating: 4.6 },
        { name: 'Hotel Chinzanso Tokyo', amenities: 'Traditional Garden, Japanese Architecture, Spa', rating: 4.4 },
        { name: 'Keio Plaza Hotel Tokyo', amenities: 'Shinjuku Skyscrapers, City Views, Multiple Facilities', rating: 4.3 }
      ],
      luxury: [
        { name: 'The Ritz-Carlton Tokyo', amenities: 'Roppongi, Sky-High Luxury, Michelin Dining', rating: 4.9 },
        { name: 'Aman Tokyo', amenities: 'Minimalist Luxury, Otemachi, Traditional Japanese', rating: 4.8 },
        { name: 'Park Hyatt Tokyo', amenities: 'Shinjuku Park Tower, Lost in Translation Fame, City Views', rating: 4.7 },
        { name: 'Imperial Hotel Tokyo', amenities: 'Historic Luxury, Imperial Palace Views, Traditional Service', rating: 4.8 },
        { name: 'Mandarin Oriental Tokyo', amenities: 'Nihonbashi, Contemporary Luxury, Michelin Restaurants', rating: 4.7 },
        { name: 'The Peninsula Tokyo', amenities: 'Marunouchi, Rolls-Royce Fleet, Traditional Hospitality', rating: 4.8 }
      ]
    }
  };

  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  const basePrice = getBasePriceForDestination(destination, currency);
  const cityKey = destination.toLowerCase();
  const cityHotels = hotelDatabase[cityKey] || hotelDatabase['kerala']; // Default fallback
  
  const accommodations = [];
  
  // Generate budget options
  cityHotels.budget.forEach((hotel, index) => {
    const pricePerNight = Math.round(basePrice * (0.3 + Math.random() * 0.2));
    accommodations.push({
      category: 'Budget',
      name: hotel.name,
      amenities: hotel.amenities,
      pricePerNight,
      totalPrice: pricePerNight * nights,
      rating: hotel.rating,
      providers: Object.keys(accommodationProviders).slice(0, 4).map(provider => ({
        name: provider,
        price: Math.round(pricePerNight * nights * (0.95 + Math.random() * 0.1)),
        commission: accommodationProviders[provider].commission,
        bookingUrl: generateBookingUrl(provider, destination, checkIn, checkOut, guests, hotel.name),
        availability: Math.random() > 0.1 ? 'Available' : 'Limited'
      }))
    });
  });
  
  // Generate mid-range options
  cityHotels.midrange.forEach((hotel, index) => {
    const pricePerNight = Math.round(basePrice * (0.6 + Math.random() * 0.4));
    accommodations.push({
      category: 'Mid-Range',
      name: hotel.name,
      amenities: hotel.amenities,
      pricePerNight,
      totalPrice: pricePerNight * nights,
      rating: hotel.rating,
      providers: Object.keys(accommodationProviders).slice(0, 5).map(provider => ({
        name: provider,
        logo: accommodationProviders[provider].logo,
        price: Math.round(pricePerNight * nights * (0.95 + Math.random() * 0.1)),
        commission: accommodationProviders[provider].commission,
        commissionAmount: Math.round((pricePerNight * nights * (0.95 + Math.random() * 0.1)) * accommodationProviders[provider].commission / 100),
        bookingUrl: generateBookingUrl(provider, destination, checkIn, checkOut, guests, hotel.name),
        availability: Math.random() > 0.05 ? 'Available' : 'Limited',
        reliability: accommodationProviders[provider].reliability
      }))
    });
  });
  
  // Generate luxury options
  cityHotels.luxury.forEach((hotel, index) => {
    const pricePerNight = Math.round(basePrice * (2 + Math.random() * 2));
    accommodations.push({
      category: 'Luxury',
      name: hotel.name,
      amenities: hotel.amenities,
      pricePerNight,
      totalPrice: pricePerNight * nights,
      rating: hotel.rating,
      providers: Object.keys(accommodationProviders).map(provider => ({
        name: provider,
        logo: accommodationProviders[provider].logo,
        price: Math.round(pricePerNight * nights * (0.95 + Math.random() * 0.1)),
        commission: accommodationProviders[provider].commission,
        commissionAmount: Math.round((pricePerNight * nights * (0.95 + Math.random() * 0.1)) * accommodationProviders[provider].commission / 100),
        bookingUrl: generateBookingUrl(provider, destination, checkIn, checkOut, guests, hotel.name),
        availability: 'Available',
        reliability: accommodationProviders[provider].reliability
      }))
    });
  });

  // Sort accommodations by total price
  accommodations.sort((a, b) => a.totalPrice - b.totalPrice);
  
  return {
    destination,
    checkIn,
    checkOut,
    nights,
    guests,
    currency,
    symbol: currencySymbols[currency] || currency,
    accommodations,
    searchTimestamp: new Date().toISOString(),
    totalResults: accommodations.length
  };
}

function getBasePriceForDestination(destination, currency) {
  const basePrices = {
    USD: { 
      'paris': 120, 'london': 110, 'tokyo': 100, 'new york': 140, 
      'mumbai': 50, 'delhi': 45, 'bangkok': 40, 'kerala': 55, 
      'goa': 60, 'rajasthan': 50, 'jaipur': 45, 'udaipur': 70
    },
    EUR: { 
      'paris': 100, 'london': 95, 'tokyo': 85, 'new york': 120, 
      'mumbai': 42, 'delhi': 38, 'bangkok': 34, 'kerala': 46, 
      'goa': 50, 'rajasthan': 42, 'jaipur': 38, 'udaipur': 58
    },
    GBP: { 
      'paris': 85, 'london': 80, 'tokyo': 72, 'new york': 102, 
      'mumbai': 36, 'delhi': 32, 'bangkok': 29, 'kerala': 39, 
      'goa': 42, 'rajasthan': 36, 'jaipur': 32, 'udaipur': 49
    },
    INR: { 
      'paris': 8500, 'london': 8000, 'tokyo': 7200, 'new york': 10200, 
      'mumbai': 3500, 'delhi': 3000, 'bangkok': 2800, 'kerala': 4000, 
      'goa': 4500, 'rajasthan': 3500, 'jaipur': 3000, 'udaipur': 5500
    }
  };
  
  const cityPrices = basePrices[currency] || basePrices.USD;
  const cityKey = destination.toLowerCase();
  
  // Check for exact matches first
  if (cityPrices[cityKey]) {
    return cityPrices[cityKey];
  }
  
  // Check for partial matches
  for (const city in cityPrices) {
    if (cityKey.includes(city) || city.includes(cityKey)) {
      return cityPrices[city];
    }
  }
  
  // Default based on currency
  return currency === 'INR' ? 4000 : currency === 'USD' ? 80 : currency === 'EUR' ? 65 : 55;
}

// API endpoint for accommodation price comparison
app.post('/api/accommodations', async (req, res) => {
  try {
    const { destination, checkIn, checkOut, guests, currency, tripDuration } = req.body;
    
    if (!destination || !checkIn || !checkOut || !guests || !currency) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    console.log(`Searching accommodations for ${destination}, ${checkIn} to ${checkOut}, ${guests} guests, ${tripDuration || 'unknown'} day trip`);
    
    const accommodationData = await getAccommodationPrices(destination, checkIn, checkOut, guests, currency, tripDuration);
    
    // Check if there was a date validation error
    if (accommodationData.error) {
      return res.status(400).json({
        success: false,
        error: accommodationData.message,
        suggestedCheckOut: accommodationData.suggestedCheckOut,
        minCheckOut: accommodationData.minCheckOut
      });
    }
    
    // Calculate total commission earnings for TravelAI Pro
    let totalCommissionEarnings = 0;
    accommodationData.accommodations.forEach(accommodation => {
      accommodation.providers.forEach(provider => {
        totalCommissionEarnings += provider.commissionAmount || 0;
      });
    });
    
    res.json({
      success: true,
      data: {
        ...accommodationData,
        commissionSummary: {
          totalPotentialEarnings: Math.round(totalCommissionEarnings / accommodationData.accommodations.length),
          averageCommissionRate: '3.0%',
          trackingId: 'travelai_pro_001',
          note: 'Commission earned when bookings are completed through our platform'
        }
      },
      message: 'Accommodation prices fetched successfully with commission tracking'
    });
  } catch (error) {
    console.error('Error fetching accommodation prices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch accommodation prices',
      details: error.message 
    });
  }
});

// Commission tracking endpoint
app.post('/api/track-booking', async (req, res) => {
  try {
    const { provider, bookingUrl, accommodationName, totalPrice, commission, userId } = req.body;
    
    // In production, save to database
    const bookingTracking = {
      id: Date.now().toString(),
      provider,
      bookingUrl,
      accommodationName,
      totalPrice,
      expectedCommission: (totalPrice * commission / 100).toFixed(2),
      commissionRate: commission,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    console.log('Booking tracked:', bookingTracking);
    
    res.json({
      success: true,
      trackingId: bookingTracking.id,
      expectedCommission: bookingTracking.expectedCommission,
      redirectUrl: bookingUrl
    });
  } catch (error) {
    console.error('Error tracking booking:', error);
    res.status(500).json({ error: 'Failed to track booking' });
  }
});
async function generateAIItinerary(destination, budget, duration, currency, travelWith, userLocation, needAccommodation) {
  try {
    // Use the location service to create detailed itinerary with specific places
    const detailedItinerary = createDetailedItinerary(destination, duration, budget, currency, travelWith);
    
    // Try Hugging Face free inference API for additional insights
    const prompt = `Enhance this travel plan for ${destination} with local tips and cultural insights for ${travelWith} travelers`;
    
    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
        { 
          inputs: prompt,
          parameters: { max_length: 300, temperature: 0.7 }
        },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );
      
      if (response.data && response.data[0]?.generated_text) {
        // Combine detailed itinerary with AI insights
        return detailedItinerary + '\n\nLOCAL TIPS & INSIGHTS\n\n' + response.data[0].generated_text;
      }
    } catch (aiError) {
      console.log('AI service unavailable, using detailed location-based itinerary');
    }
    
    // Return the detailed location-based itinerary
    return detailedItinerary;
  } catch (error) {
    console.log('AI service unavailable, using enhanced professional generator');
    return generateProfessionalItinerary(destination, budget, duration, currency, travelWith, userLocation, needAccommodation);
  }
}

// Enhanced professional itinerary generator with specific places and locations
function generateProfessionalItinerary(destination, budget, duration, currency, travelWith, userLocation, needAccommodation) {
  // Use the location service to get specific places
  const places = getPlacesByCity(destination);
  
  // If no specific data found, create a generic but detailed plan
  if (!places || Object.keys(places).length === 0) {
    return createDetailedItinerary(destination, duration, budget, currency, travelWith);
  }
  
  // Create detailed plan with specific places
  return createDetailedItinerary(destination, duration, budget, currency, travelWith);
}

app.post('/api/plan', async (req, res) => {
  const { fullName, destination, budget, duration, currency, travelWith, userLocation, needAccommodation } = req.body;
  try {
    console.log(`Generating itinerary for ${fullName || 'Guest'} - ${destination}, ${duration} days, ${budget} ${currency}, traveling with ${travelWith}`);
    
    // Try Hugging Face API first, fallback to enhanced generator
    const plan = await generateAIItinerary(destination, budget, duration, currency, travelWith, userLocation, needAccommodation);
    
    res.json({ 
      fullName: fullName || 'Guest',
      destination, 
      budget, 
      duration,
      currency,
      travelWith,
      userLocation,
      needAccommodation,
      plan,
      generated_by: 'Professional Travel Planner AI'
    });
  } catch (err) {
    console.error('Error generating itinerary:', err);
    res.status(500).json({ error: 'Failed to generate itinerary. Please try again.' });
  }
});

// API endpoint to get specific places based on requirements
app.get('/api/places/:destination', async (req, res) => {
  try {
    const { destination } = req.params;
    const { requirement } = req.query;
    
    console.log(`Getting places for ${destination} with requirement: ${requirement}`);
    
    if (requirement) {
      const places = getPlacesByRequirement(destination, requirement);
      res.json({
        success: true,
        destination,
        requirement,
        places,
        total: places.length
      });
    } else {
      const allPlaces = getPlacesByCity(destination);
      res.json({
        success: true,
        destination,
        places: allPlaces,
        categories: Object.keys(allPlaces)
      });
    }
  } catch (error) {
    console.error('Error getting places:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get places',
      message: error.message 
    });
  }
});

// Email service configuration with SMTP2GO fallback
let transporter;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_USER !== 'your-email@gmail.com') {
  console.log('Initializing email service with user:', process.env.EMAIL_USER);
  
  // Check if we should use SMTP2GO as fallback
  const useSmtp2Go = process.env.SMTP2GO_API_KEY || false;
  
  if (useSmtp2Go) {
    // SMTP2GO configuration (more reliable for cloud hosting)
    console.log('Using SMTP2GO service for better deliverability');
    transporter = nodemailer.createTransport({
      host: 'mail.smtp2go.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP2GO_USERNAME || process.env.EMAIL_USER,
        pass: process.env.SMTP2GO_PASSWORD || process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } else {
    // Direct SMTP configuration (bypassing Gmail service detection)
    console.log('Using direct SMTP configuration for Gmail');
    console.log('📧 Gmail Account:', process.env.EMAIL_USER);
    console.log('📧 Password Type:', process.env.EMAIL_PASSWORD ? (process.env.EMAIL_PASSWORD.includes(' ') ? 'App Password (16 chars with spaces) ✅' : 'Regular Password (may need App Password) ⚠️') : 'Not Set ❌');
    
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false,
        servername: 'smtp.gmail.com'
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      requireTLS: true,
      debug: false,
      logger: false
    });
  }
  
  // Simple connection test without blocking startup
  setTimeout(async () => {
    try {
      console.log('🔍 Testing email service connection...');
      await transporter.verify();
      console.log('✅ Email service ready');
    } catch (error) {
      console.log('⚠️ Email verification failed, but service will still attempt sending:', error.message);
    }
  }, 5000);
} else {
  // Development mode - Create test account or mock transporter
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('=== EMAIL SENT (DEVELOPMENT MODE) ===');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Attachments:', mailOptions.attachments?.length || 0, 'files');
      console.log('=====================================');
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        messageId: 'dev_' + Date.now(),
        response: 'Email sent in development mode'
      };
    }
  };
}

// Function to format itinerary content for professional structured PDF display
function formatStructuredItineraryForPDF(itinerary, duration, destination = '') {
  const lines = itinerary.split('\n').filter(line => line.trim());
  let html = '';
  let currentDay = 0;
  let dayActivities = [];
  
  // Parse itinerary into structured day data
  const days = [];
  let currentDayData = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this line contains a day header
    if (line.match(/^DAY\s*\d+/i) || line.includes('Day ')) {
      // Save previous day if exists
      if (currentDayData) {
        days.push(currentDayData);
      }
      
      currentDay++;
      currentDayData = {
        day: currentDay,
        title: line.replace(/^\*\*|\*\*$/g, '').trim(),
        activities: []
      };
    }
    // Parse activity lines
    else if (line.length > 0 && !line.includes('═══') && currentDayData) {
      const cleanLine = line.replace(/^\*\*|\*\*$/g, '').replace(/^[\-\•\*]\s*/, '').trim();
      
      if (cleanLine.length > 0) {
        // Extract time, activity type, and description
        const timeMatch = cleanLine.match(/^(\d{1,2}:\d{2}(\s*(AM|PM))?|\d{1,2}(AM|PM))/i);
        let time = timeMatch ? timeMatch[0] : '';
        let remaining = timeMatch ? cleanLine.substring(timeMatch[0].length).trim() : cleanLine;
        
        // Determine activity type based on content
        let activityType = 'general';
        if (remaining.toLowerCase().includes('breakfast') || remaining.toLowerCase().includes('morning')) {
          activityType = 'morning';
        } else if (remaining.toLowerCase().includes('lunch') || remaining.toLowerCase().includes('afternoon')) {
          activityType = 'afternoon';
        } else if (remaining.toLowerCase().includes('dinner') || remaining.toLowerCase().includes('evening') || remaining.toLowerCase().includes('night')) {
          activityType = 'evening';
        }
        
        // Extract activity title and description
        let title = '';
        let description = '';
        let location = '';
        
        if (remaining.includes(':')) {
          const parts = remaining.split(':');
          title = parts[0].trim();
          description = parts.slice(1).join(':').trim();
        } else {
          title = remaining;
        }
        
        // Enhanced location extraction from multiple patterns
        const locationPatterns = [
          /at\s+([^-()]+?)(?:\s*[-())]|$)/i,
          /in\s+([^-()]+?)(?:\s*[-())]|$)/i,
          /visit\s+([^-()]+?)(?:\s*[-())]|$)/i,
          /to\s+([^-()]+?)(?:\s*[-())]|$)/i,
          /near\s+([^-()]+?)(?:\s*[-())]|$)/i
        ];
        
        for (const pattern of locationPatterns) {
          const match = remaining.match(pattern);
          if (match && !location) {
            location = match[1].trim();
            break;
          }
        }
        
        // Also check for well-known landmarks and places in description
        const landmarkPatterns = [
          /(Times Square|Central Park|Statue of Liberty|Brooklyn Bridge|Empire State Building|One World Trade Center)/i,
          /(Eiffel Tower|Louvre Museum|Notre Dame|Arc de Triomphe|Champs-Élysées)/i,
          /(Big Ben|Tower of London|Buckingham Palace|Westminster Abbey|London Eye)/i,
          /(Tokyo Tower|Shibuya Crossing|Senso-ji Temple|Mount Fuji|Golden Pavilion)/i,
          /(Red Square|Kremlin|St\. Basil's Cathedral|Hermitage Museum)/i,
          /(Colosseum|Vatican City|Trevi Fountain|Spanish Steps|Pantheon)/i
        ];
        
        for (const pattern of landmarkPatterns) {
          const match = remaining.match(pattern);
          if (match && !location) {
            location = match[1].trim();
            break;
          }
        }
        
        currentDayData.activities.push({
          time: time || getDefaultTimeForType(activityType, currentDayData.activities.length),
          type: activityType,
          title: title || 'Activity',
          description: description,
          location: location
        });
      }
    }
  }
  
  // Add the last day
  if (currentDayData) {
    days.push(currentDayData);
  }
  
  // If no structured days found, create default structure
  if (days.length === 0) {
    for (let d = 1; d <= duration; d++) {
      const dayActivities = getDefaultActivitiesForDestination(destination, d);
      days.push({
        day: d,
        title: `Day ${d} - ${getDefaultDayTitle(d)}`,
        activities: dayActivities
      });
    }
  }
  
  // Generate HTML for each day with professional table structure
  days.forEach((day, index) => {
    html += `
      <div class="day-container">
        <div class="day-header">
          <div class="day-title">
            📅 ${day.title}
          </div>
          <div class="day-meta">
            Day ${day.day} of ${duration}
          </div>
        </div>
        
        <table class="itinerary-table">
          <thead class="table-header">
            <tr>
              <th style="width: 15%;">Time</th>
              <th style="width: 20%;">Activity Type</th>
              <th style="width: 30%;">Activity</th>
              <th style="width: 35%;">Details & Location</th>
            </tr>
          </thead>
          <tbody>`;
    
    day.activities.forEach((activity) => {
      const typeClass = `type-${activity.type}`;
      
      // Enhanced Google Maps URL generation with destination context
      let mapUrl = '';
      let locationText = '';
      
      if (activity.location) {
        locationText = activity.location;
        
        // Get the destination from the outer scope to add context
        const destinationContext = destination || '';
        
        // Clean location for better map results
        const cleanLocation = activity.location
          .replace(/[^\w\s,.-]/g, '') // Remove special chars except common ones
          .trim();
        
        // Create a more specific search query with destination context
        let searchQuery = cleanLocation;
        
        // Add destination context if the location doesn't already include it
        if (!cleanLocation.toLowerCase().includes(destinationContext.toLowerCase()) && destinationContext) {
          searchQuery = `${cleanLocation}, ${destinationContext}`;
        }
        
        // Use the standard Google Maps search URL
        mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
      }
      
      // Also try to extract location from title or description if not found
      if (!mapUrl && (activity.title || activity.description)) {
        const searchText = `${activity.title} ${activity.description}`.toLowerCase();
        
        // Look for common location indicators
        const locationKeywords = [
          'museum', 'park', 'tower', 'bridge', 'cathedral', 'palace', 'square', 
          'temple', 'castle', 'market', 'restaurant', 'cafe', 'hotel', 'beach',
          'downtown', 'center', 'district', 'quarter', 'street', 'avenue'
        ];
        
        const hasLocationKeyword = locationKeywords.some(keyword => searchText.includes(keyword));
        
        if (hasLocationKeyword) {
          const destinationContext = destination || '';
          const searchQuery = `${activity.title}, ${destinationContext}`;
          mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
          locationText = activity.title;
        }
      }
      
      html += `
            <tr>
              <td class="time-slot">${activity.time}</td>
              <td>
                <div class="activity-type ${typeClass}">${activity.type}</div>
              </td>
              <td>
                <div class="activity-title">${activity.title}</div>
              </td>
              <td>
                ${activity.description ? `<div class="activity-description">${activity.description}</div>` : ''}
                ${mapUrl ? `
                  <div class="activity-location">📍 ${locationText}</div>
                  <a href="${mapUrl}" target="_blank" class="google-link" title="Open ${locationText} in Google Maps">🗺️ View on Google Maps</a>
                ` : ''}
              </td>
            </tr>`;
    });
    
    html += `
          </tbody>
        </table>
      </div>`;
  });
  
  return html;
}

// Helper functions for structured formatting
function getDefaultTimeForType(type, index) {
  const timeSlots = {
    morning: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'],
    afternoon: ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
    evening: ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM']
  };
  
  const slots = timeSlots[type] || timeSlots.morning;
  return slots[index % slots.length] || slots[0];
}

function getDefaultDayTitle(dayNumber) {
  const titles = [
    'Arrival & Exploration',
    'Cultural Immersion', 
    'Adventure & Activities',
    'Local Experiences',
    'Hidden Gems',
    'Relaxation & Leisure',
    'Departure & Memories'
  ];
  
  return titles[(dayNumber - 1) % titles.length];
}

// Generate location-specific activities with real places
function getDefaultActivitiesForDestination(destination, dayNumber) {
  const dest = destination.toLowerCase();
  
  // Location-specific attractions and activities
  const locationData = {
    'new york': {
      attractions: ['Times Square', 'Central Park', 'Statue of Liberty', 'Brooklyn Bridge', 'Empire State Building', 'High Line Park', 'One World Observatory'],
      restaurants: ['Katz\'s Delicatessen', 'Joe\'s Pizza', 'The Halal Guys', 'Levain Bakery', 'Serendipity 3'],
      areas: ['Manhattan', 'Brooklyn', 'Greenwich Village', 'SoHo', 'Chinatown']
    },
    'paris': {
      attractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Arc de Triomphe', 'Champs-Élysées', 'Montmartre', 'Seine River Cruise'],
      restaurants: ['Café de Flore', 'L\'As du Fallafel', 'Breizh Café', 'Pierre Hermé', 'Angelina'],
      areas: ['Marais District', 'Latin Quarter', 'Saint-Germain', 'Montparnasse', 'Le Marais']
    },
    'london': {
      attractions: ['Big Ben', 'Tower of London', 'Buckingham Palace', 'London Eye', 'Westminster Abbey', 'Tower Bridge', 'British Museum'],
      restaurants: ['Borough Market', 'Dishoom', 'Sketch', 'The Ivy', 'Fortnum & Mason'],
      areas: ['Covent Garden', 'Camden Market', 'Notting Hill', 'Shoreditch', 'South Bank']
    },
    'tokyo': {
      attractions: ['Tokyo Tower', 'Senso-ji Temple', 'Shibuya Crossing', 'Meiji Shrine', 'Tokyo Skytree', 'Tsukiji Fish Market', 'Imperial Palace'],
      restaurants: ['Sushi Dai', 'Ramen Yokocho', 'Genki Sushi', 'Ichiran Ramen', 'Takoyaki Museum'],
      areas: ['Shibuya', 'Harajuku', 'Ginza', 'Akihabara', 'Roppongi']
    }
  };
  
  // Default fallback data
  const defaultData = {
    attractions: ['City Center', 'Main Square', 'Historic District', 'Cultural Museum', 'Local Park', 'Scenic Viewpoint'],
    restaurants: ['Local Restaurant', 'Traditional Cuisine', 'Popular Café', 'Street Food Market'],
    areas: ['Downtown', 'Old Town', 'Cultural Quarter', 'Entertainment District']
  };
  
  const data = locationData[dest] || defaultData;
  
  // Generate activities based on day number
  const activities = [];
  const attractionIndex = (dayNumber - 1) % data.attractions.length;
  const restaurantIndex = (dayNumber - 1) % data.restaurants.length;
  const areaIndex = (dayNumber - 1) % data.areas.length;
  
  activities.push({
    time: '9:00 AM',
    type: 'morning',
    title: `Visit ${data.attractions[attractionIndex]}`,
    description: 'Explore this iconic landmark and learn about its history and significance',
    location: data.attractions[attractionIndex]
  });
  
  activities.push({
    time: '1:00 PM',
    type: 'afternoon', 
    title: `Lunch at ${data.restaurants[restaurantIndex]}`,
    description: 'Experience authentic local cuisine and flavors',
    location: data.restaurants[restaurantIndex]
  });
  
  activities.push({
    time: '7:00 PM',
    type: 'evening',
    title: `Evening in ${data.areas[areaIndex]}`,
    description: 'Explore the local nightlife, shops, and evening entertainment',
    location: data.areas[areaIndex]
  });
  
  return activities;
}





// Create professional HTML document from itinerary
async function createItineraryDocument(itinerary, destination, duration, fullName = 'Guest') {
  const fileName = `${destination.replace(/\s+/g, '_').toLowerCase()}_${duration}days_itinerary.pdf`;
  const filePath = path.join(__dirname, 'documents', fileName);
  
  // Ensure documents directory exists
  if (!fs.existsSync(path.join(__dirname, 'documents'))) {
    fs.mkdirSync(path.join(__dirname, 'documents'), { recursive: true });
  }
  
  // Clean and format itinerary content more efficiently
  const cleanItinerary = itinerary
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/=\d{2}/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${destination} Travel Itinerary - ${fullName} | TravelAI Pro</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', 'Arial', sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #1a202c;
            background: #ffffff;
        }
        
        .container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
        }
        
        /* Professional Header with Company Navbar */
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px 30px;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        }
        
        .header-content {
            position: relative;
            z-index: 2;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .company-navbar {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .company-logo {
            font-size: 28pt;
            font-weight: 800;
            letter-spacing: -1px;
        }
        
        .company-info {
            display: flex;
            flex-direction: column;
        }
        
        .company-name {
            font-size: 24pt;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin-bottom: 2px;
        }
        
        .company-tagline {
            font-size: 11pt;
            opacity: 0.9;
            font-weight: 400;
            font-style: italic;
        }
        
        .header-meta {
            text-align: right;
            font-size: 9pt;
            opacity: 0.85;
        }
        
        /* Trip Title Section */
        .trip-title {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 25px 30px;
            border-bottom: 3px solid #667eea;
            text-align: center;
        }
        
        .trip-title h1 {
            font-size: 28pt;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        
        .trip-subtitle {
            font-size: 14pt;
            color: #4a5568;
            font-weight: 500;
        }
        
        .traveler-badge {
            display: inline-block;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            padding: 8px 20px;
            border-radius: 25px;
            font-size: 11pt;
            font-weight: 600;
            margin-top: 10px;
            box-shadow: 0 2px 8px rgba(72, 187, 120, 0.3);
        }
        
        /* Trip Overview Cards */
        .trip-overview {
            padding: 25px 30px;
            background: #f7fafc;
        }
        
        .overview-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
        }
        
        .overview-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            position: relative;
            overflow: hidden;
        }
        
        .overview-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
        }
        
        .card-icon {
            font-size: 24pt;
            margin-bottom: 10px;
            display: block;
        }
        
        .card-label {
            color: #718096;
            font-size: 9pt;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        
        .card-value {
            color: #2d3748;
            font-size: 13pt;
            font-weight: 700;
        }
        
        /* Day Itinerary Tables */
        .itinerary-section {
            padding: 20px;
        }
        
        .day-container {
            margin-bottom: 20px;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        /* Compact layout for 7-day trips */
        @media screen and (max-width: 768px) {
            .day-container {
                margin-bottom: 15px;
            }
            
            .itinerary-section {
                padding: 10px;
            }
        }
        
        .day-header {
            background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
        }
        
        .day-header::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 20px;
            right: 20px;
            height: 8px;
            background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
            border-radius: 0 0 8px 8px;
        }
        
        .day-title {
            font-size: 16pt;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .day-meta {
            font-size: 10pt;
            opacity: 0.9;
        }
        
        /* Structured Table */
        .itinerary-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 12px 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        .table-header {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border-bottom: 2px solid #e2e8f0;
        }
        
        .table-header th {
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
            font-size: 9pt;
            color: #4a5568;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-right: 1px solid #e2e8f0;
        }
        
        .table-header th:last-child {
            border-right: none;
        }
        
        .itinerary-table tbody tr {
            border-bottom: 1px solid #f1f5f9;
            transition: background-color 0.2s ease;
        }
        
        .itinerary-table tbody tr:hover {
            background-color: #f8fafc;
        }
        
        .itinerary-table tbody tr:last-child {
            border-bottom: none;
        }
        
        .itinerary-table td {
            padding: 15px;
            vertical-align: top;
            border-right: 1px solid #f1f5f9;
            font-size: 9pt;
            line-height: 1.5;
        }
        
        .itinerary-table td:last-child {
            border-right: none;
        }
        
        .time-slot {
            font-weight: 700;
            color: #2d3748;
            font-size: 10pt;
            min-width: 80px;
        }
        
        .activity-type {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 8pt;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 5px;
        }
        
        .type-morning {
            background: linear-gradient(135deg, #fed7d7 0%, #fbb6ce 100%);
            color: #c53030;
        }
        
        .type-afternoon {
            background: linear-gradient(135deg, #feebc8 0%, #fbd38d 100%);
            color: #dd6b20;
        }
        
        .type-evening {
            background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%);
            color: #38a169;
        }
        
        .activity-title {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 4px;
            font-size: 10pt;
        }
        
        .activity-description {
            color: #4a5568;
            margin-bottom: 6px;
            line-height: 1.4;
        }
        
        .activity-location {
            color: #3182ce;
            font-size: 8pt;
            font-weight: 500;
        }
        
        .google-link {
            display: inline-block;
            background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
            color: #3182ce !important;
            text-decoration: underline;
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 8pt;
            font-weight: 600;
            margin-top: 6px;
            border: 2px solid #3182ce;
            cursor: pointer;
            transition: all 0.2s ease;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .google-link:hover {
            background: #3182ce;
            color: white !important;
            text-decoration: none;
        }
        
        .google-link:visited {
            color: #3182ce !important;
        }
        
        .google-link::before {
            content: "";
            margin-right: 0px;
        }
        
        /* Professional Footer with Terms */
        .footer {
            background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
            color: white;
            padding: 25px 30px;
            margin-top: 30px;
        }
        
        .footer-brand {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .footer-brand h2 {
            font-size: 18pt;
            font-weight: 700;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .footer-contact {
            text-align: center;
            font-size: 10pt;
            margin-bottom: 20px;
        }
        
        .contact-email {
            color: #63b3ed;
            text-decoration: none;
            font-weight: 600;
        }
        
        .contact-email:hover {
            color: #90cdf4;
            text-decoration: underline;
        }
        
        .terms-section {
            border-top: 1px solid #4a5568;
            padding-top: 20px;
            font-size: 8pt;
            line-height: 1.5;
        }
        
        .terms-title {
            font-weight: 600;
            margin-bottom: 10px;
            color: #e2e8f0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .terms-content {
            color: #a0aec0;
            margin-bottom: 15px;
        }
        
        .footer-meta {
            text-align: center;
            font-size: 7pt;
            opacity: 0.6;
            border-top: 1px solid #4a5568;
            padding-top: 15px;
        }
        
        /* Print Optimizations */
        @media print {
            body {
                font-size: 8pt;
                line-height: 1.2;
            }
            
            .day-container {
                page-break-inside: avoid;
                margin-bottom: 15px;
            }
            
            /* Force 2-page layout for 7-day trips */
            .day-container:nth-child(4) {
                page-break-before: always;
            }
            
            .itinerary-table {
                page-break-inside: avoid;
            }
            
            .itinerary-table td {
                padding: 8px;
                font-size: 7pt;
            }
            
            .footer {
                page-break-before: auto;
                margin-top: 10px;
            }
        }
        
        @page {
            margin: 0.5in;
            size: A4;
        }
        
        /* Mobile optimizations */
        @media screen and (max-width: 768px) {
            .overview-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }
            
            .itinerary-table th,
            .itinerary-table td {
                padding: 8px;
                font-size: 8pt;
            }
            
            .header {
                padding: 15px 20px;
            }
            
            .company-name {
                font-size: 18pt;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Professional Header with Company Navbar -->
        <div class="header">
            <div class="header-content">
                <div class="company-navbar">
                    <div class="company-logo">🌍</div>
                    <div class="company-info">
                        <div class="company-name">TravelAI Pro</div>
                        <div class="company-tagline">AI-Powered Professional Travel Planning Solutions</div>
                    </div>
                </div>
                <div class="header-meta">
                    <div>Generated: ${new Date().toLocaleDateString()}</div>
                    <div>Document ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                </div>
            </div>
        </div>
        
        <!-- Trip Title Section -->
        <div class="trip-title">
            <h1>${destination} Travel Itinerary</h1>
            <div class="trip-subtitle">${duration} Days Professional Travel Plan</div>
            <div class="traveler-badge">👤 Prepared for: ${fullName}</div>
        </div>
        
        <!-- Trip Overview -->
        <div class="trip-overview">
            <div class="overview-grid">
                <div class="overview-card">
                    <span class="card-icon">🎯</span>
                    <div class="card-label">Destination</div>
                    <div class="card-value">${destination}</div>
                </div>
                <div class="overview-card">
                    <span class="card-icon">📅</span>
                    <div class="card-label">Duration</div>
                    <div class="card-value">${duration} Days</div>
                </div>
                <div class="overview-card">
                    <span class="card-icon">👤</span>
                    <div class="card-label">Traveler</div>
                    <div class="card-value">${fullName}</div>
                </div>
                <div class="overview-card">
                    <span class="card-icon">🤖</span>
                    <div class="card-label">Powered By</div>
                    <div class="card-value">AI Planning</div>
                </div>
            </div>
        </div>
        
        <!-- Structured Itinerary -->
        <div class="itinerary-section">
            ${formatStructuredItineraryForPDF(cleanItinerary, duration, destination)}
        </div>
        
        <!-- Professional Footer -->
        <div class="footer">
            <div class="footer-brand">
                <h2>🌍 TravelAI Pro</h2>
                <div class="footer-contact">
                    📧 Contact: <a href="mailto:help.travel.ai@gmail.com" class="contact-email">help.travel.ai@gmail.com</a> | 
                    🌐 Professional AI-Powered Travel Solutions
                </div>
            </div>
            
            <div class="terms-section">
                <div class="terms-title">Terms & Conditions</div>
                <div class="terms-content">
                    This travel itinerary is generated using advanced AI technology and is provided for informational purposes. 
                    Please verify all details including timings, availability, and prices before making reservations. 
                    TravelAI Pro is not responsible for changes in venue hours, closures, or pricing. 
                    We recommend purchasing travel insurance and checking local regulations before travel. 
                    All recommendations are suggestions based on AI analysis and may not reflect current conditions.
                </div>
                <div class="terms-content">
                    For support, assistance, or custom itinerary modifications, please contact our team at 
                    <a href="mailto:help.travel.ai@gmail.com" class="contact-email">help.travel.ai@gmail.com</a>. 
                    We're committed to providing exceptional AI-powered travel planning experiences.
                </div>
            </div>
            
            <div class="footer-meta">
                © 2025 TravelAI Pro. All rights reserved. | This professional itinerary was generated for ${fullName} using cutting-edge AI technology.
            </div>
        </div>
    </div>
</body>
</html>`;

  // Optimized PDF generation options for much faster processing
  try {
    const options = {
      format: 'A4',
      border: {
        top: '0.4in',
        right: '0.4in',
        bottom: '0.4in',
        left: '0.4in'
      },
      displayHeaderFooter: false,
      printBackground: true,
      preferCSSPageSize: true,
      // Performance optimizations
      timeout: 10000, // Reduced from 30s to 10s
      quality: 70, // Reduced quality for faster generation
      type: 'pdf',
      renderDelay: 200 // Reduced render delay significantly
    };

    const file = { content: htmlContent };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    // Save PDF to file
    fs.writeFileSync(filePath, pdfBuffer);
    
    console.log(`✅ PDF created successfully: ${fileName}`);
    return { fileName, filePath };
    
  } catch (error) {
    console.error('❌ Error creating PDF:', error);
    
    // Fallback: create HTML file if PDF generation fails
    const htmlFileName = `${destination.replace(/\s+/g, '_')}_${duration}days_itinerary.html`;
    const htmlFilePath = path.join(__dirname, 'documents', htmlFileName);
    
    fs.writeFileSync(htmlFilePath, htmlContent);
    console.log(`⚠️ Fallback: HTML file created instead: ${htmlFileName}`);
    
    return { fileName: htmlFileName, filePath: htmlFilePath };
  }
}
// Send itinerary via email
app.post('/api/send-itinerary', async (req, res) => {
  try {
    const { email, itinerary, destination, duration, fullName, userInfo } = req.body;
    
    console.log('📧 Email request received:', { email, destination, duration });
    console.log('📧 Environment check:', {
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPassword: !!process.env.EMAIL_PASSWORD,
      emailUserValue: process.env.EMAIL_USER,
      passwordLength: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0,
      isProduction: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_USER !== 'your-email@gmail.com')
    });
    
    // Test transporter configuration
    if (transporter && transporter.options) {
      console.log('📧 Transporter config:', {
        service: transporter.options.service,
        host: transporter.options.host,
        port: transporter.options.port,
        secure: transporter.options.secure,
        authUser: transporter.options.auth?.user
      });
    }
    
    if (!email || !itinerary) {
      return res.status(400).json({ error: 'Email and itinerary are required' });
    }
    
    // Fix duration issue - default to reasonable value if null
    const safeDuration = duration || 3;
    const safeDestination = destination || 'Unknown Destination';
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Create document first
    console.log('📄 Creating PDF document...');
    const { fileName, filePath } = await createItineraryDocument(itinerary, safeDestination, safeDuration, fullName || 'Guest');
    console.log('📄 PDF created:', fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('PDF document creation failed');
    }
    
    // Email template
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #81C784 0%, #66BB6A 100%); color: white; padding: 30px; text-align: center;">
          <h1>🌍 Your Professional Travel Itinerary</h1>
          <p style="font-size: 18px; margin: 0;">Destination: ${safeDestination} | Duration: ${safeDuration} days</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #2E7D32;">Hello Travel Enthusiast! 👋</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #424242;">
            Your personalized travel itinerary for <strong>${safeDestination}</strong> is ready! 
            We've carefully curated a ${safeDuration}-day journey with specific locations, 
            restaurant recommendations, and transportation details.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #81C784; margin: 20px 0;">
            <h3 style="color: #2E7D32; margin: 0 0 10px 0;">📋 What's Included:</h3>
            <ul style="color: #424242; line-height: 1.8;">
              <li>✅ Detailed day-by-day planning with specific times</li>
              <li>🍽️ Restaurant recommendations with Google Maps links</li>
              <li>🗺️ Location links for easy navigation</li>
              <li>💰 Complete budget breakdown</li>
              <li>🚗 Transportation planning for each day</li>
            </ul>
          </div>
          
          <div style="background: #E8F5E8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #2E7D32; margin: 0 0 10px 0;">📎 PDF Document Attached</h3>
            <p style="margin: 0; color: #424242;">
              Your complete professional itinerary is attached as a beautifully formatted PDF document for easy viewing and printing during your trip.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #424242; font-size: 16px;">
              Have a wonderful trip! 🎉<br>
              <strong>TravelAI Pro Team</strong>
            </p>
          </div>
        </div>
        
        <div style="background: #2E7D32; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2025 TravelAI Pro - Professional Travel Planning Made Easy</p>
          <p style="margin: 5px 0 0 0; opacity: 0.8;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'travelai-pro@gmail.com',
      to: email,
      subject: `🌍 Your ${safeDestination} Travel Itinerary PDF - ${safeDuration} Days`,
      html: htmlContent,
      attachments: [
        {
          filename: fileName,
          path: filePath
        }
      ]
    };
    
    console.log('📧 Attempting to send email to:', email);
    console.log('📧 Using optimized email service');
    
    // Try sending email with single robust attempt
    try {
      console.log('📧 Sending email with PDF attachment...');
      
      const emailPromise = transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email service timeout - Gmail may be blocking server connections')), 30000)
      );
      
      const result = await Promise.race([emailPromise, timeoutPromise]);
      
      console.log('✅ Email sent successfully:', result.messageId);
      
      // Clean up file after sending
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 60000);
      
      // Success response
      return res.json({ 
        success: true, 
        message: 'Itinerary sent successfully! ✅',
        documentCreated: fileName,
        emailSent: result.messageId || 'sent',
        developmentMode: false
      });
      
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      
      // Instead of failing, provide the PDF download option
      console.log('💡 Providing PDF download as alternative...');
      
      // Keep the PDF file for download instead of deleting it
      const downloadUrl = `/api/download-itinerary/${fileName}`;
      
      return res.json({
        success: false,
        error: 'Email service temporarily unavailable',
        message: 'Gmail is blocking server connections. Your PDF is ready for download.',
        downloadAvailable: true,
        downloadUrl: downloadUrl,
        fileName: fileName,
        suggestion: 'Use the download button below to get your itinerary PDF',
        troubleshooting: 'Email service will be restored soon. For now, download the PDF directly.'
      });
    }
    
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error response:', error.response);
    console.error('❌ Full error details:', JSON.stringify(error, null, 2));
    
    // Specific error handling with detailed messages
    let errorMessage = 'Failed to send email';
    let suggestion = 'Please try again';
    let troubleshooting = '';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Gmail authentication failed';
      suggestion = 'Your Gmail app password may be incorrect or expired';
      troubleshooting = 'Generate a new app password: myaccount.google.com/security → App passwords';
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection to Gmail failed';
      suggestion = 'Gmail servers may be temporarily unavailable';
      troubleshooting = 'Try again in a few minutes or check Gmail service status';
    } else if (error.message.includes('Invalid login')) {
      errorMessage = 'Invalid Gmail credentials';
      suggestion = 'Check your email and app password configuration';
      troubleshooting = 'Verify EMAIL_USER and EMAIL_PASSWORD are correct';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Email sending timeout';
      suggestion = 'Gmail is taking too long to respond';
      troubleshooting = 'Try sending again or check your internet connection';
    } else if (error.code === 'EMESSAGE') {
      errorMessage = 'Email message format error';
      suggestion = 'There may be an issue with the email content or attachment';
      troubleshooting = 'The PDF attachment might be corrupted';
    }
    
    res.status(500).json({ 
      success: false,
      error: errorMessage,
      message: error.message,
      suggestion: suggestion,
      troubleshooting: troubleshooting,
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Email configuration test endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    console.log('🔍 Email Configuration Test:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set ✅' : 'Not Set ❌');
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set ✅' : 'Not Set ❌');
    
    const isProductionMode = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_USER !== 'your-email@gmail.com';
    
    // Test actual Gmail connection if in production mode
    let connectionTest = 'Not tested';
    if (isProductionMode && transporter.verify) {
      try {
        await transporter.verify();
        connectionTest = 'Connection successful ✅';
      } catch (verifyError) {
        connectionTest = `Connection failed: ${verifyError.message} ❌`;
      }
    }
    
    res.json({
      emailConfigured: isProductionMode,
      emailUser: process.env.EMAIL_USER ? 'Set ✅' : 'Not Set ❌',
      emailPassword: process.env.EMAIL_PASSWORD ? 'Set ✅' : 'Not Set ❌',
      mode: isProductionMode ? 'Production (Real Email)' : 'Development (Mock Email)',
      gmailConnection: connectionTest,
      currentEmailUser: process.env.EMAIL_USER || 'Not configured',
      message: isProductionMode ? 
        'Email service ready to send real emails! 📧' : 
        'Please configure EMAIL_USER and EMAIL_PASSWORD environment variables on Render'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple email test endpoint
app.post('/api/test-send-email', async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({ error: 'Test email address required' });
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'travelai-pro@gmail.com',
      to: testEmail,
      subject: '🧪 TravelAI Email Test',
      html: `
        <h2>Email Test Successful! ✅</h2>
        <p>Your TravelAI email service is working correctly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    };
    
    console.log('🧪 Sending test email to:', testEmail);
    const result = await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Test email sent successfully! ✅',
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
});

// PDF download endpoint for when email fails
app.get('/api/download-itinerary/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'documents', filename);
    
    console.log('📄 Download request for:', filename);
    
    if (fs.existsSync(filePath)) {
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error('Download error:', err);
          res.status(500).json({ error: 'Download failed' });
        } else {
          console.log('✅ File downloaded successfully:', filename);
          // Clean up file after download
          setTimeout(() => {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }, 300000); // Delete after 5 minutes
        }
      });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Download endpoint error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Contact form API endpoint
app.post('/api/contact', async (req, res) => {
  console.log('📧 Contact POST endpoint hit with method:', req.method);
  console.log('📧 Request body:', req.body);
  console.log('📧 Request headers:', req.headers);
  
  try {
    const { name, email, subject, message, inquiryType } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }
    
    // Log contact form submission
    console.log(`📧 Contact form submission from ${name} (${email})`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);
    
    // Create HTML email content for admin notification
    const adminHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%); color: white; padding: 30px; text-align: center;">
          <h1>📬 New Contact Form Submission</h1>
          <p style="font-size: 18px; margin: 0;">TravelAI Pro - Professional Travel Planning</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <div style="background: white; padding: 25px; border-radius: 10px; border-left: 5px solid #4CAF50; margin-bottom: 20px;">
            <h3 style="color: #2E7D32; margin: 0 0 15px 0;">👤 Contact Information</h3>
            <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #1976D2;">${email}</a></p>
            <p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 10px; border-left: 5px solid #FF9800;">
            <h3 style="color: #2E7D32; margin: 0 0 15px 0;">💬 Message</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; font-family: monospace; line-height: 1.6;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 10px; border-left: 5px solid #9C27B0; margin-top: 20px;">
            <h3 style="color: #2E7D32; margin: 0 0 15px 0;">📊 Submission Details</h3>
            <p style="margin: 10px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p style="margin: 10px 0;"><strong>IP Address:</strong> ${req.ip || 'Unknown'}</p>
            <p style="margin: 10px 0;"><strong>User Agent:</strong> ${req.get('User-Agent')?.substring(0, 100) || 'Unknown'}</p>
          </div>
        </div>
        
        <div style="background: #2E7D32; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px;">© 2025 TravelAI Pro - Professional Travel Planning Made Easy</p>
        </div>
      </div>
    `;
    
    // Create acknowledgment email for user
    const userHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #81C784 100%); color: white; padding: 30px; text-align: center;">
          <h1>✅ Thank You for Contacting Us!</h1>
          <p style="font-size: 18px; margin: 0;">TravelAI Pro - Professional Travel Planning</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #2E7D32;">Hello ${name}! 👋</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #424242;">
            Thank you for reaching out to us! We've received your message and will get back to you within 24 hours.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            <h3 style="color: #2E7D32; margin: 0 0 10px 0;">📋 Your Message Summary:</h3>
            <p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>
            <p style="margin: 10px 0;"><strong>Sent:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #FF9800; margin: 20px 0;">
            <h3 style="color: #2E7D32; margin: 0 0 15px 0;">🚀 What Happens Next?</h3>
            <ul style="color: #424242; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>✅ We'll review your message within 2-4 hours</li>
              <li>📧 You'll receive a personalized response within 24 hours</li>
              <li>💬 For urgent matters, you can also reach us directly</li>
              <li>🌟 We're excited to help with your travel planning needs!</li>
            </ul>
          </div>
          
          <div style="background: linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%); padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2E7D32; margin: 0 0 15px 0;">🌍 Why Choose TravelAI Pro?</h3>
            <ul style="color: #2E7D32; line-height: 1.8; margin: 0; padding-left: 20px; font-weight: 600;">
              <li>🤖 AI-Powered Travel Planning</li>
              <li>🗺️ Google Maps Integration</li>
              <li>💰 Budget Optimization</li>
              <li>📱 Mobile-Friendly Itineraries</li>
              <li>📧 Professional Document Delivery</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #2E7D32; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0 0 10px 0;"><strong>© 2025 TravelAI Pro</strong></p>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Professional Travel Planning Made Easy</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">📧 help.travel.ai@gmail.com</p>
        </div>
      </div>
    `;
    
    try {
      // Send admin notification email
      const adminMailOptions = {
        from: process.env.EMAIL_USER || 'noreply@travelai.pro',
        to: process.env.EMAIL_USER || 'admin@travelai.pro',
        subject: `🚨 New Contact Form: ${subject}`,
        html: adminHtmlContent,
        text: `New contact form submission from ${name} (${email})\nSubject: ${subject}\nMessage: ${message}`
      };
      
      // Send user acknowledgment email
      const userMailOptions = {
        from: process.env.EMAIL_USER || 'noreply@travelai.pro',
        to: email,
        subject: '✅ Thank you for contacting TravelAI Pro!',
        html: userHtmlContent,
        text: `Hello ${name},\n\nThank you for contacting TravelAI Pro! We've received your message about "${subject}" and will get back to you within 24 hours.\n\nBest regards,\nTravelAI Pro Team`
      };
      
      // Send both emails
      const [adminResult, userResult] = await Promise.all([
        transporter.sendMail(adminMailOptions),
        transporter.sendMail(userMailOptions)
      ]);
      
      console.log('✅ Admin notification sent:', adminResult.messageId || 'dev-mode');
      console.log('✅ User acknowledgment sent:', userResult.messageId || 'dev-mode');
      
      // Success response
      res.json({
        success: true,
        message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
        details: {
          adminNotified: true,
          userAcknowledged: true,
          timestamp: new Date().toISOString(),
          developmentMode: !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com'
        }
      });
      
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      
      // Provide specific guidance for Gmail authentication errors
      let errorGuidance = '';
      if (emailError.message.includes('Invalid login') || emailError.message.includes('BadCredentials')) {
        errorGuidance = ' | Tip: Gmail account may need 2FA + App Password. See EMAIL_SETUP_GUIDE.md';
      } else if (emailError.message.includes('authentication')) {
        errorGuidance = ' | Tip: Check Gmail credentials and 2FA settings';
      }
      
      console.log('📧 Email Error Details:', emailError.code, errorGuidance);
      
      // Even if emails fail, log the contact form submission
      res.json({
        success: true,
        message: 'Your message has been received! We\'ll contact you soon.',
        warning: 'Email notification may be delayed',
        details: {
          submitted: true,
          timestamp: new Date().toISOString(),
          emailError: emailError.message
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Contact form submission failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to process your message. Please try again.',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong on our end. Please try again.',
    timestamp: new Date().toISOString()
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: {
      health: 'GET /',
      plan: 'POST /api/plan',
      sendItinerary: 'POST /api/send-itinerary',
      accommodations: 'POST /api/accommodations',
      places: 'GET /api/places/:destination',
      contact: 'POST /api/contact'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TravelAI Backend Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});