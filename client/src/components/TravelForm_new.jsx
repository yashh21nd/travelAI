import React, { useState } from 'react';
import { 
  Box, TextField, Button, Stack, FormControl, InputLabel, Select, MenuItem, 
  FormControlLabel, Checkbox, Typography, Paper, Grid, Card, CardContent,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { Send, LocationOn, AttachMoney, Schedule, People } from '@mui/icons-material';
import axios from 'axios';

export default function TravelForm({ onResult }) {
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [travelWith, setTravelWith] = useState('family');
  const [userLocation, setUserLocation] = useState('');
  const [needAccommodation, setNeedAccommodation] = useState(false);
  const [loading, setLoading] = useState(false);

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
      
      // Use environment variable for API URL, fallback to local development
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await axios.post(`${apiUrl}/api/plan`, requestData);
      onResult(response.data);
    } catch (err) {
      console.error('API Error:', err);
      alert('Failed to generate itinerary. Please make sure the backend server is running on port 5001.');
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
    <Paper elevation={0} sx={{ maxWidth: 800, mx: 'auto' }}>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Grid container spacing={3}>
          {/* Location Details Card */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Travel Locations
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      label="From (Your Current Location)" 
                      value={userLocation} 
                      onChange={e => setUserLocation(e.target.value)} 
                      required 
                      fullWidth
                      variant="filled"
                      sx={{ 
                        '& .MuiFilledInput-root': { 
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      label="To (Destination)" 
                      value={destination} 
                      onChange={e => setDestination(e.target.value)} 
                      required 
                      fullWidth
                      variant="filled"
                      sx={{ 
                        '& .MuiFilledInput-root': { 
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Budget & Duration Card */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Budget & Timeline
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField 
                      label="Budget" 
                      type="number" 
                      value={budget} 
                      onChange={e => setBudget(e.target.value)} 
                      required 
                      fullWidth
                      variant="filled"
                      sx={{ 
                        '& .MuiFilledInput-root': { 
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="filled" sx={{ 
                      '& .MuiFilledInput-root': { 
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                      }
                    }}>
                      <InputLabel sx={{ color: 'rgba(0,0,0,0.6)' }}>Currency</InputLabel>
                      <Select
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                      >
                        {currencies.map((curr) => (
                          <MenuItem key={curr.value} value={curr.value}>
                            {curr.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
                        Trip Duration
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((days) => (
                          <Button
                            key={days}
                            variant={duration === days.toString() ? 'contained' : 'outlined'}
                            onClick={() => setDuration(days.toString())}
                            size="small"
                            sx={{
                              minWidth: '50px',
                              height: '36px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              borderRadius: 1.5,
                              mb: 0.5,
                              backgroundColor: duration === days.toString() ? 'primary.main' : 'rgba(255,255,255,0.9)',
                              color: duration === days.toString() ? 'white' : 'primary.main',
                              border: '2px solid',
                              borderColor: duration === days.toString() ? 'primary.main' : 'rgba(25,118,210,0.3)',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                backgroundColor: duration === days.toString() ? 'primary.dark' : 'rgba(255,255,255,1)',
                                borderColor: 'primary.main'
                              }
                            }}
                          >
                            {days === 1 ? '1 Day' : `${days}D`}
                          </Button>
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Travel Preferences Card */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Travel Preferences
                  </Typography>
                </Box>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <FormControl fullWidth variant="filled" sx={{ 
                      '& .MuiFilledInput-root': { 
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                      }
                    }}>
                      <InputLabel sx={{ color: 'rgba(0,0,0,0.6)' }}>Traveling With</InputLabel>
                      <Select
                        value={travelWith}
                        onChange={e => setTravelWith(e.target.value)}
                      >
                        <MenuItem value="family">👨‍👩‍👧‍👦 Family (Family-friendly places)</MenuItem>
                        <MenuItem value="friends">🎉 Friends (Nightlife, bars, popular spots)</MenuItem>
                        <MenuItem value="solo">🚶 Solo Travel (Flexible itinerary)</MenuItem>
                        <MenuItem value="couple">💕 Couple (Romantic locations)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={needAccommodation}
                          onChange={e => setNeedAccommodation(e.target.checked)}
                          sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                        />
                      }
                      label={<Typography variant="body2" sx={{ color: 'white' }}>Need Accommodation Help?</Typography>}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                disabled={loading}
                endIcon={<Send />}
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 3,
                  py: 2,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Planning Your Perfect Trip...' : 'Generate Professional Itinerary'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </motion.form>
    </Paper>
  );
}