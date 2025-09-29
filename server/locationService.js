// Enhanced Google Maps link generator using coordinates
function createGoogleMapsLink(place) {
  if (place.coordinates) {
    // Use coordinates for precise location
    return `https://www.google.com/maps?q=${place.coordinates}`;
  } else {
    // Fallback to search if no coordinates
    return `https://www.google.com/maps/search/${encodeURIComponent(place.name + ' ' + place.location)}`;
  }
}

// Create day-specific themes based on trip duration
function getDayTheme(dayCount, duration, category) {
  if (duration === 1) {
    return 'Highlights & Must-See Attractions';
  } else if (duration === 2) {
    if (dayCount === 1) return 'Historic Heritage & Culture';
    if (dayCount === 2) return 'Modern Attractions & Local Life';
  } else if (duration === 3) {
    if (dayCount === 1) return 'Popular Landmarks & Heritage';
    if (dayCount === 2) return 'Nature & Scenic Beauty';
    if (dayCount === 3) return 'Fun Activities & Local Experience';
  } else if (duration === 4) {
    if (dayCount === 1) return 'Historic Monuments & Architecture';
    if (dayCount === 2) return 'Cultural Museums & Art';
    if (dayCount === 3) return 'Nature Parks & Gardens';
    if (dayCount === 4) return 'Shopping & Entertainment';
  } else if (duration === 5) {
    if (dayCount === 1) return 'Iconic Landmarks & Heritage';
    if (dayCount === 2) return 'Museums & Cultural Centers';
    if (dayCount === 3) return 'Nature & Outdoor Activities';
    if (dayCount === 4) return 'Local Markets & Shopping';
    if (dayCount === 5) return 'Entertainment & Nightlife';
  } else {
    // For longer trips, create varied themes
    const themes = [
      'Historic Heritage Exploration',
      'Cultural & Art Discovery', 
      'Nature & Scenic Beauty',
      'Local Markets & Shopping',
      'Adventure & Activities',
      'Religious & Spiritual Sites',
      'Food & Culinary Experience',
      'Entertainment & Nightlife'
    ];
    return themes[(dayCount - 1) % themes.length];
  }
}

// Location-based places detection service
const axios = require('axios');

