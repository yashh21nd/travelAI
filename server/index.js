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
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ Handling OPTIONS preflight request from ${origin}`);
    res.sendStatus(200);
  } else {
    next();
  }
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
  const { destination, budget, duration, currency, travelWith, userLocation, needAccommodation } = req.body;
  try {
    console.log(`Generating itinerary for ${destination}, ${duration} days, ${budget} ${currency}, traveling with ${travelWith}`);
    
    // Try Hugging Face API first, fallback to enhanced generator
    const plan = await generateAIItinerary(destination, budget, duration, currency, travelWith, userLocation, needAccommodation);
    
    res.json({ 
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

// Email service configuration - Development Mode
let transporter;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_USER !== 'your-email@gmail.com') {
  // Production mode with real SMTP credentials
  console.log('Initializing Gmail SMTP with user:', process.env.EMAIL_USER);
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    secure: true,
    port: 465,
    debug: true, // Enable debug logs
    logger: true // Enable logging
  });
  
  // Test the connection
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ Gmail SMTP connection failed:', error.message);
    } else {
      console.log('✅ Gmail SMTP server is ready to send emails');
    }
  });
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

// Function to format itinerary content for PDF display
function formatItineraryForPDF(itinerary) {
  const lines = itinerary.split('\n').filter(line => line.trim());
  let html = '';
  let currentDay = 0;
  let inDayBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this line contains a day header
    if (line.match(/^DAY\s*\d+/i) || line.includes('Day ')) {
      // Close previous day block if open
      if (inDayBlock) {
        html += '</div>'; // Close previous day-block
      }
      
      currentDay++;
      const dayTitle = line.replace(/^\*\*|\*\*$/g, '').trim(); // Remove markdown formatting
      
      html += `
        <div class="day-block">
          <h2 class="day-title">${dayTitle}</h2>
          <div class="day-content">`;
      inDayBlock = true;
    }
    // Check for activity/location lines
    else if (line.length > 0 && !line.includes('═══')) {
      // Remove markdown formatting and clean up
      const cleanLine = line
        .replace(/^\*\*|\*\*$/g, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .trim();
      
      // Check if line contains Google Maps link
      if (line.includes('https://maps.google.com') || line.includes('maps.google.com')) {
        const parts = cleanLine.split('https://');
        const locationName = parts[0].replace(/[\-\•]/g, '').trim();
        const mapUrl = parts.length > 1 ? 'https://' + parts[1] : '';
        
        html += `
          <div class="activity">
            <p><strong>📍 ${locationName}</strong></p>
            ${mapUrl ? `<a href="${mapUrl}" class="google-link">View on Google Maps</a>` : ''}
          </div>`;
      }
      // Regular activity line
      else if (cleanLine.startsWith('-') || cleanLine.startsWith('•') || cleanLine.startsWith('*')) {
        const activity = cleanLine.replace(/^[\-\•\*]\s*/, '').trim();
        if (activity.length > 0) {
          html += `
            <div class="activity">
              <p>${activity}</p>
            </div>`;
        }
      }
      // Transportation or special info
      else if (cleanLine.toLowerCase().includes('transport') || 
               cleanLine.toLowerCase().includes('taxi') || 
               cleanLine.toLowerCase().includes('train') ||
               cleanLine.toLowerCase().includes('flight')) {
        html += `
          <div class="activity" style="border-left-color: #FF9800;">
            <p><span class="emoji">🚗</span>${cleanLine}</p>
          </div>`;
      }
      // Restaurant/food related
      else if (cleanLine.toLowerCase().includes('restaurant') ||
               cleanLine.toLowerCase().includes('food') ||
               cleanLine.toLowerCase().includes('lunch') ||
               cleanLine.toLowerCase().includes('dinner')) {
        html += `
          <div class="activity" style="border-left-color: #F44336;">
            <p><span class="emoji">🍽️</span>${cleanLine}</p>
          </div>`;
      }
      // General activity
      else if (cleanLine.length > 0) {
        html += `
          <div class="activity">
            <p>${cleanLine}</p>
          </div>`;
      }
    }
  }
  
  // Close the last day block if open
  if (inDayBlock) {
    html += '</div></div>'; // Close day-content and day-block
  }
  
  // If no structured days were found, format as general content
  if (currentDay === 0) {
    html = `
      <div class="day-block">
        <h2 class="day-title">📋 Your Travel Itinerary</h2>
        <div class="day-content">`;
    
    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.length > 0 && !cleanLine.includes('═══')) {
        html += `
          <div class="activity">
            <p>${cleanLine.replace(/^\*\*|\*\*$/g, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>
          </div>`;
      }
    });
    
    html += '</div></div>';
  }
  
  return html;
}

// Create professional HTML document from itinerary
async function createItineraryDocument(itinerary, destination, duration) {
  const fileName = `${destination.replace(/\s+/g, '_')}_${duration}days_itinerary.pdf`;
  const filePath = path.join(__dirname, 'documents', fileName);
  
  // Ensure documents directory exists
  if (!fs.existsSync(path.join(__dirname, 'documents'))) {
    fs.mkdirSync(path.join(__dirname, 'documents'), { recursive: true });
  }
  
  // Clean and format itinerary content
  const cleanItinerary = itinerary
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/=\d{2}/g, '') // Remove =21, =22 etc.
    .replace(/=\w{2}/g, '') // Remove other encoded characters
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${destination} - ${duration} Days Travel Itinerary</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px;
        }
        
        .trip-info {
            display: flex;
            justify-content: space-around;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .trip-info div {
            flex: 1;
        }
        
        .trip-info h3 {
            color: #2E7D32;
            font-size: 1rem;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .trip-info p {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
        }
        
        .itinerary-section {
            margin-bottom: 30px;
            border-left: 4px solid #66BB6A;
            padding-left: 20px;
            background: #fafafa;
            padding: 20px;
            border-radius: 0 10px 10px 0;
        }
        
        .day-block {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            border-left: 6px solid #4CAF50;
            page-break-before: always;
            page-break-inside: avoid;
            min-height: 500px;
        }
        
        /* First day should not have page break before */
        .day-block:first-of-type {
            page-break-before: auto;
        }
        
        .day-title {
            color: #2E7D32;
            font-size: 1.6rem;
            font-weight: 700;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            padding-bottom: 10px;
            border-bottom: 2px solid #E8F5E8;
        }
        
        .day-content {
            margin-top: 15px;
        }
        
        .day-title::before {
            content: "📅";
            margin-right: 10px;
            font-size: 1.2rem;
        }
        
        .activity {
            margin-bottom: 12px;
            padding: 18px;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            border-radius: 10px;
            border-left: 4px solid #81C784;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        
        .activity p {
            margin-bottom: 8px;
            font-size: 1rem;
            line-height: 1.5;
        }
        
        .activity strong {
            color: #2E7D32;
        }
        
        .google-link {
            color: #1976D2;
            text-decoration: none;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            background: #E3F2FD;
            padding: 5px 10px;
            border-radius: 5px;
            margin-top: 5px;
            font-size: 0.9rem;
        }
        
        .google-link::before {
            content: "🗺️";
            margin-right: 5px;
        }
        
        .budget-section {
            background: linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%);
            padding: 25px;
            border-radius: 10px;
            margin-top: 30px;
        }
        
        .budget-title {
            color: #2E7D32;
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .budget-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(46, 125, 50, 0.2);
        }
        
        .budget-item:last-child {
            border-bottom: none;
            font-weight: 700;
            font-size: 1.1rem;
        }
        
        .footer {
            background: #2E7D32;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer p {
            margin-bottom: 10px;
        }
        
        .emoji {
            font-size: 1.2em;
            margin-right: 8px;
        }
        
        @media print {
            body { 
                padding: 0; 
                font-size: 12pt;
                line-height: 1.4;
            }
            .container { 
                box-shadow: none; 
                border-radius: 0;
            }
            .day-block {
                page-break-before: always;
                page-break-inside: avoid;
                margin-bottom: 0;
                box-shadow: none;
                min-height: auto;
            }
            .day-block:first-of-type {
                page-break-before: auto;
            }
            .header {
                page-break-after: avoid;
            }
            .trip-info {
                page-break-after: avoid;
            }
            .activity {
                page-break-inside: avoid;
                box-shadow: none;
                background: #f9f9f9 !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌍 ${destination}</h1>
            <p>Professional ${duration}-Day Travel Itinerary</p>
        </div>
        
        <div class="content">
            <div class="trip-info">
                <div>
                    <h3>Destination</h3>
                    <p>${destination}</p>
                </div>
                <div>
                    <h3>Duration</h3>
                    <p>${duration} Days</p>
                </div>
                <div>
                    <h3>Generated</h3>
                    <p>${new Date().toLocaleDateString()}</p>
                </div>
            </div>
            
            <div class="itinerary-section">
                ${formatItineraryForPDF(cleanItinerary)}
            </div>
            
            <div class="budget-section">
                <div class="budget-title">💰 Investment Summary</div>
                <div class="budget-item">
                    <span>📝 Complete Itinerary Planning</span>
                    <span>Included</span>
                </div>
                <div class="budget-item">
                    <span>🗺️ Google Maps Integration</span>
                    <span>Included</span>
                </div>
                <div class="budget-item">
                    <span>🍽️ Restaurant Recommendations</span>
                    <span>Included</span>
                </div>
                <div class="budget-item">
                    <span>🏨 Accommodation Analysis</span>
                    <span>Included</span>
                </div>
                <div class="budget-item">
                    <span>📧 Professional Document Delivery</span>
                    <span>Free</span>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>© 2025 TravelAI Pro - Professional Travel Planning Made Easy</strong></p>
            <p>🚀 AI-Powered Platform | 📧 Email: travelplanner.ai.service@gmail.com</p>
            <p><em>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</em></p>
        </div>
    </div>
</body>
</html>`;

  // Generate PDF from HTML
  try {
    const options = {
      format: 'A4',
      border: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      displayHeaderFooter: false,
      printBackground: true,
      preferCSSPageSize: true
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
    const { email, itinerary, destination, duration, userInfo } = req.body;
    
    console.log('📧 Email request received:', { email, destination, duration });
    console.log('📧 Environment check:', {
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPassword: !!process.env.EMAIL_PASSWORD,
      isProduction: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_USER !== 'your-email@gmail.com')
    });
    
    if (!email || !itinerary) {
      return res.status(400).json({ error: 'Email and itinerary are required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Create document first
    console.log('📄 Creating PDF document...');
    const { fileName, filePath } = await createItineraryDocument(itinerary, destination, duration);
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
          <p style="font-size: 18px; margin: 0;">Destination: ${destination} | Duration: ${duration} days</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #2E7D32;">Hello Travel Enthusiast! 👋</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #424242;">
            Your personalized travel itinerary for <strong>${destination}</strong> is ready! 
            We've carefully curated a ${duration}-day journey with specific locations, 
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
      subject: `🌍 Your ${destination} Travel Itinerary PDF - ${duration} Days`,
      html: htmlContent,
      attachments: [
        {
          filename: fileName,
          path: filePath
        }
      ]
    };
    
    console.log('📧 Attempting to send email to:', email);
    console.log('📧 Using transporter:', process.env.EMAIL_USER ? 'Gmail SMTP' : 'Development Mode');
    
    // Add timeout to prevent infinite loading
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email sending timeout - check your email configuration')), 30000)
    );
    
    // Send email with timeout
    const result = await Promise.race([emailPromise, timeoutPromise]);
    
    console.log('✅ Email sent successfully:', result.messageId);
    
    // Clean up file after sending
    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }, 60000); // Delete after 1 minute
    
    // Success response
    res.json({ 
      success: true, 
      message: 'Itinerary sent successfully! ✅',
      documentCreated: fileName,
      emailSent: result.messageId || 'dev-mode',
      developmentMode: !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com'
    });
    
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

// Contact form API endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
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
          <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">📧 travelplanner.ai.service@gmail.com</p>
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