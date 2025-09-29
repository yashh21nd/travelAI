import React, { useState } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  Card, CardContent, Grid, Chip, Avatar, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Divider, Alert, FormControl, InputLabel,
  Select, MenuItem, Stack
} from '@mui/material';
import {
  Hotel, Star, TrendingDown, TrendingUp, Launch,
  CompareArrows, MonetizationOn, CheckCircle, Schedule,
  Sort, FilterList
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import AffiliateDisclosure from './AffiliateDisclosure';

export default function AccommodationBooking({ destination, checkIn, checkOut, guests, currency, tripDuration, onClose }) {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('price-low-high');
  const [trackingMessage, setTrackingMessage] = useState('');
  const [dateError, setDateError] = useState('');

  React.useEffect(() => {
    fetchAccommodations();
  }, []);

  // Sort accommodations based on selected criteria
  const sortedAccommodations = React.useMemo(() => {
    let filtered = selectedCategory === 'All' 
      ? accommodations 
      : accommodations.filter(acc => acc.category === selectedCategory);

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low-high':
          return a.totalPrice - b.totalPrice;
        case 'price-high-low':
          return b.totalPrice - a.totalPrice;
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          // Sort by number of providers (more providers = more popular)
          return b.providers.length - a.providers.length;
        case 'discount':
          // Sort by best discount (lowest price among providers)
          const aDiscount = Math.min(...a.providers.map(p => p.price));
          const bDiscount = Math.min(...b.providers.map(p => p.price));
          return aDiscount - bDiscount;
        default:
          return 0;
      }
    });
  }, [accommodations, selectedCategory, sortBy]);

  const fetchAccommodations = async () => {
    setLoading(true);
    setDateError('');
    try {
      const response = await axios.post('/api/accommodations', {
        destination,
        checkIn,
        checkOut,
        guests,
        currency,
        tripDuration
      });
      
      if (response.data.success) {
        setAccommodations(response.data.data.accommodations);
      } else {
        // Handle date validation error
        setDateError(response.data.error);
      }
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setDateError(error.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (provider, accommodation) => {
    try {
      const trackingResponse = await axios.post('/api/track-booking', {
        provider: provider.name,
        bookingUrl: provider.bookingUrl,
        accommodationName: accommodation.name,
        totalPrice: provider.price,
        commission: provider.commission,
        userId: 'user_' + Date.now()
      });

      setTrackingMessage(`Booking tracked! Expected commission: $${trackingResponse.data.expectedCommission}`);
      
      // Redirect to booking provider
      setTimeout(() => {
        window.open(provider.bookingUrl, '_blank');
      }, 1000);

    } catch (error) {
      console.error('Error tracking booking:', error);
    }
  };

  const categories = ['All', 'Budget', 'Mid-Range', 'Luxury'];

  return (
    <Dialog 
      open={true} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Hotel sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700}>
            Professional Accommodation Finder
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
          {destination} • {checkIn} to {checkOut} • {guests} guests
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Date Error Alert */}
        {dateError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {dateError}
          </Alert>
        )}

        {/* Enhanced Filters and Sorting - Fixed Layout */}
        <Box sx={{ mt: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                  startAdornment={<FilterList sx={{ mr: 1, fontSize: 20 }} />}
                >
                  <MenuItem value="All">All Categories</MenuItem>
                  <MenuItem value="Budget">💰 Budget</MenuItem>
                  <MenuItem value="Mid-Range">🏨 Mid-Range</MenuItem>
                  <MenuItem value="Luxury">👑 Luxury</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                  startAdornment={<Sort sx={{ mr: 1, fontSize: 20 }} />}
                >
                  <MenuItem value="price-low-high">💸 Price: Low to High</MenuItem>
                  <MenuItem value="price-high-low">💎 Price: High to Low</MenuItem>
                  <MenuItem value="rating">⭐ Highest Rated</MenuItem>
                  <MenuItem value="popularity">🔥 Most Popular</MenuItem>
                  <MenuItem value="discount">🎯 Best Deals</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={12} md={4}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, textAlign: 'center' }}>
                📊 {sortedAccommodations.length} accommodations found
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Tracking Message */}
        <AnimatePresence>
          {trackingMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert severity="success" sx={{ mb: 2 }}>
                {trackingMessage}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Analyzing prices from multiple booking platforms...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comparing rates from Booking.com, Expedia, Hotels.com, Agoda & more
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {sortedAccommodations.map((accommodation, index) => (
              <Grid item xs={12} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card elevation={3} sx={{ 
                    borderRadius: 3,
                    border: accommodation.category === 'Budget' ? '2px solid #4caf50' :
                            accommodation.category === 'Mid-Range' ? '2px solid #ff9800' :
                            '2px solid #9c27b0',
                    '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s' }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            {accommodation.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip 
                              label={accommodation.category}
                              size="small"
                              color={accommodation.category === 'Budget' ? 'success' :
                                     accommodation.category === 'Mid-Range' ? 'warning' : 'secondary'}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Star sx={{ color: '#ffd700', fontSize: 18 }} />
                              <Typography variant="body2" sx={{ ml: 0.5 }}>
                                {accommodation.rating.toFixed(1)}
                              </Typography>
                            </Box>
                          </Box>
                          {/* Amenities */}
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            <strong>Amenities:</strong> {accommodation.amenities}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            <strong>Per Night:</strong> {currency === 'USD' ? '$' : 
                             currency === 'EUR' ? '€' : 
                             currency === 'GBP' ? '£' : 
                             currency === 'INR' ? '₹' : currency}{accommodation.pricePerNight}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h5" fontWeight={700} color="primary">
                            {currency === 'USD' ? '$' : 
                             currency === 'EUR' ? '€' : 
                             currency === 'GBP' ? '£' : 
                             currency === 'INR' ? '₹' : currency}{accommodation.totalPrice}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total for stay
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Price Comparison Across Platforms:
                      </Typography>

                      <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Platform</strong></TableCell>
                              <TableCell align="right"><strong>Total Price</strong></TableCell>
                              <TableCell align="center"><strong>Availability</strong></TableCell>
                              <TableCell align="center"><strong>Book Now</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {accommodation.providers.map((provider, pIndex) => (
                              <TableRow key={pIndex} hover>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar 
                                      sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}
                                    >
                                      {provider.name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={500}>
                                      {provider.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight={600}>
                                    {currency === 'USD' ? '$' : 
                                     currency === 'EUR' ? '€' : 
                                     currency === 'GBP' ? '£' : 
                                     currency === 'INR' ? '₹' : currency}{provider.price}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip 
                                    label={provider.availability}
                                    size="small"
                                    color={provider.availability === 'Available' ? 'success' : 'warning'}
                                    icon={provider.availability === 'Available' ? <CheckCircle /> : <Schedule />}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Button
                                    variant="contained"
                                    size="small"
                                    endIcon={<Launch />}
                                    onClick={() => handleBooking(provider, accommodation)}
                                    sx={{
                                      background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
                                      fontSize: '0.8rem',
                                      '&:hover': {
                                        background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                                      }
                                    }}
                                  >
                                    Book Now
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          💡 <strong>Best Deal:</strong> {accommodation.providers.reduce((best, current) => 
                            current.price < best.price ? current : best
                          ).name} offers the lowest price at {currency === 'USD' ? '$' : 
                           currency === 'EUR' ? '€' : 
                           currency === 'GBP' ? '£' : 
                           currency === 'INR' ? '₹' : currency}{Math.min(...accommodation.providers.map(p => p.price))}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          💰 <strong>Your Commission:</strong> You earn {accommodation.providers.reduce((best, current) => 
                            current.price < best.price ? current : best
                          ).commission}% commission = {currency === 'USD' ? '$' : 
                           currency === 'EUR' ? '€' : 
                           currency === 'GBP' ? '£' : 
                           currency === 'INR' ? '₹' : currency}{((Math.min(...accommodation.providers.map(p => p.price)) * accommodation.providers.reduce((best, current) => 
                            current.price < best.price ? current : best
                          ).commission) / 100).toFixed(0)} when booked through us
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                          🏨 <strong>Why Choose {accommodation.name}?</strong> {accommodation.amenities}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Affiliate Disclosure */}
        <AffiliateDisclosure />

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={onClose}
            sx={{ px: 4, py: 1 }}
          >
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}