// Comprehensive database of places by city and category
const placesDatabase = {
  // India
  'delhi': {
    historic: [
      { name: 'Red Fort', location: 'Chandni Chowk, Delhi', coordinates: '28.6562,77.2410', description: 'UNESCO World Heritage Site, Mughal architecture masterpiece' },
      { name: 'India Gate', location: 'Rajpath, New Delhi', coordinates: '28.6129,77.2295', description: 'War memorial and iconic landmark' },
      { name: 'Qutub Minar', location: 'Mehrauli, Delhi', coordinates: '28.5245,77.1855', description: 'Tallest brick minaret in the world' },
      { name: 'Humayuns Tomb', location: 'Nizamuddin, Delhi', coordinates: '28.5933,77.2507', description: 'Mughal Emperor tomb, UNESCO site' },
      { name: 'Lotus Temple', location: 'Kalkaji, Delhi', coordinates: '28.5535,77.2588', description: 'Bahá\'í House of Worship' }
    ],
    cultural: [
      { name: 'National Museum', location: 'Janpath, New Delhi', coordinates: '28.6118,77.2190', description: 'Largest museum in India' },
      { name: 'Akshardham Temple', location: 'Noida Mor, Delhi', coordinates: '28.6127,77.2773', description: 'Hindu temple complex' },
      { name: 'Jama Masjid', location: 'Chandni Chowk, Delhi', coordinates: '28.6507,77.2334', description: 'Largest mosque in India' },
      { name: 'Raj Ghat', location: 'Ring Road, Delhi', coordinates: '28.6413,77.2492', description: 'Gandhi memorial' }
    ],
    shopping: [
      { name: 'Chandni Chowk', location: 'Old Delhi', coordinates: '28.6506,77.2303', description: 'Historic market and shopping area' },
      { name: 'Connaught Place', location: 'Central Delhi', coordinates: '28.6315,77.2167', description: 'Commercial and business hub' },
      { name: 'Khan Market', location: 'New Delhi', coordinates: '28.5986,77.2278', description: 'Upscale shopping market' }
    ],
    nature: [
      { name: 'Lodhi Gardens', location: 'Lodhi Road, Delhi', coordinates: '28.5918,77.2273', description: 'Historic park with tombs' },
      { name: 'India Gate Gardens', location: 'Rajpath, Delhi', coordinates: '28.6129,77.2295', description: 'Beautiful landscaped gardens' }
    ]
  },
  
  'mumbai': {
    historic: [
      { name: 'Gateway of India', location: 'Apollo Bunder, Mumbai', coordinates: '18.9220,72.8347', description: 'Iconic arch monument' },
      { name: 'Chhatrapati Shivaji Terminus', location: 'Fort, Mumbai', coordinates: '18.9398,72.8355', description: 'UNESCO World Heritage railway station' },
      { name: 'Elephanta Caves', location: 'Elephanta Island, Mumbai', coordinates: '18.9633,72.9315', description: 'Ancient rock-cut caves' },
      { name: 'Dhobi Ghat', location: 'Mahalaxmi, Mumbai', coordinates: '18.9894,72.8205', description: 'World\'s largest outdoor laundry' }
    ],
    cultural: [
      { name: 'Prince of Wales Museum', location: 'Fort, Mumbai', coordinates: '18.9269,72.8324', description: 'Premier art and history museum' },
      { name: 'Marine Drive', location: 'South Mumbai', coordinates: '18.9434,72.8234', description: 'Queen\'s Necklace promenade' },
      { name: 'Hanging Gardens', location: 'Malabar Hill, Mumbai', coordinates: '18.9561,72.8052', description: 'Terraced gardens' }
    ],
    shopping: [
      { name: 'Colaba Causeway', location: 'Colaba, Mumbai', coordinates: '18.9067,72.8147', description: 'Popular shopping street' },
      { name: 'Linking Road', location: 'Bandra, Mumbai', coordinates: '19.0544,72.8319', description: 'Fashion shopping destination' }
    ],
    entertainment: [
      { name: 'Bollywood Studios', location: 'Film City, Mumbai', coordinates: '19.1663,72.8526', description: 'Film industry hub' },
      { name: 'Juhu Beach', location: 'Juhu, Mumbai', coordinates: '19.1075,72.8263', description: 'Popular beach destination' }
    ]
  },

  'jaipur': {
    historic: [
      { name: 'Amber Fort', location: 'Amer, Jaipur', coordinates: '26.9855,75.8513', description: 'Hilltop fort with stunning architecture' },
      { name: 'City Palace', location: 'Jaipur City, Rajasthan', coordinates: '26.9255,75.8240', description: 'Royal residence complex' },
      { name: 'Hawa Mahal', location: 'Badi Choupad, Jaipur', coordinates: '26.9239,75.8267', description: 'Palace of Winds' },
      { name: 'Jantar Mantar', location: 'Gangori Bazaar, Jaipur', coordinates: '26.9249,75.8240', description: 'Astronomical observatory' },
      { name: 'Nahargarh Fort', location: 'Aravalli Hills, Jaipur', coordinates: '26.9344,75.8155', description: 'Fort overlooking Pink City' }
    ],
    cultural: [
      { name: 'Albert Hall Museum', location: 'Ram Niwas Garden, Jaipur', coordinates: '26.9115,75.8197', description: 'Oldest museum in Rajasthan' },
      { name: 'Birla Mandir', location: 'Tilak Nagar, Jaipur', coordinates: '26.8851,75.8034', description: 'Modern Hindu temple' }
    ],
    shopping: [
      { name: 'Johari Bazaar', location: 'Old City, Jaipur', coordinates: '26.9225,75.8202', description: 'Traditional jewelry market' },
      { name: 'Bapu Bazaar', location: 'Sanganeri Gate, Jaipur', coordinates: '26.9173,75.8174', description: 'Textiles and handicrafts' }
    ]
  },

  // International destinations
  'paris': {
    historic: [
      { name: 'Eiffel Tower', location: 'Champ de Mars, Paris', coordinates: '48.8584,2.2945', description: 'Iconic iron lattice tower' },
      { name: 'Louvre Museum', location: 'Rue de Rivoli, Paris', coordinates: '48.8606,2.3376', description: 'World\'s largest art museum' },
      { name: 'Notre-Dame Cathedral', location: 'Île de la Cité, Paris', coordinates: '48.8530,2.3499', description: 'Gothic cathedral masterpiece' },
      { name: 'Arc de Triomphe', location: 'Charles de Gaulle, Paris', coordinates: '48.8738,2.2950', description: 'Triumphal arch monument' },
      { name: 'Sacré-Cœur Basilica', location: 'Montmartre, Paris', coordinates: '48.8867,2.3431', description: 'Romano-Byzantine basilica' }
    ],
    cultural: [
      { name: 'Musée d\'Orsay', location: 'Saint-Germain, Paris', coordinates: '48.8600,2.3266', description: 'Impressionist art museum' },
      { name: 'Latin Quarter', location: '5th arrondissement, Paris', coordinates: '48.8503,2.3459', description: 'Historic student district' },
      { name: 'Montmartre', location: '18th arrondissement, Paris', coordinates: '48.8867,2.3431', description: 'Artists\' district' }
    ],
    shopping: [
      { name: 'Champs-Élysées', location: '8th arrondissement, Paris', coordinates: '48.8698,2.3076', description: 'Famous shopping avenue' },
      { name: 'Le Marais', location: '3rd-4th arrondissement, Paris', coordinates: '48.8584,2.3615', description: 'Trendy shopping district' }
    ],
    nature: [
      { name: 'Luxembourg Gardens', location: '6th arrondissement, Paris', coordinates: '48.8462,2.3372', description: 'Beautiful palace gardens' },
      { name: 'Tuileries Garden', location: '1st arrondissement, Paris', coordinates: '48.8634,2.3275', description: 'Historic formal garden' }
    ]
  },

  'london': {
    historic: [
      { name: 'Tower of London', location: 'Tower Hill, London', coordinates: '51.5081,-0.0761', description: 'Historic castle and Crown Jewels' },
      { name: 'Westminster Abbey', location: 'Westminster, London', coordinates: '51.4994,-0.1270', description: 'Gothic abbey church' },
      { name: 'Buckingham Palace', location: 'Westminster, London', coordinates: '51.5014,-0.1419', description: 'Royal residence' },
      { name: 'Big Ben', location: 'Westminster, London', coordinates: '51.4994,-0.1245', description: 'Iconic clock tower' },
      { name: 'St. Paul\'s Cathedral', location: 'City of London', coordinates: '51.5138,-0.0984', description: 'Anglican cathedral' }
    ],
    cultural: [
      { name: 'British Museum', location: 'Bloomsbury, London', coordinates: '51.5194,-0.1270', description: 'World history and culture museum' },
      { name: 'Tate Modern', location: 'Southwark, London', coordinates: '51.5076,-0.0994', description: 'Modern art gallery' },
      { name: 'National Gallery', location: 'Trafalgar Square, London', coordinates: '51.5089,-0.1283', description: 'European paintings collection' }
    ],
    shopping: [
      { name: 'Oxford Street', location: 'West End, London', coordinates: '51.5154,-0.1426', description: 'Major shopping street' },
      { name: 'Covent Garden', location: 'West End, London', coordinates: '51.5118,-0.1226', description: 'Shopping and entertainment district' }
    ],
    nature: [
      { name: 'Hyde Park', location: 'Central London', coordinates: '51.5074,-0.1658', description: 'Royal park in central London' },
      { name: 'Regent\'s Park', location: 'North London', coordinates: '51.5313,-0.1563', description: 'Beautiful royal park' }
    ]
  },

  'tokyo': {
    historic: [
      { name: 'Senso-ji Temple', location: 'Asakusa, Tokyo', coordinates: '35.7148,139.7967', description: 'Ancient Buddhist temple' },
      { name: 'Imperial Palace', location: 'Chiyoda, Tokyo', coordinates: '35.6852,139.7528', description: 'Primary residence of Emperor' },
      { name: 'Meiji Shrine', location: 'Shibuya, Tokyo', coordinates: '35.6764,139.6993', description: 'Shinto shrine dedicated to Emperor Meiji' }
    ],
    cultural: [
      { name: 'Tokyo National Museum', location: 'Ueno, Tokyo', coordinates: '35.7188,139.7767', description: 'Japanese art and cultural artifacts' },
      { name: 'Shibuya Crossing', location: 'Shibuya, Tokyo', coordinates: '35.6598,139.7006', description: 'World\'s busiest pedestrian crossing' },
      { name: 'Tsukiji Outer Market', location: 'Chuo, Tokyo', coordinates: '35.6654,139.7707', description: 'Famous fish market' }
    ],
    shopping: [
      { name: 'Ginza', location: 'Chuo, Tokyo', coordinates: '35.6719,139.7648', description: 'Luxury shopping district' },
      { name: 'Harajuku', location: 'Shibuya, Tokyo', coordinates: '35.6702,139.7026', description: 'Youth fashion and culture center' }
    ],
    entertainment: [
      { name: 'Tokyo Disneyland', location: 'Urayasu, Chiba', coordinates: '35.6329,139.8804', description: 'Disney theme park' },
      { name: 'Robot Restaurant', location: 'Shinjuku, Tokyo', coordinates: '35.6938,139.7034', description: 'Unique entertainment venue' }
    ]
  },

  'goa': {
    historic: [
      { name: 'Basilica of Bom Jesus', location: 'Old Goa', coordinates: '15.5007,73.9115', description: 'UNESCO World Heritage church' },
      { name: 'Se Cathedral', location: 'Old Goa', coordinates: '15.5005,73.9094', description: 'Largest church in Asia' },
      { name: 'Chapora Fort', location: 'Bardez, Goa', coordinates: '15.6133,73.7361', description: 'Portuguese fort with scenic views' }
    ],
    cultural: [
      { name: 'Museum of Christian Art', location: 'Old Goa', coordinates: '15.5021,73.9114', description: 'Indo-Portuguese Christian art' },
      { name: 'Fontainhas', location: 'Panaji, Goa', coordinates: '15.4989,73.8278', description: 'Latin Quarter heritage area' }
    ],
    nature: [
      { name: 'Baga Beach', location: 'North Goa', coordinates: '15.5559,73.7516', description: 'Popular beach destination' },
      { name: 'Dudhsagar Falls', location: 'Mollem, Goa', coordinates: '15.3144,74.3144', description: 'Four-tiered waterfall' },
      { name: 'Spice Plantation', location: 'Ponda, Goa', coordinates: '15.4013,74.0071', description: 'Tropical spice gardens' }
    ],
    entertainment: [
      { name: 'Casino Royale', location: 'Panaji, Goa', coordinates: '15.4947,73.8270', description: 'Floating casino experience' },
      { name: 'Anjuna Flea Market', location: 'Anjuna, Goa', coordinates: '15.5738,73.7392', description: 'Weekly beach market' }
    ]
  },

  'kerala': {
    historic: [
      { name: 'Mattancherry Palace', location: 'Kochi, Kerala', coordinates: '9.9581,76.2604', description: 'Dutch Palace with murals' },
      { name: 'Chinese Fishing Nets', location: 'Fort Kochi, Kerala', coordinates: '9.9673,76.2420', description: 'Historic fishing technique' },
      { name: 'Padmanabhaswamy Temple', location: 'Thiruvananthapuram, Kerala', coordinates: '8.4829,76.9457', description: 'Richest temple in the world' }
    ],
    nature: [
      { name: 'Munnar Tea Gardens', location: 'Munnar, Kerala', coordinates: '10.0889,77.0595', description: 'Scenic tea plantations' },
      { name: 'Periyar Wildlife Sanctuary', location: 'Thekkady, Kerala', coordinates: '9.4981,77.1597', description: 'Tiger reserve and national park' },
      { name: 'Vembanad Lake', location: 'Alleppey, Kerala', coordinates: '9.4981,76.3388', description: 'Largest lake in Kerala' }
    ],
    cultural: [
      { name: 'Kathakali Centre', location: 'Kochi, Kerala', coordinates: '9.9659,76.2419', description: 'Traditional dance performances' },
      { name: 'Spice Markets', location: 'Kochi, Kerala', coordinates: '9.9581,76.2604', description: 'Historic spice trading center' }
    ],
    entertainment: [
      { name: 'Houseboat Cruise', location: 'Alleppey, Kerala', coordinates: '9.4981,76.3388', description: 'Backwater cruise experience' },
      { name: 'Beach Resort', location: 'Kovalam, Kerala', coordinates: '8.4004,76.9788', description: 'Luxury beach experience' }
    ]
  }
};

