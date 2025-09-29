import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';

export default function AffiliateDisclosure() {
  return (
    <Paper elevation={1} sx={{ p: 3, mt: 3, bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
      <Typography variant="h6" color="primary" gutterBottom>
        💡 Affiliate Partnership Disclosure
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
        <strong>Transparency Notice:</strong> TravelAI Pro participates in affiliate marketing programs 
        with hotel booking platforms including Booking.com, Expedia, Hotels.com, Agoda, and other travel partners. 
        
        <br /><br />
        
        <strong>How it works:</strong> When you book accommodations through our recommendations, 
        we may receive a small commission at no additional cost to you. This helps us maintain 
        and improve our free travel planning service.
        
        <br /><br />
        
        <strong>Our commitment:</strong> We only recommend accommodations and services that meet our 
        quality standards. Our affiliate partnerships do not influence our recommendations - 
        we prioritize your travel experience above all else.
        
        <br /><br />
        
        <strong>Your privacy:</strong> All bookings are processed directly by the respective 
        travel platforms with their standard security and privacy protections.
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="caption" color="text.disabled">
        Last updated: September 29, 2025 • In compliance with FTC guidelines and GDPR regulations
      </Typography>
    </Paper>
  );
}