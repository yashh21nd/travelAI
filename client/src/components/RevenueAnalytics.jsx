import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent,
  LinearProgress, Chip, Avatar, Divider, Alert
} from '@mui/material';
import {
  TrendingUp, AccountBalance, Timeline, 
  Hotel, Flight, LocalActivity, CreditCard
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function RevenueAnalytics({ isVisible = false }) {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    totalBookings: 0,
    avgBookingValue: 0,
    topPerformer: null,
    projections: {}
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible) {
      fetchAnalytics();
    }
  }, [isVisible]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with real endpoint
      setTimeout(() => {
        setAnalytics({
          totalRevenue: 12543.50,
          monthlyRevenue: 3240.75,
          conversionRate: 8.7,
          totalBookings: 143,
          avgBookingValue: 387.20,
          topPerformer: 'booking.com',
          projections: {
            nextMonth: 4850.00,
            nextYear: 58200.00
          },
          breakdown: [
            { platform: 'booking.com', revenue: 1847.32, bookings: 52, commission: 35.0 },
            { platform: 'expedia.com', revenue: 892.15, bookings: 28, commission: 6.0 },
            { platform: 'agoda.com', revenue: 501.28, bookings: 19, commission: 4.5 }
          ]
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper elevation={3} sx={{ p: 3, mt: 3, borderRadius: 3, bgcolor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TrendingUp sx={{ color: '#4CAF50', fontSize: 28, mr: 1 }} />
          <Typography variant="h5" fontWeight={700} color="#2E7D32">
            Affiliate Revenue Analytics
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ mb: 3 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Loading revenue data...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={1} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <AccountBalance sx={{ fontSize: 32, color: '#4CAF50', mb: 1 }} />
                    <Typography variant="h4" fontWeight={700} color="#2E7D32">
                      ${analytics.monthlyRevenue.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Month
                    </Typography>
                    <Chip 
                      label="+23.5%" 
                      size="small" 
                      color="success" 
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={1} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Hotel sx={{ fontSize: 32, color: '#FF9800', mb: 1 }} />
                    <Typography variant="h4" fontWeight={700} color="#F57C00">
                      {analytics.totalBookings}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Bookings
                    </Typography>
                    <Chip 
                      label={`${analytics.conversionRate}% conversion`} 
                      size="small" 
                      color="warning" 
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={1} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <CreditCard sx={{ fontSize: 32, color: '#2196F3', mb: 1 }} />
                    <Typography variant="h4" fontWeight={700} color="#1976D2">
                      ${analytics.avgBookingValue.toFixed(0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg. Booking Value
                    </Typography>
                    <Chip 
                      label="Above industry avg" 
                      size="small" 
                      color="info" 
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={1} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Timeline sx={{ fontSize: 32, color: '#9C27B0', mb: 1 }} />
                    <Typography variant="h4" fontWeight={700} color="#7B1FA2">
                      ${analytics.projections.nextYear.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Annual Projection
                    </Typography>
                    <Chip 
                      label="Conservative estimate" 
                      size="small" 
                      color="secondary" 
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Platform Breakdown */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                💰 Revenue by Platform (This Month)
              </Typography>
              
              {analytics.breakdown?.map((platform, index) => (
                <Box key={platform.platform} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                        {platform.platform.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {platform.platform}
                      </Typography>
                      <Chip 
                        label={`${platform.commission}% commission`}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      ${platform.revenue.toFixed(2)}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(platform.revenue / analytics.monthlyRevenue) * 100}
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      bgcolor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: index === 0 ? '#4CAF50' : index === 1 ? '#FF9800' : '#2196F3'
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {platform.bookings} bookings • {((platform.revenue / analytics.monthlyRevenue) * 100).toFixed(1)}% of total
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Growth Tips */}
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={500} gutterBottom>
                💡 Revenue Optimization Tips:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Your booking.com performance is excellent - consider negotiating higher commission rates
                • Average booking value is above industry standard - focus on premium destinations
                • {analytics.conversionRate}% conversion rate suggests strong user trust - scale marketing efforts
                • Consider adding flight and activity affiliate programs for additional revenue streams
              </Typography>
            </Alert>

            {/* Projections */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={500} color="#2E7D32" gutterBottom>
                📊 Revenue Projections (Based on Current Growth):
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Next Month: <strong>${analytics.projections.nextMonth.toLocaleString()}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Next Year: <strong>${analytics.projections.nextYear.toLocaleString()}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </Paper>
    </motion.div>
  );
}