// Function to get places by city and preferences
function getPlacesByCity(destination, travelPreferences = []) {
  const city = destination.toLowerCase();
  const cityData = placesDatabase[city] || {};
  
  if (Object.keys(cityData).length === 0) {
    return generateGenericPlaces(destination, travelPreferences);
  }
  
  return cityData;
}

// Function to generate generic places for unknown cities
function generateGenericPlaces(destination, preferences) {
  return {
    historic: [
      { name: `${destination} Historic Center`, location: `Central ${destination}`, coordinates: '0,0', description: 'Historic city center with traditional architecture' },
      { name: `Old Town ${destination}`, location: `${destination} Old Quarter`, coordinates: '0,0', description: 'Charming old town area' },
      { name: `${destination} Cathedral/Temple`, location: `Religious District, ${destination}`, coordinates: '0,0', description: 'Main religious site of the city' }
    ],
    cultural: [
      { name: `${destination} Museum`, location: `Cultural District, ${destination}`, coordinates: '0,0', description: 'Local history and culture museum' },
      { name: `${destination} Art Gallery`, location: `Arts Quarter, ${destination}`, coordinates: '0,0', description: 'Contemporary and traditional art' },
      { name: `Traditional Market`, location: `Market Area, ${destination}`, coordinates: '0,0', description: 'Local traditional market' }
    ],
    shopping: [
      { name: `${destination} Main Shopping Street`, location: `Commercial District, ${destination}`, coordinates: '0,0', description: 'Primary shopping area' },
      { name: `Local Bazaar`, location: `Market Quarter, ${destination}`, coordinates: '0,0', description: 'Traditional local bazaar' }
    ],
    nature: [
      { name: `${destination} Central Park`, location: `City Center, ${destination}`, coordinates: '0,0', description: 'Main city park and gardens' },
      { name: `${destination} Viewpoint`, location: `Scenic Area, ${destination}`, coordinates: '0,0', description: 'Best city viewpoint' }
    ]
  };
}

