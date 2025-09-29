import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, Alert, Stepper, Step, StepLabel,
  StepContent, Card, CardContent, List, ListItem, ListItemIcon,
  ListItemText, Divider, Chip, Grid, Link
} from '@mui/material';
import {
  CheckCircle, Schedule, Warning, Launch, Business,
  MonetizationOn, Analytics, Settings, School
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import RevenueAnalytics from './RevenueAnalytics';

export default function AffiliateDashboard() {
  const [activeStep, setActiveStep] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Affiliate program status tracking
  const affiliatePrograms = [
    {
      name: 'Booking.com Partner Hub',
      status: 'pending', // 'approved', 'pending', 'rejected', 'not_applied'
      commission: '25-40%',
      priority: 'High',
      url: 'https://partner.booking.com/',
      description: 'World\'s largest accommodation platform',
      estimatedRevenue: '$2000-8000/month',
      requirements: ['Active website', 'Quality traffic', 'Business registration (optional)']
    },
    {
      name: 'Expedia TAAP',
      status: 'not_applied',
      commission: '4-7%',
      priority: 'High', 
      url: 'https://www.expedia.com/affiliates',
      description: 'Comprehensive travel booking platform',
      estimatedRevenue: '$800-3000/month',
      requirements: ['Website with travel content', 'Business details', 'Active traffic']
    },
    {
      name: 'Agoda Partner Program',
      status: 'not_applied',
      commission: '2-7%',
      priority: 'Medium',
      url: 'https://www.agoda.com/partners',
      description: 'Leading Asia-Pacific specialist',
      estimatedRevenue: '$500-2000/month',
      requirements: ['Focus on Asian destinations', 'Minimum traffic requirements']
    },
    {
      name: 'Hotels.com Affiliate',
      status: 'not_applied',
      commission: '4-6%',
      priority: 'Medium',
      url: 'https://www.cj.com/',
      description: 'Via Commission Junction network',
      estimatedRevenue: '$400-1500/month',
      requirements: ['CJ Affiliate account', 'Website approval', 'Terms compliance']
    },
    {
      name: 'GoIbibo Partner Program',
      status: 'not_applied',
      commission: '2-5%',
      priority: 'High',
      url: 'https://partners.goibibo.com/',
      description: 'Leading Indian travel platform',
      estimatedRevenue: '$500-2000/month',
      requirements: ['Indian destination focus', 'Local market knowledge', 'Minimum traffic']
    },
    {
      name: 'MakeMyTrip Partners',
      status: 'not_applied',
      commission: '2-4%',
      priority: 'High',
      url: 'https://partners.makemytrip.com/',
      description: 'India\'s largest online travel company',
      estimatedRevenue: '$800-3000/month',
      requirements: ['Business KYC', 'Indian destination content', 'Quality traffic']
    }
  ];

  const setupSteps = [
    {
      label: 'Business Setup',
      description: 'Prepare your business information and documentation',
      tasks: [
        'Register business email (looks more professional)',
        'Create Terms of Service page',
        'Add Privacy Policy to your website', 
        'Set up Google Analytics for traffic tracking',
        'Prepare business registration (if available)'
      ]
    },
    {
      label: 'Apply to Affiliate Programs',
      description: 'Submit applications to major booking platforms',
      tasks: [
        'Apply to Booking.com Partner Hub (highest priority)',
        'Submit Expedia TAAP application',
        'Register for Agoda Partner Program',
        'Apply to Hotels.com via Commission Junction'
      ]
    },
    {
      label: 'Integration & Testing',
      description: 'Update your code with real affiliate IDs',
      tasks: [
        'Replace demo affiliate IDs with real ones',
        'Test all booking links and redirects',
        'Implement conversion tracking pixels',
        'Set up revenue analytics dashboard'
      ]
    },
    {
      label: 'Optimization & Scaling',
      description: 'Optimize for higher conversions and revenue',
      tasks: [
        'A/B test booking button placement',
        'Add social proof and urgency indicators',
        'Implement email follow-up sequences',
        'Monitor and optimize conversion rates'
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'pending': return <Schedule />;
      case 'rejected': return <Warning />;
      default: return <Business />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h4" fontWeight={700} color="#2E7D32" gutterBottom>
          💰 Affiliate Revenue Dashboard
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
          Your travel planner is already technically ready for affiliate marketing! This dashboard will help you 
          activate real affiliate partnerships and start earning commissions from accommodation bookings.
        </Typography>

        {/* Quick Stats Alert */}
        <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={500}>
            🎯 <strong>Revenue Potential:</strong> Based on your current setup, you could realistically earn 
            <strong> $18,000-$360,000+ annually</strong> from accommodation bookings alone. 
            Your technical infrastructure is 80% complete!
          </Typography>
        </Alert>

        {/* Action Buttons */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Analytics />}
            onClick={() => setShowAnalytics(!showAnalytics)}
            sx={{
              bgcolor: '#4CAF50',
              '&:hover': { bgcolor: '#45A049' }
            }}
          >
            {showAnalytics ? 'Hide' : 'Show'} Revenue Analytics
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<School />}
            href="https://partner.booking.com/"
            target="_blank"
            sx={{ borderColor: '#4CAF50', color: '#4CAF50' }}
          >
            Apply to Booking.com
          </Button>

          <Button
            variant="outlined"
            startIcon={<Settings />}
            sx={{ borderColor: '#4CAF50', color: '#4CAF50' }}
          >
            Configure Settings
          </Button>
        </Box>

        {/* Revenue Analytics */}
        <RevenueAnalytics isVisible={showAnalytics} />

        <Grid container spacing={4}>
          {/* Setup Progress */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                📋 Setup Progress
              </Typography>
              
              <Stepper activeStep={activeStep} orientation="vertical">
                {setupSteps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      onClick={() => setActiveStep(index)}
                      sx={{ cursor: 'pointer' }}
                    >
                      {step.label}
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {step.description}
                      </Typography>
                      
                      <List dense>
                        {step.tasks.map((task, taskIndex) => (
                          <ListItem key={taskIndex} sx={{ pl: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircle sx={{ fontSize: 16, color: '#4CAF50' }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={task}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>

                      <Box sx={{ mb: 1, mt: 2 }}>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(activeStep + 1)}
                          disabled={activeStep === setupSteps.length - 1}
                          sx={{ 
                            mr: 1,
                            bgcolor: '#4CAF50',
                            '&:hover': { bgcolor: '#45A049' }
                          }}
                        >
                          {activeStep === setupSteps.length - 1 ? 'Completed' : 'Next Step'}
                        </Button>
                        
                        <Button
                          onClick={() => setActiveStep(activeStep - 1)}
                          disabled={activeStep === 0}
                        >
                          Back
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          </Grid>

          {/* Affiliate Programs Status */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                🤝 Affiliate Programs Status
              </Typography>
              
              {affiliatePrograms.map((program, index) => (
                <Card key={program.name} elevation={1} sx={{ mb: 2, borderRadius: 2 }}>
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {program.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          {program.description}
                        </Typography>
                      </Box>
                      <Chip
                        icon={getStatusIcon(program.status)}
                        label={program.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(program.status)}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip label={`${program.commission} commission`} size="small" variant="outlined" />
                      <Chip label={program.priority} size="small" color={program.priority === 'High' ? 'error' : 'default'} />
                      <Chip label={program.estimatedRevenue} size="small" color="success" variant="outlined" />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Requirements: {program.requirements.join(', ')}
                      </Typography>
                      
                      {program.status === 'not_applied' && (
                        <Button
                          size="small"
                          variant="outlined"
                          endIcon={<Launch />}
                          href={program.url}
                          target="_blank"
                          sx={{ ml: 1 }}
                        >
                          Apply
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Reference */}
        <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 3, bgcolor: '#f8f9fa' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📚 Quick Reference
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight={600} color="#2E7D32" gutterBottom>
                Application Tips
              </Typography>
              <List dense>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemText 
                    primary="Use business email address"
                    secondary="Looks more professional than personal email"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemText 
                    primary="Highlight AI/tech differentiation"
                    secondary="Mention personalized AI recommendations"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemText 
                    primary="Be honest about traffic volume"
                    secondary="Start with realistic expectations"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight={600} color="#2E7D32" gutterBottom>
                Legal Requirements
              </Typography>
              <List dense>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemText 
                    primary="FTC Disclosure"
                    secondary="Already implemented in your app"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemText 
                    primary="Privacy Policy"
                    secondary="Must mention affiliate tracking"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemText 
                    primary="Terms of Service"
                    secondary="Include affiliate relationship terms"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight={600} color="#2E7D32" gutterBottom>
                Revenue Optimization
              </Typography>
              <List dense>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemText 
                    primary="Focus on booking.com first"
                    secondary="Highest commission rates (25-40%)"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemText 
                    primary="Track conversion rates"
                    secondary="Optimize based on performance data"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemText 
                    primary="Add social proof"
                    secondary="'2,847 travelers booked this month'"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </motion.div>
  );
}