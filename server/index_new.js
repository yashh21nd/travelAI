require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Free Hugging Face API for AI text generation (no API key required)
async function generateAIItinerary(destination, budget, duration, currency, travelWith, userLocation, needAccommodation) {
  try {
    const prompt = `Create a detailed professional travel itinerary for ${duration} days in ${destination} with budget ${budget} ${currency}, traveling with ${travelWith} from ${userLocation}`;
    
    // Try Hugging Face free inference API
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      { 
        inputs: prompt,
        parameters: { max_length: 500, temperature: 0.7 }
      },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000
      }
    );
    
    if (response.data && response.data[0]?.generated_text) {
      return response.data[0].generated_text;
    }
    throw new Error('No AI response');
  } catch (error) {
    console.log('AI service unavailable, using enhanced professional generator');
    return generateProfessionalItinerary(destination, budget, duration, currency, travelWith, userLocation, needAccommodation);
  }
}

// Enhanced professional itinerary generator with detailed day-wise plans
function generateProfessionalItinerary(destination, budget, duration, currency, travelWith, userLocation, needAccommodation) {
  // Currency symbols
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CNY: '¥'
  };

  const symbol = currencySymbols[currency] || currency;

  // Professional destination database with exact places
  const destinations = {
    'Paris': {
      places: [
        { name: 'Eiffel Tower', area: 'Champ de Mars', type: 'landmark', time: '2-3 hours' },
        { name: 'Louvre Museum', area: '1st Arrondissement', type: 'museum', time: '4-5 hours' },
        { name: 'Notre-Dame Cathedral', area: 'Île de la Cité', type: 'historic', time: '1-2 hours' },
        { name: 'Arc de Triomphe', area: 'Champs-Élysées', type: 'landmark', time: '1 hour' },
        { name: 'Versailles Palace', area: 'Versailles', type: 'palace', time: 'Full day' },
        { name: 'Montmartre & Sacré-Cœur', area: '18th Arrondissement', type: 'district', time: '3-4 hours' }
      ],
      familySpots: ['Disneyland Paris', 'Luxembourg Gardens', 'Aquarium de Paris', 'Parc de la Villette'],
      friendsSpots: ['Latin Quarter bars', 'Pigalle nightlife', 'Le Marais wine bars', 'Rooftop bars Champs-Élysées'],
      food: ['French pastries at Du Pain et des Idées', 'Coq au vin at Le Comptoir du 7ème', 'Escargot at L\'Ami Jean', 'Macarons at Ladurée'],
      accommodation: { budget: 'Hotel des Jeunes (€45/night)', mid: 'Hotel Malte Opera (€120/night)', luxury: 'Le Meurice (€800/night)' }
    },
    'Tokyo': {
      places: [
        { name: 'Tokyo Skytree', area: 'Sumida', type: 'landmark', time: '2-3 hours' },
        { name: 'Sensoji Temple', area: 'Asakusa', type: 'temple', time: '2 hours' },
        { name: 'Shibuya Crossing', area: 'Shibuya', type: 'landmark', time: '1 hour' },
        { name: 'Meiji Shrine', area: 'Harajuku', type: 'shrine', time: '1-2 hours' },
        { name: 'Tsukiji Outer Market', area: 'Tsukiji', type: 'market', time: '2-3 hours' },
        { name: 'Imperial Palace', area: 'Chiyoda', type: 'historic', time: '2 hours' }
      ],
      familySpots: ['Tokyo Disneyland', 'Ueno Zoo', 'TeamLab Borderless', 'Odaiba Beach'],
      friendsSpots: ['Golden Gai bars', 'Robot Restaurant', 'Karaoke in Shibuya', 'Roppongi nightlife'],
      food: ['Sushi at Jiro\'s', 'Ramen at Ichiran', 'Tempura at Daikokuya', 'Wagyu at Kawamura'],
      accommodation: { budget: 'Khaosan Tokyo (¥3,500/night)', mid: 'Hotel Gracery Shinjuku (¥15,000/night)', luxury: 'Park Hyatt Tokyo (¥80,000/night)' }
    },
    'London': {
      places: [
        { name: 'Big Ben & Westminster', area: 'Westminster', type: 'landmark', time: '1-2 hours' },
        { name: 'Tower Bridge', area: 'Southwark', type: 'landmark', time: '1-2 hours' },
        { name: 'Buckingham Palace', area: 'Westminster', type: 'palace', time: '2 hours' },
        { name: 'British Museum', area: 'Bloomsbury', type: 'museum', time: '3-4 hours' },
        { name: 'London Eye', area: 'South Bank', type: 'attraction', time: '1 hour' },
        { name: 'Camden Market', area: 'Camden', type: 'market', time: '2-3 hours' }
      ],
      familySpots: ['London Zoo', 'Warner Bros Studio Tour', 'HMS Belfast', 'Greenwich Observatory'],
      friendsSpots: ['Shoreditch bars', 'Covent Garden pubs', 'Fabric nightclub', 'Borough Market'],
      food: ['Fish & chips at Poppies', 'Sunday roast at The Ivy', 'Afternoon tea at Fortnum & Mason', 'Curry at Dishoom'],
      accommodation: { budget: 'Generator London (£35/night)', mid: 'Premier Inn County Hall (£150/night)', luxury: 'The Savoy (£600/night)' }
    },
    'New York': {
      places: [
        { name: 'Statue of Liberty', area: 'Liberty Island', type: 'landmark', time: 'Half day' },
        { name: 'Central Park', area: 'Manhattan', type: 'park', time: '2-4 hours' },
        { name: 'Times Square', area: 'Midtown', type: 'landmark', time: '1-2 hours' },
        { name: 'Brooklyn Bridge', area: 'Brooklyn/Manhattan', type: 'landmark', time: '1-2 hours' },
        { name: 'Empire State Building', area: 'Midtown', type: 'landmark', time: '2 hours' },
        { name: '9/11 Memorial', area: 'Financial District', type: 'memorial', time: '2-3 hours' }
      ],
      familySpots: ['American Museum of Natural History', 'Central Park Zoo', 'Coney Island', 'Children\'s Museum of Manhattan'],
      friendsSpots: ['Rooftop bars Manhattan', 'East Village bars', 'Williamsburg nightlife', 'Meatpacking District clubs'],
      food: ['Pizza at Joe\'s', 'Bagels at Russ & Daughters', 'Steaks at Peter Luger', 'Cheesecake at Junior\'s'],
      accommodation: { budget: 'HI New York City ($60/night)', mid: 'Pod Hotels ($200/night)', luxury: 'The Plaza ($800/night)' }
    }
  };

  const key = destination.toLowerCase();
  const cityData = destinations[Object.keys(destinations).find(city => 
    key.includes(city.toLowerCase()) || city.toLowerCase().includes(key)
  )] || {
    places: [
      { name: 'Historic City Center', area: 'Downtown', type: 'historic', time: '2-3 hours' },
      { name: 'Main Cultural Museum', area: 'Cultural District', type: 'museum', time: '2-3 hours' },
      { name: 'Local Market', area: 'Market District', type: 'market', time: '2 hours' },
      { name: 'Scenic Viewpoint', area: 'Hills/Waterfront', type: 'nature', time: '1-2 hours' }
    ],
    familySpots: ['Local parks', 'Family museums', 'Recreational areas', 'Kid-friendly attractions'],
    friendsSpots: ['Local bars', 'Popular nightlife areas', 'Trendy restaurants', 'Entertainment districts'],
    food: ['Local specialties', 'Street food', 'Traditional restaurants', 'Popular cafes'],
    accommodation: { budget: 'Budget hotels (20-40/night)', mid: 'Mid-range hotels (80-150/night)', luxury: 'Luxury hotels (300-500/night)' }
  };

  const dailyBudget = Math.round(budget / duration);
  const accommodation = Math.round(dailyBudget * 0.4);
  const food = Math.round(dailyBudget * 0.3);
  const activities = Math.round(dailyBudget * 0.2);
  const transport = Math.round(dailyBudget * 0.1);

  let itinerary = `**PROFESSIONAL TRAVEL ITINERARY**\n\n`;
  itinerary += `**Destination:** ${destination}\n`;
  itinerary += `**Duration:** ${duration} days\n`;
  itinerary += `**Budget:** ${symbol}${budget} ${currency}\n`;
  itinerary += `**Travel Style:** ${travelWith}\n`;
  itinerary += `**Departing from:** ${userLocation}\n\n`;
  
  itinerary += `**DETAILED DAY-BY-DAY ITINERARY**\n\n`;
  
  // Generate day-by-day itinerary
  for (let day = 1; day <= duration && day <= cityData.places.length; day++) {
    const place = cityData.places[day - 1];
    itinerary += `**DAY ${day}: ${place.name}**\n`;
    itinerary += `• Location: ${place.area}\n`;
    itinerary += `• Duration: ${place.time}\n`;
    itinerary += `• Type: ${place.type}\n`;
    
    if (day === 1) {
      itinerary += `• Morning: Arrival and check-in\n`;
      itinerary += `• Afternoon: Visit ${place.name}\n`;
      itinerary += `• Evening: Local dinner and rest\n`;
    } else {
      itinerary += `• Full day exploration of ${place.name} and surrounding area\n`;
    }
    
    // Add travel companion specific suggestions
    if (travelWith === 'family' && cityData.familySpots[day - 1]) {
      const familySpot = cityData.familySpots[day - 1];
      itinerary += `• Family Activity: ${familySpot}\n`;
    } else if (travelWith === 'friends' && cityData.friendsSpots[day - 1]) {
      const friendsSpot = cityData.friendsSpots[day - 1];
      itinerary += `• Evening Plans: ${friendsSpot}\n`;
    }
    itinerary += `\n`;
  }
  
  // Budget breakdown
  itinerary += `**COMPREHENSIVE BUDGET BREAKDOWN**\n\n`;
  itinerary += `• Accommodation: ${symbol}${accommodation}/day × ${duration} days = ${symbol}${accommodation * duration}\n`;
  itinerary += `• Food & Dining: ${symbol}${food}/day × ${duration} days = ${symbol}${food * duration}\n`;
  itinerary += `• Activities & Tours: ${symbol}${activities}/day × ${duration} days = ${symbol}${activities * duration}\n`;
  itinerary += `• Transportation: ${symbol}${transport}/day × ${duration} days = ${symbol}${transport * duration}\n`;
  itinerary += `• **Total: ${symbol}${budget} ${currency}**\n\n`;
  
  // Must-try experiences
  itinerary += `**MUST-TRY LOCAL EXPERIENCES**\n\n`;
  cityData.food.forEach(food => itinerary += `• ${food}\n`);
  
  // Accommodation recommendations
  if (needAccommodation) {
    itinerary += `\n**ACCOMMODATION RECOMMENDATIONS**\n`;
    itinerary += `*We'll help you find the best discounted rates (3% booking commission)*\n\n`;
    itinerary += `• Budget Option: ${cityData.accommodation.budget}\n`;
    itinerary += `• Mid-Range: ${cityData.accommodation.mid}\n`;
    itinerary += `• Luxury: ${cityData.accommodation.luxury}\n`;
    itinerary += `• Contact us for exclusive discounts and instant booking\n\n`;
  }
  
  // Professional travel tips
  itinerary += `**PROFESSIONAL TRAVEL TIPS**\n\n`;
  itinerary += `• Book flights 6-8 weeks in advance for best rates\n`;
  itinerary += `• Download offline maps and translation apps\n`;
  itinerary += `• Keep digital and physical copies of important documents\n`;
  itinerary += `• Pack according to local weather and cultural norms\n`;
  itinerary += `• Research local tipping customs and payment methods\n`;
  itinerary += `• Consider travel insurance for peace of mind\n\n`;
  
  if (needAccommodation) {
    itinerary += `**CONTACT FOR BOOKINGS**\n`;
    itinerary += `For accommodation bookings with exclusive discounts, contact our travel specialists.\n`;
    itinerary += `*Commission: 3% on accommodation bookings*\n`;
  }
  
  return itinerary;
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));