// Function to create detailed itinerary with specific places
function createDetailedItinerary(destination, duration, budget, currency, travelWith, preferences = []) {
  const places = getPlacesByCity(destination, preferences);
  const categories = Object.keys(places);
  
  let itinerary = `PROFESSIONAL TRAVEL ITINERARY\n\n`;
  itinerary += `Destination: ${destination}\n`;
  itinerary += `Duration: ${duration} days\n`;
  itinerary += `Budget: ${currency} ${budget}\n`;
  itinerary += `Travel Style: ${travelWith}\n\n`;
  
  // Budget breakdown in one block
  const dailyBudget = budget / duration;
  itinerary += `BUDGET BREAKDOWN\n\n`;
  itinerary += `Daily Budget: ${currency} ${dailyBudget.toFixed(0)}\n`;
  itinerary += `Accommodation (40%): ${currency} ${(budget * 0.4).toFixed(0)} total\n`;
  itinerary += `Food & Dining (30%): ${currency} ${(budget * 0.3).toFixed(0)} total\n`;
  itinerary += `Activities & Tours (20%): ${currency} ${(budget * 0.2).toFixed(0)} total\n`;
  itinerary += `Transportation (10%): ${currency} ${(budget * 0.1).toFixed(0)} total\n\n`;
  
  itinerary += `DETAILED DAY-BY-DAY ITINERARY\n\n`;
  
  // Create consolidated daily plans with unique themes and activities
  let dayCount = 1;
  let categoryIndex = 0;
  let usedCategories = new Set(); // Track used categories to avoid repetition
  let usedPlaces = new Set(); // Track used individual places to avoid repetition
  
  while (dayCount <= duration && dayCount <= 14) { // Support up to 14 days with unique content
    const category = categories[categoryIndex % categories.length];
    const categoryPlaces = places[category] || [];
    
    // Get unique places not used before, or reuse if necessary
    let availablePlaces = categoryPlaces.filter(place => !usedPlaces.has(place.name));
    
    // If no unique places available, allow reusing places for longer trips
    if (availablePlaces.length === 0 && categoryPlaces.length > 0) {
      availablePlaces = categoryPlaces; // Reuse all places from this category
      // Clear used places for this category to allow reuse
      categoryPlaces.forEach(place => usedPlaces.delete(place.name));
    }
    
    // Ensure we always have at least some places to work with
    if (availablePlaces.length === 0) {
      // Generate generic day if no places available
      availablePlaces = [
        { name: `Historic Site ${dayCount}`, location: destination, description: 'Historic landmark and cultural site' },
        { name: `Local Market ${dayCount}`, location: destination, description: 'Traditional local market experience' },
        { name: `Cultural Center ${dayCount}`, location: destination, description: 'Arts and cultural venue' }
      ];
    }
    
    const dayPlaces = availablePlaces.slice(0, Math.min(3, availablePlaces.length));
    
    // Mark places as used (only if they're real places, not generic ones)
    if (categoryPlaces.length > 0) {
      dayPlaces.forEach(place => usedPlaces.add(place.name));
    }
    
    // Unique day theme based on category and day number
    let dayTheme = '';
    if (category === 'historic' && dayCount === 1) {
      dayTheme = 'Ancient Heritage & Monuments';
    } else if (category === 'historic' && dayCount === 2) {
      dayTheme = 'Royal Palaces & Architecture';
    } else if (category === 'historic' && dayCount === 3) {
      dayTheme = 'Colonial Legacy & Museums';
    } else if (category === 'cultural' && dayCount === 1) {
      dayTheme = 'Art & Museum Discovery';
    } else if (category === 'cultural' && dayCount === 2) {
      dayTheme = 'Local Traditions & Markets';
    } else if (category === 'cultural' && dayCount === 3) {
      dayTheme = 'Music & Performance Arts';
    } else if (category === 'shopping' && dayCount === 1) {
      dayTheme = 'Shopping & Local Bazaars';
    } else if (category === 'shopping' && dayCount === 2) {
      dayTheme = 'Craft Markets & Souvenirs';
    } else if (category === 'nature' && dayCount === 1) {
      dayTheme = 'Nature & Scenic Views';
    } else if (category === 'nature' && dayCount === 2) {
      dayTheme = 'Parks & Outdoor Activities';
    } else if (category === 'entertainment' && dayCount === 1) {
      dayTheme = 'Entertainment & Fun Activities';
    } else if (category === 'entertainment' && dayCount === 2) {
      dayTheme = 'Nightlife & Local Events';
    } else {
      dayTheme = `${category.charAt(0).toUpperCase() + category.slice(1)} Exploration Day ${dayCount}`;
    }
    
    // Consolidated day block with unique theme
    itinerary += `DAY ${dayCount}: ${dayTheme}\n\n`;
      
      // Morning activity
      if (dayPlaces[0]) {
        itinerary += `MORNING (9:00 AM - 12:00 PM): ${dayPlaces[0].name}\n`;
        itinerary += `Location: ${dayPlaces[0].location}\n`;
        itinerary += `📍 View on Maps: ${createGoogleMapsLink(dayPlaces[0])}\n`;
        itinerary += `Description: ${dayPlaces[0].description}\n`;
        itinerary += `Duration: 3 hours\n\n`;
      }
      
      // Lunch recommendation
      const restaurant = getRestaurantRecommendation(destination, category);
      itinerary += `LUNCH (12:00 PM - 1:30 PM): ${restaurant.name}\n`;
      itinerary += `Location: ${restaurant.location}\n`;
      itinerary += `📍 View on Maps: ${restaurant.link}\n`;
      itinerary += `Cuisine: ${restaurant.cuisine}\n`;
      itinerary += `Speciality: ${restaurant.speciality}\n\n`;
      
      // Afternoon activity
      if (dayPlaces[1]) {
        itinerary += `AFTERNOON (2:00 PM - 5:30 PM): ${dayPlaces[1].name}\n`;
        itinerary += `Location: ${dayPlaces[1].location}\n`;
        itinerary += `📍 View on Maps: ${createGoogleMapsLink(dayPlaces[1])}\n`;
        itinerary += `Description: ${dayPlaces[1].description}\n`;
        itinerary += `Duration: 3.5 hours\n\n`;
      }
      
      // Evening activity
      if (dayPlaces[2]) {
        itinerary += `EVENING (6:00 PM - 8:30 PM): ${dayPlaces[2].name}\n`;
        itinerary += `Location: ${dayPlaces[2].location}\n`;
        itinerary += `📍 View on Maps: ${createGoogleMapsLink(dayPlaces[2])}\n`;
        itinerary += `Description: ${dayPlaces[2].description}\n`;
        itinerary += `Duration: 2.5 hours\n\n`;
      }
      
      // Add nightlife/evening recommendations based on travel style
      itinerary += addNightlifeRecommendations(destination, travelWith, dayCount, duration);
      
      // Dinner recommendation with professional formatting
      const dinnerRestaurant = getDinnerRecommendation(destination, category);
      itinerary += `DINNER (8:00 PM - 10:00 PM): ${dinnerRestaurant.name}\n`;
      itinerary += `Location: ${dinnerRestaurant.location}\n`;
      itinerary += `📍 View on Maps: ${dinnerRestaurant.link}\n`;
      itinerary += `Cuisine: ${dinnerRestaurant.cuisine} | Specialty: ${dinnerRestaurant.speciality}\n\n`;
      
      // Realistic transportation summary
      itinerary += `🚗 TRANSPORTATION GUIDE:\n`;
      itinerary += `• Hotel → ${dayPlaces[0]?.name || 'Morning Location'}: 20-30 min\n`;
      itinerary += `• Lunch Transfer: 10-15 min walk\n`;
      itinerary += `• Afternoon Location: 15-25 min transport\n`;
      itinerary += `• Evening Activity: 10-20 min transport\n`;
      itinerary += `• Dinner & Return: 25-35 min total\n`;
      itinerary += `• Daily Transport Budget: ${currency} ${Math.round((budget * 0.1) / duration)}\n\n`;
      
      // Professional daily budget breakdown
      const dailyAccommodation = Math.round((budget * 0.4) / duration);
      const dailyFood = Math.round((budget * 0.3) / duration);
      const dailyTransport = Math.round((budget * 0.1) / duration);
      const dailyActivities = Math.round((budget * 0.2) / duration);
      
      itinerary += `💰 DAY ${dayCount} BUDGET BREAKDOWN:\n`;
      itinerary += `🏨 Accommodation: ${currency} ${dailyAccommodation}\n`;
      itinerary += `🍽️ Meals & Dining: ${currency} ${dailyFood}\n`;
      itinerary += `🚗 Transportation: ${currency} ${dailyTransport}\n`;
      itinerary += `🎯 Activities & Entry Fees: ${currency} ${dailyActivities}\n`;
      itinerary += `� **Day Total: ${currency} ${Math.round(budget / duration)}**\n\n`;
      
      itinerary += `═══════════════════════════════════════════════════════\n\n`;
      
      dayCount++;
    
    categoryIndex++;
    
    // If we've used all categories, reset but ensure we don't repeat the same category back-to-back
    if (categoryIndex >= categories.length) {
      categoryIndex = 0;
    }
  }
  
  return itinerary;
}

