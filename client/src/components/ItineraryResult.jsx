import React from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, Chip, Stack, Paper, Divider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LocationOn, Schedule, AttachMoney, LocalActivity, 
  Restaurant, Hotel, DirectionsWalk, Flight, TravelExplore,
  DirectionsCar, Train, DirectionsBus, LocalTaxi, AccountBalanceWallet
} from '@mui/icons-material';
import FreeMap from './GoogleMap';
import EmailItineraryDialog from './EmailItineraryDialog';

export default function ItineraryResult({ result, onBack }) {
  const [showEmailDialog, setShowEmailDialog] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState(1);
  
  // Enhanced function to parse and format the itinerary plan with compact three-column layout
  const formatPlanForDays = (plan) => {
    // Remove all ** formatting, fix encoding issues, and split into sections
    const cleanPlan = plan
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/=\d{2}/g, '') // Remove =21, =22 etc.
      .replace(/=\w{2}/g, '') // Remove other encoded characters
      .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
      .replace(/[\u2018\u2019]/g, "'") // Replace smart quotes
      .replace(/[\u201C\u201D]/g, '"'); // Replace smart double quotes
    
    const lines = cleanPlan.split('\n').filter(line => line.trim());
    
    const days = [];
    let currentDay = null;
    let seenSections = new Set(); // Track seen sections to avoid repetition
    
    // Parse the itinerary into structured day data
    for (const line of lines) {
      if (line.includes('DAY') && /DAY\s*\d+/.test(line)) {
        if (currentDay) days.push(currentDay);
        
        const dayNumber = line.match(/DAY\s*(\d+)/)?.[1] || days.length + 1;
        currentDay = {
          dayNumber: parseInt(dayNumber),
          title: line.trim(),
          activities: [],
          transportation: [],
          expenses: [],
          nightlife: [], // Add nightlife section
          totalBudget: 0
        };
        seenSections.clear(); // Reset for new day
      }
      else if (currentDay && line.trim()) {
        const lowerLine = line.toLowerCase();
        const lineContent = line.trim();
        
        // Skip repetitive sections
        if (lowerLine.includes('historic') && lowerLine.includes('cultural') && seenSections.has('historic-cultural')) {
          continue;
        }
        if (lowerLine.includes('historic') || lowerLine.includes('cultural')) {
          seenSections.add('historic-cultural');
        }
        
        // Categorize content into different sections
        if (lowerLine.includes('transport') || lowerLine.includes('taxi') || 
            lowerLine.includes('flight') || lowerLine.includes('train') || 
            lowerLine.includes('bus') || lowerLine.includes('metro')) {
          currentDay.transportation.push({
            text: lineContent,
            icon: getTransportIcon(lowerLine),
            cost: extractCost(line)
          });
        }
        else if (lowerLine.includes('bar') || lowerLine.includes('club') || 
                 lowerLine.includes('nightlife') || lowerLine.includes('pub') ||
                 (lowerLine.includes('evening') && (lowerLine.includes('drink') || lowerLine.includes('night')))) {
          currentDay.nightlife.push({
            text: lineContent,
            icon: <TravelExplore />,
            hasGoogleLink: line.includes('https://maps.google.com')
          });
        }
        else if (lowerLine.includes('cost') || lowerLine.includes('₹') || 
                 lowerLine.includes('$') || lowerLine.includes('budget') ||
                 lowerLine.includes('total') || lowerLine.includes('expense')) {
          const cost = extractCost(line);
          currentDay.expenses.push({
            text: lineContent,
            amount: cost
          });
          currentDay.totalBudget += cost;
        }
        else if (lineContent.length > 0) {
          currentDay.activities.push({
            text: lineContent,
            icon: getActivityIcon(lowerLine),
            hasGoogleLink: line.includes('https://maps.google.com')
          });
        }
      }
    }
    
    if (currentDay) days.push(currentDay);
    
    // Remove duplicates based on dayNumber
    const uniqueDays = [];
    const seenDayNumbers = new Set();
    
    for (const day of days) {
      if (!seenDayNumbers.has(day.dayNumber)) {
        seenDayNumbers.add(day.dayNumber);
        uniqueDays.push(day);
      }
    }
    
    // Sort days by dayNumber to ensure correct order
    uniqueDays.sort((a, b) => a.dayNumber - b.dayNumber);
    
    // Add nightlife recommendations based on travel type
    uniqueDays.forEach(day => {
      if (day.nightlife.length === 0 && (result.travelWith === 'friends' || result.travelWith === 'couple' || result.travelWith === 'solo')) {
        day.nightlife = generateNightlifeRecommendations(result.destination, result.travelWith);
      }
    });
    
    // If no structured days found, create a single day from all content
    if (uniqueDays.length === 0) {
      uniqueDays.push({
        dayNumber: 1,
        title: 'Your Travel Itinerary',
        activities: lines.slice(0, Math.ceil(lines.length * 0.6)).map(line => ({
          text: line,
          icon: <LocalActivity />,
          hasGoogleLink: line.includes('https://maps.google.com')
        })),
        transportation: lines.filter(line => 
          line.toLowerCase().includes('transport') || 
          line.toLowerCase().includes('taxi')
        ).map(line => ({
          text: line,
          icon: <DirectionsCar />,
          cost: extractCost(line)
        })),
        expenses: [{ text: `Total Budget: ${result.currency} ${result.budget}`, amount: result.budget }],
        nightlife: generateNightlifeRecommendations(result.destination, result.travelWith),
        totalBudget: result.budget
      });
    }
    
    return uniqueDays;
  };

  // Helper functions
  const getTransportIcon = (text) => {
    if (text.includes('flight')) return <Flight />;
    if (text.includes('train')) return <Train />;
    if (text.includes('bus')) return <DirectionsBus />;
    if (text.includes('taxi')) return <LocalTaxi />;
    return <DirectionsCar />;
  };

  const getActivityIcon = (text) => {
    if (text.includes('restaurant') || text.includes('food') || text.includes('lunch') || text.includes('dinner')) 
      return <Restaurant />;
    if (text.includes('hotel') || text.includes('accommodation')) return <Hotel />;
    if (text.includes('walk')) return <DirectionsWalk />;
    return <LocalActivity />;
  };

  const extractCost = (text) => {
    const match = text.match(/[₹$€£¥]\s*(\d+(?:,\d+)*(?:\.\d{2})?)/); 
    return match ? parseInt(match[1].replace(/,/g, '')) : 0;
  };

  // Generate nightlife recommendations based on destination and travel type
  const generateNightlifeRecommendations = (destination, travelWith) => {
    const nightlifeData = {
      'paris': {
        friends: [
          { name: '🍷 Le Mary Celeste', location: 'Le Marais', type: 'Wine Bar' },
          { name: '🎵 Le Baron', location: 'Pigalle', type: 'Nightclub' },
          { name: '🍸 Harry\'s Bar', location: 'Opera', type: 'Cocktail Bar' }
        ],
        couple: [
          { name: '🌹 Bar Hemingway', location: 'Ritz Paris', type: 'Romantic Bar' },
          { name: '🥂 Champagne Bar at Plaza Athénée', location: 'Champs-Élysées', type: 'Luxury Lounge' },
          { name: '🍷 Wine Bar at L\'Ami Jean', location: '7th Arrondissement', type: 'Intimate Wine Bar' }
        ],
        solo: [
          { name: '☕ Café de Flore', location: 'Saint-Germain', type: 'Historic Café' },
          { name: '🍺 Le Procope', location: 'Latin Quarter', type: 'Historic Pub' },
          { name: '🎭 Au Lapin Agile', location: 'Montmartre', type: 'Cabaret' }
        ]
      },
      'london': {
        friends: [
          { name: '🍺 Ye Olde Cheshire Cheese', location: 'Fleet Street', type: 'Historic Pub' },
          { name: '🎵 Fabric', location: 'Farringdon', type: 'Nightclub' },
          { name: '🍸 Sketch', location: 'Mayfair', type: 'Cocktail Bar' }
        ],
        couple: [
          { name: '🥂 Aqua Shard', location: 'London Bridge', type: 'Sky Bar' },
          { name: '🌹 American Bar at The Savoy', location: 'Covent Garden', type: 'Luxury Bar' },
          { name: '🍷 Gordon\'s Wine Bar', location: 'Embankment', type: 'Wine Cellar' }
        ],
        solo: [
          { name: '📚 The George Inn', location: 'Borough', type: 'Literary Pub' },
          { name: '🎪 Ronnie Scott\'s', location: 'Soho', type: 'Jazz Club' },
          { name: '🍻 The Churchill Arms', location: 'Notting Hill', type: 'Thai Pub' }
        ]
      },
      'tokyo': {
        friends: [
          { name: '🎌 Golden Gai', location: 'Shinjuku', type: 'Bar District' },
          { name: '🎵 Womb', location: 'Shibuya', type: 'Electronic Club' },
          { name: '🍻 Omoide Yokocho', location: 'Shinjuku', type: 'Alley Bars' }
        ],
        couple: [
          { name: '🌃 New York Grill Bar', location: 'Park Hyatt Tokyo', type: 'Sky Lounge' },
          { name: '🥂 Peter Bar', location: 'Peninsula Tokyo', type: 'Luxury Bar' },
          { name: '🌸 Bamboo Bar', location: 'Grand Hyatt Tokyo', type: 'Intimate Lounge' }
        ],
        solo: [
          { name: '🍜 Shibuya Sky Bar', location: 'Shibuya', type: 'Observation Deck' },
          { name: '🎯 Robot Restaurant', location: 'Kabukicho', type: 'Entertainment' },
          { name: '🎤 Karaoke Big Echo', location: 'Multiple Locations', type: 'Karaoke' }
        ]
      },
      'mumbai': {
        friends: [
          { name: '🍺 Toto\'s Garage', location: 'Bandra', type: 'Sports Bar' },
          { name: '🎵 Kitty Su', location: 'The Lalit', type: 'Nightclub' },
          { name: '🍸 Aer Bar', location: 'Four Seasons', type: 'Rooftop Bar' }
        ],
        couple: [
          { name: '🌅 Aer Bar', location: 'Worli', type: 'Sky Lounge' },
          { name: '🥂 Harbour Bar', location: 'Taj Mahal Palace', type: 'Heritage Bar' },
          { name: '🍷 Bayview Bar', location: 'The Oberoi', type: 'Luxury Bar' }
        ],
        solo: [
          { name: '☕ Leopold Café', location: 'Colaba', type: 'Historic Café' },
          { name: '🎭 Prithvi Theatre Café', location: 'Juhu', type: 'Cultural Café' },
          { name: '🌊 Marine Drive', location: 'South Mumbai', type: 'Scenic Walk' }
        ]
      },
      'delhi': {
        friends: [
          { name: '🍺 Connaught Place Bars', location: 'CP', type: 'Bar District' },
          { name: '🎵 Privee', location: 'Shangri-La', type: 'Nightclub' },
          { name: '🍸 PCO', location: 'Khan Market', type: 'Gastropub' }
        ],
        couple: [
          { name: '🌃 Qube Bar', location: 'Leela Palace', type: 'Luxury Bar' },
          { name: '🥂 The Bar', location: 'Imperial Hotel', type: 'Heritage Bar' },
          { name: '🍷 1911 Bar', location: 'Imperial Hotel', type: 'Classic Bar' }
        ],
        solo: [
          { name: '☕ Khan Chacha', location: 'Khan Market', type: 'Street Food' },
          { name: '📚 Oxford Bookstore Café', location: 'CP', type: 'Book Café' },
          { name: '🎪 Kingdom of Dreams', location: 'Gurgaon', type: 'Entertainment' }
        ]
      }
    };

    const cityKey = destination.toLowerCase();
    const cityNightlife = nightlifeData[cityKey] || {
      friends: [
        { name: '🍺 Local Sports Bar', location: 'City Center', type: 'Sports Bar' },
        { name: '🎵 Popular Nightclub', location: 'Entertainment District', type: 'Nightclub' },
        { name: '🍸 Trendy Cocktail Bar', location: 'Downtown', type: 'Cocktail Bar' }
      ],
      couple: [
        { name: '🌃 Rooftop Lounge', location: 'Hotel District', type: 'Sky Bar' },
        { name: '🥂 Wine Bar', location: 'Romantic Area', type: 'Wine Bar' },
        { name: '🍷 Fine Dining Bar', location: 'Upscale District', type: 'Restaurant Bar' }
      ],
      solo: [
        { name: '☕ Local Café', location: 'Cultural Quarter', type: 'Café' },
        { name: '📚 Bookstore Café', location: 'Literary District', type: 'Book Café' },
        { name: '🎭 Cultural Center', location: 'Arts District', type: 'Cultural Venue' }
      ]
    };

    const travelTypeNightlife = cityNightlife[travelWith] || cityNightlife.solo;
    
    return travelTypeNightlife.map(place => ({
      text: `${place.name} - ${place.location} (${place.type})`,
      icon: <TravelExplore />,
      hasGoogleLink: false,
      googleLink: `https://www.google.com/maps/search/${encodeURIComponent(place.name + ' ' + place.location + ' ' + destination)}`
    }));
  };  const formatPlanForGoogleLinks = (text) => {
    const googleMapsMatch = text.match(/(https:\/\/maps\.google\.com[^\s]+)/);
    const hasGoogleLink = googleMapsMatch && googleMapsMatch[1];
    
    if (hasGoogleLink) {
      const beforeLink = text.substring(0, text.indexOf(hasGoogleLink));
      const afterLink = text.substring(text.indexOf(hasGoogleLink) + hasGoogleLink.length);
      
      return (
        <Typography variant="body2" sx={{ color: '#424242', lineHeight: 1.6 }}>
          {beforeLink.replace(/^[•\-*]\s*/, '')}
          <a 
            href={hasGoogleLink} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#2E7D32', 
              fontWeight: 600, 
              textDecoration: 'none',
              borderBottom: '1px solid #2E7D32',
              marginLeft: 8,
              marginRight: 8
            }}
          >
            📍 View on Maps
          </a>
          {afterLink}
        </Typography>
      );
    }
    
    return (
      <Typography variant="body2" sx={{ color: '#424242', lineHeight: 1.6 }}>
        {text.replace(/^[•\-*]\s*/, '')}
      </Typography>
    );
  };

  const formattedDays = formatPlanForDays(result.plan);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Stack spacing={4}>
        {/* Header Section */}
        <Paper 
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
            p: 4,
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" fontWeight={700} color="#2E7D32" gutterBottom>
            Your Professional Travel Itinerary
          </Typography>
          <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <Grid item>
              <Chip 
                icon={<LocationOn />} 
                label={result.destination}
                sx={{ bgcolor: 'white', color: '#2E7D32', fontWeight: 600 }}
              />
            </Grid>
            <Grid item>
              <Chip 
                icon={<AttachMoney />} 
                label={`${result.currency} ${result.budget}`}
                sx={{ bgcolor: 'white', color: '#2E7D32', fontWeight: 600 }}
              />
            </Grid>
            <Grid item>
              <Chip 
                icon={<Schedule />} 
                label={`${result.duration} days`}
                sx={{ bgcolor: 'white', color: '#2E7D32', fontWeight: 600 }}
              />
            </Grid>
            <Grid item>
              <Chip 
                label={result.travelWith}
                sx={{ bgcolor: 'white', color: '#2E7D32', fontWeight: 600 }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Compact Modern Day Selection Tabs */}
        <Paper elevation={0} sx={{ 
          bgcolor: 'transparent', 
          p: 2, 
          mb: 3
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            gap: 1,
            p: 2,
            bgcolor: '#FAFAFA',
            borderRadius: 3,
            border: '1px solid #E0E0E0'
          }}>
            {formattedDays.map((day) => (
              <motion.div
                key={day.dayNumber}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={selectedDay === day.dayNumber ? 'contained' : 'outlined'}
                  onClick={() => setSelectedDay(day.dayNumber)}
                  size="small"
                  sx={{
                    minWidth: '70px',
                    height: '32px',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    bgcolor: selectedDay === day.dayNumber ? '#2E7D32' : 'transparent',
                    color: selectedDay === day.dayNumber ? 'white' : '#2E7D32',
                    borderColor: '#2E7D32',
                    border: '1px solid',
                    '&:hover': {
                      bgcolor: selectedDay === day.dayNumber ? '#1B5E20' : '#E8F5E8',
                      borderColor: '#1B5E20',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(46,125,50,0.2)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Day {day.dayNumber}
                </Button>
              </motion.div>
            ))}
          </Box>
        </Paper>

        {/* Enhanced Compact Four-Column Day Layout */}
        <AnimatePresence mode="wait">
          {formattedDays.filter(day => day.dayNumber === selectedDay).map((day) => (
            <motion.div
              key={day.dayNumber}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Paper elevation={1} sx={{ 
                p: 3, 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
                border: '1px solid #E0E0E0'
              }}>
                <Typography 
                  variant="h5" 
                  fontWeight={700} 
                  color="#1565C0" 
                  mb={3} 
                  textAlign="center"
                  sx={{
                    fontFamily: '"Inter", "Roboto", sans-serif',
                    fontSize: '1.4rem'
                  }}
                >
                  📅 {day.title}
                </Typography>
                
                <Grid container spacing={2}>
                  {/* Activities Column - Compact */}
                  <Grid item xs={12} sm={6} lg={3}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <Card elevation={2} sx={{ 
                        height: '320px', 
                        borderLeft: '3px solid #4CAF50',
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}>
                        <CardContent sx={{ p: 2, height: '100%', overflow: 'auto' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              p: 1, 
                              bgcolor: '#E8F5E8', 
                              borderRadius: '50%', 
                              mr: 1.5,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <LocalActivity sx={{ color: '#4CAF50', fontSize: 18 }} />
                            </Box>
                            <Typography variant="h6" fontWeight={600} color="#2E7D32" fontSize="0.9rem">
                              🎯 Activities
                            </Typography>
                          </Box>
                          
                          <Stack spacing={1.5}>
                            {day.activities.slice(0, 4).map((activity, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                              >
                                <Box sx={{ 
                                  p: 1.5, 
                                  bgcolor: '#FFFFFF', 
                                  borderRadius: 1.5,
                                  border: '1px solid #F0F0F0',
                                  '&:hover': { 
                                    bgcolor: '#F1F8E9',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}>
                                  <Typography variant="body2" sx={{ 
                                    color: '#424242', 
                                    lineHeight: 1.4,
                                    fontSize: '0.8rem',
                                    fontWeight: 500
                                  }}>
                                    {activity.text.length > 60 ? 
                                      activity.text.substring(0, 60) + '...' : 
                                      activity.text
                                    }
                                  </Typography>
                                  {activity.hasGoogleLink && (
                                    <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                                      📍 View on Maps
                                    </Typography>
                                  )}
                                </Box>
                              </motion.div>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>

                  {/* Transportation Column - Compact */}
                  <Grid item xs={12} sm={6} lg={3}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Card elevation={2} sx={{ 
                        height: '320px', 
                        borderLeft: '3px solid #2196F3',
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}>
                        <CardContent sx={{ p: 2, height: '100%', overflow: 'auto' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              p: 1, 
                              bgcolor: '#E3F2FD', 
                              borderRadius: '50%', 
                              mr: 1.5,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <DirectionsCar sx={{ color: '#2196F3', fontSize: 18 }} />
                            </Box>
                            <Typography variant="h6" fontWeight={600} color="#1976D2" fontSize="0.9rem">
                              🚗 Transport
                            </Typography>
                          </Box>
                          
                          <Stack spacing={1.5}>
                            {day.transportation.length > 0 ? day.transportation.slice(0, 4).map((transport, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                              >
                                <Box sx={{ 
                                  p: 1.5, 
                                  bgcolor: '#FFFFFF', 
                                  borderRadius: 1.5,
                                  border: '1px solid #F0F0F0',
                                  '&:hover': { 
                                    bgcolor: '#E3F2FD',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}>
                                  <Typography variant="body2" sx={{ 
                                    color: '#424242', 
                                    lineHeight: 1.4,
                                    fontSize: '0.8rem',
                                    fontWeight: 500
                                  }}>
                                    {transport.text.length > 50 ? 
                                      transport.text.substring(0, 50) + '...' : 
                                      transport.text
                                    }
                                  </Typography>
                                  {transport.cost > 0 && (
                                    <Chip 
                                      label={`${result.currency} ${transport.cost}`}
                                      size="small"
                                      sx={{ mt: 0.5, bgcolor: '#E3F2FD', color: '#1976D2', fontSize: '0.7rem', height: '20px' }}
                                    />
                                  )}
                                </Box>
                              </motion.div>
                            )) : (
                              <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                                  Transport details based on activities
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>

                  {/* Daily Budget Column - Compact */}
                  <Grid item xs={12} sm={6} lg={3}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <Card elevation={2} sx={{ 
                        height: '320px', 
                        borderLeft: '3px solid #FF9800',
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}>
                        <CardContent sx={{ p: 2, height: '100%', overflow: 'auto' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              p: 1, 
                              bgcolor: '#FFF3E0', 
                              borderRadius: '50%', 
                              mr: 1.5,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <AccountBalanceWallet sx={{ color: '#FF9800', fontSize: 18 }} />
                            </Box>
                            <Typography variant="h6" fontWeight={600} color="#F57C00" fontSize="0.9rem">
                              � Budget
                            </Typography>
                          </Box>
                          
                          <Stack spacing={1.5}>
                            {day.expenses.length > 0 ? day.expenses.slice(0, 3).map((expense, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                              >
                                <Box sx={{ 
                                  p: 1.5, 
                                  bgcolor: '#FFFFFF', 
                                  borderRadius: 1.5,
                                  border: '1px solid #F0F0F0',
                                  '&:hover': { 
                                    bgcolor: '#FFF3E0',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ 
                                      color: '#424242', 
                                      fontSize: '0.8rem',
                                      fontWeight: 500,
                                      flex: 1
                                    }}>
                                      {expense.text.length > 35 ? 
                                        expense.text.substring(0, 35) + '...' : 
                                        expense.text
                                      }
                                    </Typography>
                                    {expense.amount > 0 && (
                                      <Chip 
                                        label={`${result.currency} ${expense.amount}`}
                                        size="small"
                                        sx={{ bgcolor: '#FFF3E0', color: '#F57C00', fontSize: '0.7rem', height: '20px' }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </motion.div>
                            )) : (
                              <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Box sx={{ 
                                  p: 2, 
                                  bgcolor: '#FFF3E0', 
                                  borderRadius: 1.5,
                                  border: '1px dashed #FF9800'
                                }}>
                                  <Typography variant="caption" fontWeight={600} color="#F57C00" fontSize="0.7rem">
                                    Daily Budget
                                  </Typography>
                                  <Typography variant="h6" fontWeight={700} color="#FF9800" fontSize="1rem">
                                    {result.currency} {Math.round(result.budget / result.duration)}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>

                  {/* Nightlife Column - New */}
                  <Grid item xs={12} sm={6} lg={3}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <Card elevation={2} sx={{ 
                        height: '320px', 
                        borderLeft: '3px solid #9C27B0',
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}>
                        <CardContent sx={{ p: 2, height: '100%', overflow: 'auto' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              p: 1, 
                              bgcolor: '#F3E5F5', 
                              borderRadius: '50%', 
                              mr: 1.5,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <TravelExplore sx={{ color: '#9C27B0', fontSize: 18 }} />
                            </Box>
                            <Typography variant="h6" fontWeight={600} color="#7B1FA2" fontSize="0.9rem">
                              🌃 {result.travelWith === 'friends' ? 'Nightlife' : 
                                   result.travelWith === 'couple' ? 'Evening' : 'Culture'}
                            </Typography>
                          </Box>
                          
                          <Stack spacing={1.5}>
                            {day.nightlife && day.nightlife.length > 0 ? day.nightlife.slice(0, 4).map((nightlife, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                              >
                                <Box sx={{ 
                                  p: 1.5, 
                                  bgcolor: '#FFFFFF', 
                                  borderRadius: 1.5,
                                  border: '1px solid #F0F0F0',
                                  '&:hover': { 
                                    bgcolor: '#F3E5F5',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}>
                                  <Typography variant="body2" sx={{ 
                                    color: '#424242', 
                                    lineHeight: 1.4,
                                    fontSize: '0.8rem',
                                    fontWeight: 500
                                  }}>
                                    {nightlife.text.length > 55 ? 
                                      nightlife.text.substring(0, 55) + '...' : 
                                      nightlife.text
                                    }
                                  </Typography>
                                  {nightlife.googleLink && (
                                    <Typography 
                                      variant="caption" 
                                      sx={{ color: '#9C27B0', fontWeight: 600, cursor: 'pointer' }}
                                      onClick={() => window.open(nightlife.googleLink, '_blank')}
                                    >
                                      📍 View on Maps
                                    </Typography>
                                  )}
                                </Box>
                              </motion.div>
                            )) : (
                              <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                                  Evening recommendations based on travel style
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Map Section */}
        <Card 
          elevation={1}
          sx={{
            borderRadius: 2,
            borderLeft: '4px solid #81C784',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box 
                sx={{ 
                  p: 0.8, 
                  borderRadius: 1.5, 
                  bgcolor: '#E8F5E8',
                  color: '#2E7D32',
                  mr: 1.5,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <LocationOn fontSize="small" />
              </Box>
              <Typography variant="subtitle1" fontWeight={700} color="#2E7D32">
                📍 Destination Map
              </Typography>
            </Box>
            
            <Box sx={{ borderRadius: 2, overflow: 'hidden', mb: 1 }}>
              <FreeMap destination={result.destination} />
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              Interactive map with OpenStreetMap
            </Typography>
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button 
            variant="contained" 
            onClick={onBack}
            sx={{ 
              borderRadius: 2, 
              py: 1.2,
              px: 3,
              background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
              boxShadow: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                boxShadow: '0 4px 8px rgba(129, 199, 132, 0.3)'
              }
            }}
          >
            ← Plan New Trip
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => setShowEmailDialog(true)}
            sx={{ 
              borderRadius: 2, 
              py: 1.2,
              px: 3,
              borderColor: '#81C784',
              color: '#2E7D32',
              '&:hover': {
                borderColor: '#66BB6A',
                bgcolor: 'rgba(129, 199, 132, 0.08)'
              }
            }}
          >
            � Download PDF
          </Button>
        </Stack>

        {/* Email Dialog */}
        <EmailItineraryDialog 
          open={showEmailDialog}
          onClose={() => setShowEmailDialog(false)}
          itinerary={result.plan}
          destination={result.destination}
          duration={result.duration}
        />
      </Stack>
    </motion.div>
  );
}
