import React, { useState } from 'react';
import { Box, TextField, Button, Stack, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import AccommodationBooking from './AccommodationBooking';
import { brandColors } from '../theme';

export default function TravelForm({ onResult }) {
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [travelWith, setTravelWith] = useState('family');
  const [userLocation, setUserLocation] = useState('');
  const [needAccommodation, setNeedAccommodation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAccommodationBooking, setShowAccommodationBooking] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestData = {
        destination,
        budget: parseFloat(budget),
        duration: parseInt(duration),
        currency,
        travelWith,
        userLocation,
        needAccommodation
      };
      
      let response;
      try {
        response = await axios.post('/api/plan', requestData);
      } catch (proxyError) {
        console.log('Proxy failed, trying direct URL');
        response = await axios.post('http://localhost:5001/api/plan', requestData);
      }
      onResult(response.data);
    } catch (err) {
      console.error('API Error:', err);
      alert('Failed to generate itinerary. Please make sure the backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const currencies = [
    { value: 'USD', label: 'USD ($) - United States' },
    { value: 'EUR', label: 'EUR (€) - Europe' },
    { value: 'GBP', label: 'GBP (£) - United Kingdom' },
    { value: 'INR', label: 'INR (₹) - India' },
    { value: 'JPY', label: 'JPY (¥) - Japan' },
    { value: 'CAD', label: 'CAD (C$) - Canada' },
    { value: 'AUD', label: 'AUD (A$) - Australia' },
    { value: 'CNY', label: 'CNY (¥) - China' },
  ];

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Stack spacing={3}>
        <TextField 
          label="Your Current Location" 
          value={userLocation} 
          onChange={e => setUserLocation(e.target.value)} 
          required 
          fullWidth 
          helperText="Where are you traveling from?"
        />
        
        <TextField 
          label="Destination" 
          value={destination} 
          onChange={e => setDestination(e.target.value)} 
          required 
          fullWidth 
          helperText="Where would you like to visit?"
        />
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField 
            label="Budget" 
            type="number" 
            value={budget} 
            onChange={e => setBudget(e.target.value)} 
            required 
            fullWidth 
            helperText="Total budget for the trip"
          />
          
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
              value={currency}
              label="Currency"
              onChange={e => setCurrency(e.target.value)}
            >
              {currencies.map((curr) => (
                <MenuItem key={curr.value} value={curr.value}>
                  {curr.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Trip Duration
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((days) => (
              <Button
                key={days}
                variant={duration === days.toString() ? 'contained' : 'outlined'}
                onClick={() => setDuration(days.toString())}
                sx={{
                  minWidth: '60px',
                  height: '40px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                {days === 1 ? '1 Day' : `${days} Days`}
              </Button>
            ))}
          </Stack>
        </Box>
        
        <FormControl fullWidth>
          <InputLabel>Traveling With</InputLabel>
          <Select
            value={travelWith}
            label="Traveling With"
            onChange={e => setTravelWith(e.target.value)}
          >
            <MenuItem value="family">Family (Family-friendly places)</MenuItem>
            <MenuItem value="friends">Friends (Nightlife, bars, popular spots)</MenuItem>
            <MenuItem value="solo">Solo Travel (Flexible itinerary)</MenuItem>
            <MenuItem value="couple">Couple (Romantic locations)</MenuItem>
          </Select>
        </FormControl>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={needAccommodation}
              onChange={e => setNeedAccommodation(e.target.checked)}
            />
          }
          label={<Typography variant="body2">I need help finding accommodations (We'll find discounted rates)</Typography>}
        />

        {needAccommodation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Stack spacing={2} sx={{ mt: 2, p: 2, bgcolor: 'rgba(129, 199, 132, 0.1)', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#2E7D32' }} fontWeight={600}>
                Accommodation Details
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  type="date"
                  label="Check-in Date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  type="date"
                  label="Check-out Date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  type="number"
                  label="Number of Guests"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 10 }}
                  fullWidth
                />
              </Stack>
            </Stack>
          </motion.div>
        )}
        
        <Button 
          type="submit" 
          variant="contained" 
          size="large" 
          disabled={loading} 
          sx={{ 
            borderRadius: 2, 
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
            background: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.primary.dark} 100%)`,
            color: 'white',
            boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              background: `linear-gradient(135deg, ${brandColors.primary.dark} 0%, ${brandColors.primary.main} 100%)`,
              boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
              transform: 'translateY(-2px)'
            },
            '&:disabled': {
              background: 'rgba(0,0,0,0.12)',
              color: 'rgba(0,0,0,0.26)'
            }
          }}
        >
          {loading ? 'Planning Your Perfect Trip...' : 'Generate Personalized Itinerary'}
        </Button>

        {needAccommodation && checkIn && checkOut && destination && (
          <Button
            variant="outlined"
            size="large"
            onClick={() => setShowAccommodationBooking(true)}
            sx={{ 
              borderRadius: 2, 
              py: 1.5,
              background: 'linear-gradient(135deg, rgba(129, 199, 132, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(129, 199, 132, 0.2) 0%, rgba(102, 187, 106, 0.2) 100%)',
              }
            }}
          >
            🏨 Find Professional Accommodations Now
          </Button>
        )}
      </Stack>

      {showAccommodationBooking && (
        <AccommodationBooking
          destination={destination}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          currency={currency}
          tripDuration={parseInt(duration) || 1}
          onClose={() => setShowAccommodationBooking(false)}
        />
      )}
    </motion.form>
  );
}