// Function to add nightlife recommendations based on travel style
function addNightlifeRecommendations(destination, travelWith, dayNumber, totalDuration) {
  // Smart nightlife frequency based on trip duration and day
  let shouldAddNightlife = false;
  
  if (totalDuration <= 2) {
    // Short trips: add once on last day
    shouldAddNightlife = (dayNumber === totalDuration);
  } else if (totalDuration === 3) {
    // 3-day trips: add on day 2
    shouldAddNightlife = (dayNumber === 2);
  } else if (totalDuration <= 5) {
    // Medium trips: add on days 2 and 4
    shouldAddNightlife = (dayNumber === 2 || dayNumber === 4);
  } else {
    // Long trips: add every other day starting from day 2
    shouldAddNightlife = (dayNumber % 2 === 0 && dayNumber >= 2);
  }
  
  if (!shouldAddNightlife) {
    return '';
  }
  
  const nightlifeDatabase = {
    'paris': {
      friends: ['🍷 Le Mary Celeste Wine Bar - Le Marais', '🎵 Le Baron Nightclub - Pigalle', '🍸 Harry\'s Bar - Opera District'],
      couple: ['🌹 Bar Hemingway - Ritz Paris', '🥂 Champagne Bar - Plaza Athénée', '🍷 L\'Ami Jean Wine Bar - 7th Arr'],
      solo: ['☕ Café de Flore - Saint-Germain', '🍺 Le Procope - Latin Quarter', '🎭 Au Lapin Agile Cabaret - Montmartre']
    },
    'london': {
      friends: ['🍺 Ye Olde Cheshire Cheese - Fleet Street', '🎵 Fabric Nightclub - Farringdon', '🍸 Sketch Cocktail Bar - Mayfair'],
      couple: ['🌃 Aqua Shard Sky Bar - London Bridge', '🥂 American Bar - The Savoy', '🍷 Gordon\'s Wine Bar - Embankment'],
      solo: ['📚 The George Inn - Borough', '🎺 Ronnie Scott\'s Jazz Club - Soho', '🍺 The Churchill Arms - Notting Hill']
    },
    'tokyo': {
      friends: ['🌸 Golden Gai Bar District - Shinjuku', '🎵 Womb Electronic Club - Shibuya', '🍻 Omoide Yokocho Alley - Shinjuku'],
      couple: ['🌃 New York Grill Bar - Park Hyatt', '🥂 Peter Bar - Peninsula Tokyo', '🌸 Bamboo Bar - Grand Hyatt'],
      solo: ['🌃 Shibuya Sky Observation - Shibuya', '🤖 Robot Restaurant - Kabukicho', '🎤 Big Echo Karaoke - Multiple Locations']
    },
    'mumbai': {
      friends: ['🍺 Toto\'s Garage Sports Bar - Bandra', '🎵 Kitty Su Nightclub - The Lalit', '🌃 Aer Rooftop Bar - Four Seasons'],
      couple: ['🌅 Aer Sky Lounge - Worli', '🥂 Harbour Bar - Taj Mahal Palace', '🍷 Bayview Bar - The Oberoi'],
      solo: ['☕ Leopold Café - Colaba', '🎭 Prithvi Theatre Café - Juhu', '🌊 Marine Drive Promenade - South Mumbai']
    },
    'delhi': {
      friends: ['🍺 Connaught Place Bars - CP', '🎵 Privee Nightclub - Shangri-La', '🍸 PCO Gastropub - Khan Market'],
      couple: ['🌃 Qube Bar - Leela Palace', '🥂 The Bar - Imperial Hotel', '🍷 1911 Bar - Imperial Hotel'],
      solo: ['☕ Khan Chacha - Khan Market', '📚 Oxford Bookstore Café - CP', '🎪 Kingdom of Dreams - Gurgaon']
    }
  };
  
  const cityKey = destination.toLowerCase();
  const cityNightlife = nightlifeDatabase[cityKey] || {
    friends: ['🍺 Local Sports Bar - Downtown', '🎵 Popular Nightclub - Entertainment District', '🍸 Trendy Cocktail Bar - City Center'],
    couple: ['🌃 Rooftop Lounge - Hotel District', '🥂 Wine Bar - Romantic Area', '🍷 Fine Dining Bar - Upscale District'],
    solo: ['☕ Local Café - Cultural Quarter', '📚 Bookstore Café - Literary District', '🎭 Cultural Center - Arts District']
  };
  
  const recommendations = cityNightlife[travelWith] || cityNightlife.solo;
  const selectedRec = recommendations[(dayNumber - 1) % recommendations.length];
  
  let nightlifeText = `NIGHTLIFE/EVENING OPTIONS:\n`;
  nightlifeText += `Recommended for ${travelWith}: ${selectedRec}\n`;
  nightlifeText += `📍 View on Maps: https://www.google.com/maps/search/${encodeURIComponent(selectedRec.replace(/[🍺🎵🍸🌃🥂🍷☕📚🎭🌹🌸🍻🤖🎤🌊🎪]/g, '') + ' ' + destination)}\n\n`;
  
  return nightlifeText;
}

