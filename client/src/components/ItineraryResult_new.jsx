import React from 'react';
import { 
  Box, Typography, Button, Divider, Stack, Card, CardContent, 
  Grid, Paper, Chip, IconButton
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  ArrowBack, LocationOn, AttachMoney, Schedule, People, 
  Restaurant, Hotel, TipsAndUpdates, Map
} from '@mui/icons-material';
import FreeMap from './GoogleMap';

export default function ItineraryResult({ result, onBack }) {
  // Parse the plan to remove ** formatting and create sections
  const formatPlan = (planText) => {
    const sections = planText.split('\n\n');
    return sections.map((section, index) => {
      if (section.includes('PROFESSIONAL TRAVEL ITINERARY')) {
        return null; // Skip header
      }
      
      if (section.includes('DETAILED DAY-BY-DAY ITINERARY')) {
        return (
          <Card key={index} elevation={3} sx={{ mb: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 2 }} />
                Daily Itinerary
              </Typography>
            </CardContent>
          </Card>
        );
      }
      
      if (section.includes('DAY ')) {
        const lines = section.split('\n');
        const dayTitle = lines[0].replace(/\*\*/g, '');
        const details = lines.slice(1);
        
        return (
          <Card key={index} elevation={2} sx={{ mb: 2, borderLeft: '4px solid #667eea' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
                {dayTitle}
              </Typography>
              {details.map((detail, i) => (
                <Typography key={i} variant="body2" sx={{ ml: 1, mb: 0.5 }}>
                  {detail.replace(/^\*\*/g, '').replace(/\*\*$/g, '')}
                </Typography>
              ))}
            </CardContent>
          </Card>
        );
      }
      
      if (section.includes('BUDGET BREAKDOWN')) {
        return (
          <Card key={index} elevation={3} sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney sx={{ mr: 2 }} />
                Budget Breakdown
              </Typography>
              <Box sx={{ pl: 2 }}>
                {section.split('\n').slice(2).map((line, i) => {
                  if (line.trim()) {
                    return (
                      <Typography key={i} variant="body1" sx={{ color: 'white', mb: 1 }}>
                        {line.replace(/^\*\*/g, '').replace(/\*\*$/g, '').replace(/• /g, '')}
                      </Typography>
                    );
                  }
                  return null;
                })}
              </Box>
            </CardContent>
          </Card>
        );
      }
      
      if (section.includes('MUST-TRY LOCAL EXPERIENCES')) {
        return (
          <Card key={index} elevation={3} sx={{ mb: 3, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', mb: 2 }}>
                <Restaurant sx={{ mr: 2 }} />
                Must-Try Experiences
              </Typography>
              <Box sx={{ pl: 2 }}>
                {section.split('\n').slice(2).map((line, i) => {
                  if (line.trim() && line.includes('•')) {
                    return (
                      <Typography key={i} variant="body1" sx={{ color: 'white', mb: 1 }}>
                        {line.replace(/• /g, '')}
                      </Typography>
                    );
                  }
                  return null;
                })}
              </Box>
            </CardContent>
          </Card>
        );
      }
      
      if (section.includes('ACCOMMODATION RECOMMENDATIONS')) {
        return (
          <Card key={index} elevation={3} sx={{ mb: 3, background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: '#333', fontWeight: 700, display: 'flex', alignItems: 'center', mb: 2 }}>
                <Hotel sx={{ mr: 2 }} />
                Accommodation Options
              </Typography>
              <Box sx={{ pl: 2 }}>
                {section.split('\n').slice(3).map((line, i) => {
                  if (line.trim() && line.includes('•')) {
                    return (
                      <Typography key={i} variant="body1" sx={{ color: '#333', mb: 1 }}>
                        {line.replace(/• /g, '')}
                      </Typography>
                    );
                  }
                  return null;
                })}
              </Box>
            </CardContent>
          </Card>
        );
      }
      
      if (section.includes('PROFESSIONAL TRAVEL TIPS')) {
        return (
          <Card key={index} elevation={3} sx={{ mb: 3, background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: '#333', fontWeight: 700, display: 'flex', alignItems: 'center', mb: 2 }}>
                <TipsAndUpdates sx={{ mr: 2 }} />
                Professional Tips
              </Typography>
              <Box sx={{ pl: 2 }}>
                {section.split('\n').slice(2).map((line, i) => {
                  if (line.trim() && line.includes('•')) {
                    return (
                      <Typography key={i} variant="body1" sx={{ color: '#333', mb: 1 }}>
                        {line.replace(/• /g, '')}
                      </Typography>
                    );
                  }
                  return null;
                })}
              </Box>
            </CardContent>
          </Card>
        );
      }
      
      return null;
    }).filter(Boolean);
  };

  const formattedSections = formatPlan(result.plan);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <Paper elevation={4} sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        p: 3,
        mb: 3,
        borderRadius: 3
      }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Your Professional Travel Itinerary
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item>
            <Chip 
              icon={<LocationOn />} 
              label={`${result.userLocation} → ${result.destination}`}
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Grid>
          <Grid item>
            <Chip 
              icon={<AttachMoney />} 
              label={`${result.currency} ${result.budget}`}
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Grid>
          <Grid item>
            <Chip 
              icon={<Schedule />} 
              label={`${result.duration} days`}
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Grid>
          <Grid item>
            <Chip 
              icon={<People />} 
              label={result.travelWith}
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Trip Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Trip Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Destination:</strong> {result.destination}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Duration:</strong> {result.duration} days
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Budget:</strong> {result.currency} {result.budget}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Travel Style:</strong> {result.travelWith}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Departing from:</strong> {result.userLocation}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Map sx={{ mr: 1 }} />
                Destination Map
              </Typography>
              <FreeMap destination={result.destination} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                OpenStreetMap (Free & Open Source)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Formatted Itinerary Sections */}
      <Box sx={{ mb: 3 }}>
        {formattedSections}
      </Box>
      
      {/* Back Button */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button 
          variant="contained" 
          onClick={onBack}
          startIcon={<ArrowBack />}
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            py: 1.5,
            px: 4,
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Plan Another Trip
        </Button>
      </Box>
    </motion.div>
  );
}