// Restaurant recommendations database
const restaurantDatabase = {
  'delhi': {
    historic: {
      name: 'Karim\'s Restaurant',
      location: 'Jama Masjid, Old Delhi',
      link: 'https://www.google.com/maps/search/Karim+Restaurant+Jama+Masjid+Delhi',
      cuisine: 'Mughlai',
      speciality: 'Mutton Korma, Chicken Jahangiri'
    },
    cultural: {
      name: 'Indian Accent',
      location: 'Lodhi Hotel, New Delhi',
      link: 'https://www.google.com/maps/search/Indian+Accent+Lodhi+Hotel+Delhi',
      cuisine: 'Modern Indian',
      speciality: 'Duck Kheer, Pork Ribs'
    },
    shopping: {
      name: 'Paranthe Wali Gali',
      location: 'Chandni Chowk, Old Delhi',
      link: 'https://www.google.com/maps/search/Paranthe+Wali+Gali+Chandni+Chowk',
      cuisine: 'North Indian',
      speciality: 'Stuffed Paranthas, Lassi'
    }
  },
  'mumbai': {
    historic: {
      name: 'Trishna',
      location: 'Fort, Mumbai',
      link: 'https://www.google.com/maps/search/Trishna+Restaurant+Fort+Mumbai',
      cuisine: 'Contemporary Indian',
      speciality: 'Koliwada Crab, Butter Pepper Garlic Prawns'
    },
    cultural: {
      name: 'Britannia & Co',
      location: 'Ballard Estate, Mumbai',
      link: 'https://www.google.com/maps/search/Britannia+Co+Restaurant+Mumbai',
      cuisine: 'Parsi',
      speciality: 'Berry Pulav, Dhansak'
    }
  },
  'jaipur': {
    historic: {
      name: 'Chokhi Dhani',
      location: 'Tonk Road, Jaipur',
      link: 'https://www.google.com/maps/search/Chokhi+Dhani+Jaipur',
      cuisine: 'Rajasthani',
      speciality: 'Dal Baati Churma, Gatte ki Sabzi'
    },
    cultural: {
      name: 'Peacock Rooftop Restaurant',
      location: 'Hotel Pearl Palace, Jaipur',
      link: 'https://www.google.com/maps/search/Peacock+Rooftop+Restaurant+Jaipur',
      cuisine: 'Multi-cuisine',
      speciality: 'Laal Maas, Ker Sangri'
    }
  },
  'paris': {
    historic: {
      name: 'L\'Ami Jean',
      location: '27 Rue Malar, Paris',
      link: 'https://www.google.com/maps/search/L+Ami+Jean+Restaurant+Paris',
      cuisine: 'French Bistro',
      speciality: 'Côte de Boeuf, Chocolate Soufflé'
    },
    cultural: {
      name: 'Du Pain et des Idées',
      location: '4 Rue Yves Toudic, Paris',
      link: 'https://www.google.com/maps/search/Du+Pain+et+des+Idees+Paris',
      cuisine: 'French Bakery',
      speciality: 'Pistachio Escargot, Pain des Amis'
    }
  },
  'london': {
    historic: {
      name: 'Rules Restaurant',
      location: '35 Maiden Lane, Covent Garden',
      link: 'https://www.google.com/maps/search/Rules+Restaurant+Covent+Garden+London',
      cuisine: 'Traditional British',
      speciality: 'Game Pie, Spotted Dick'
    },
    cultural: {
      name: 'Dishoom',
      location: '12 Upper St Martin\'s Lane, London',
      link: 'https://www.google.com/maps/search/Dishoom+Restaurant+London',
      cuisine: 'Bombay Café',
      speciality: 'Black Daal, Chicken Ruby Murray'
    }
  },
  'tokyo': {
    historic: {
      name: 'Daikokuya Tempura',
      location: '1-38-10 Asakusa, Tokyo',
      link: 'https://www.google.com/maps/search/Daikokuya+Tempura+Asakusa+Tokyo',
      cuisine: 'Traditional Japanese',
      speciality: 'Ebi Tempura, Kakiage'
    },
    cultural: {
      name: 'Jiro Sushi Honten',
      location: '4-2-15 Ginza, Chuo City, Tokyo',
      link: 'https://www.google.com/maps/search/Jiro+Sushi+Ginza+Tokyo',
      cuisine: 'Sushi',
      speciality: 'Omakase Sushi Course'
    }
  }
};

// Function to get restaurant recommendation
function getRestaurantRecommendation(destination, category) {
  const city = destination.toLowerCase();
  const cityRestaurants = restaurantDatabase[city];
  
  if (cityRestaurants && cityRestaurants[category]) {
    return cityRestaurants[category];
  }
  
  // Default restaurant if city not found
  return {
    name: `Local ${category} Restaurant`,
    location: `${category} District, ${destination}`,
    link: `https://www.google.com/maps/search/best+${category}+restaurant+${destination}`,
    cuisine: 'Local Cuisine',
    speciality: 'Regional specialties and local favorites'
  };
}

// Function to get dinner recommendation (different from lunch)
function getDinnerRecommendation(destination, category) {
  const city = destination.toLowerCase();
  
  // Dinner alternatives for each city
  const dinnerOptions = {
    'delhi': {
      name: 'Bukhara',
      location: 'ITC Maurya, Chanakyapuri, Delhi',
      link: 'https://www.google.com/maps/search/Bukhara+Restaurant+ITC+Maurya+Delhi',
      cuisine: 'North Indian',
      speciality: 'Dal Bukhara, Sikandari Raan'
    },
    'mumbai': {
      name: 'Mahesh Lunch Home',
      location: 'Fort, Mumbai',
      link: 'https://www.google.com/maps/search/Mahesh+Lunch+Home+Mumbai',
      cuisine: 'Coastal Indian',
      speciality: 'Koliwada Prawns, Butter Garlic Crab'
    },
    'jaipur': {
      name: 'Handi Restaurant',
      location: 'MI Road, Jaipur',
      link: 'https://www.google.com/maps/search/Handi+Restaurant+MI+Road+Jaipur',
      cuisine: 'Rajasthani',
      speciality: 'Laal Maas, Jungle Maas'
    },
    'paris': {
      name: 'Le Comptoir du 7ème',
      location: '8 Avenue Bosquet, Paris',
      link: 'https://www.google.com/maps/search/Le+Comptoir+du+7eme+Paris',
      cuisine: 'French',
      speciality: 'Coq au Vin, Bouillabaisse'
    },
    'london': {
      name: 'The Ivy',
      location: '1-5 West Street, London',
      link: 'https://www.google.com/maps/search/The+Ivy+Restaurant+London',
      cuisine: 'Modern British',
      speciality: 'Sunday Roast, Fish & Chips'
    },
    'tokyo': {
      name: 'Kawamura',
      location: '5-5-19 Ginza, Tokyo',
      link: 'https://www.google.com/maps/search/Kawamura+Restaurant+Ginza+Tokyo',
      cuisine: 'Japanese Wagyu',
      speciality: 'A5 Wagyu Beef, Teppanyaki'
    }
  };
  
  return dinnerOptions[city] || {
    name: `Fine Dining ${destination}`,
    location: `Central ${destination}`,
    link: `https://www.google.com/maps/search/fine+dining+restaurant+${destination}`,
    cuisine: 'International',
    speciality: 'Chef\'s special tasting menu'
  };
}

// Function to get places based on specific requirements
function getPlacesByRequirement(destination, requirement) {
  const places = getPlacesByCity(destination);
  const reqLower = requirement.toLowerCase();
  
  if (reqLower.includes('historic') || reqLower.includes('history')) {
    return places.historic || [];
  } else if (reqLower.includes('cultural') || reqLower.includes('culture')) {
    return places.cultural || [];
  } else if (reqLower.includes('shopping') || reqLower.includes('shop')) {
    return places.shopping || [];
  } else if (reqLower.includes('nature') || reqLower.includes('park')) {
    return places.nature || [];
  } else if (reqLower.includes('entertainment') || reqLower.includes('fun')) {
    return places.entertainment || [];
  }
  
  // Return a mix if no specific requirement
  const allPlaces = [];
  Object.values(places).forEach(categoryPlaces => {
    allPlaces.push(...categoryPlaces.slice(0, 2));
  });
  return allPlaces;
}

module.exports = {
  getPlacesByCity,
  createDetailedItinerary,
  getPlacesByRequirement,
  getRestaurantRecommendation,
  getDinnerRecommendation,
  addNightlifeRecommendations,
  placesDatabase
};