import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  Stack
} from '@mui/material';
import { brandColors } from '../theme';

const PrivacyPolicyPage = () => {
  const lastUpdated = 'September 29, 2025';

  const sections = [
    {
      title: '1. No-Login Policy & Data Minimization',
      content: [
        'TravelAI Pro operates completely without user accounts, registrations, or login requirements',
        'We do not store personal information like names, emails, or phone numbers',
        'No user profiles, passwords, or persistent data storage',
        'Travel searches and results are processed in real-time without data retention',
        'Maximum privacy through minimal data collection'
      ]
    },
    {
      title: '2. Information We Process (Temporarily)',
      content: [
        'Travel Search Queries: Destination, dates, budget preferences (not stored)',
        'Technical Information: IP address, browser type for service delivery only',
        'Session Data: Temporary cookies for website functionality (cleared after session)',
        'No payment information: All bookings processed directly by partner platforms'
      ]
    },
    {
      title: '3. How We Use Information',
      content: [
        'Provide real-time AI-powered travel recommendations',
        'Connect users with booking partner platforms',
        'Improve AI algorithms through anonymous usage patterns',
        'Ensure website security and prevent abuse',
        'No marketing emails, newsletters, or promotional communications'
      ]
    },
    {
      title: '4. Information Sharing & Third Parties',
      content: [
        'Booking Partners: Redirect to partner platforms (Booking.com, Expedia, etc.)',
        'No personal data shared - users book directly with partners',
        'Analytics: Anonymous usage data only (Google Analytics with IP anonymization)',
        'We NEVER sell, rent, or share personal information',
        'No data brokers or marketing companies'
      ]
    },
    {
      title: '5. Data Security & Retention',
      content: [
        'SSL encryption for all website communications',
        'No long-term data storage or user databases',
        'Session data cleared automatically after use',
        'Regular security audits and updates',
        'Minimal attack surface due to no-login architecture'
      ]
    },
    {
      title: '6. Terms of Service',
      content: [
        'Free to use AI-powered travel planning platform',
        'No registration or account creation required',
        'Service provided "as is" with continuous improvements',
        'Users responsible for verifying travel information',
        'Affiliate partnerships disclosed transparently'
      ]
    },
    {
      title: '7. Booking & Partner Terms',
      content: [
        'All bookings subject to partner platform terms and conditions',
        'Prices and availability confirmed by booking partners',
        'TravelAI Pro facilitates connections but does not process payments',
        'Cancellation and refund policies governed by booking partners',
        'We earn commissions from successful bookings at no extra cost to users'
      ]
    },
    {
      title: '8. Intellectual Property & Usage Rights',
      content: [
        'TravelAI Pro platform and AI algorithms protected by copyright',
        'Users may use the service for personal travel planning only',
        'No commercial use or data scraping permitted',
        'AI-generated itineraries provided for personal use',
        'Respect third-party content and booking partner terms'
      ]
    },
    {
      title: '9. Disclaimers & Limitations',
      content: [
        'Travel recommendations provided for informational purposes',
        'Users responsible for verifying visa, health, and travel requirements',
        'No guarantees on availability, pricing, or booking success',
        'AI recommendations based on available data and may vary',
        'Not liable for booking partner issues or travel disruptions'
      ]
    },
    {
      title: '10. International Usage & Compliance',
      content: [
        'Service available globally with local booking partner integration',
        'GDPR compliant with minimal data collection approach',
        'CCPA compliant with transparent data practices',
        'Local regulations respected in all operational regions',
        'Data processing primarily in user\'s browser (client-side)'
      ]
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#FAFAFA',
      backgroundImage: 'url(/background.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(250, 250, 250, 0.8)',
        zIndex: 1
      }
    }}>
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              mb: 2,
              color: brandColors.primary.main
            }}
          >
            Privacy Policy & Terms of Service
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Your privacy and our service terms - transparent, secure, and login-free
          </Typography>
          <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="body2">
              <strong>Last Updated:</strong> {lastUpdated} | 
              <strong>Effective Date:</strong> {lastUpdated}
            </Typography>
          </Alert>
        </Box>

        {/* Introduction */}
        <Card sx={{ mb: 6, p: 4 }}>
          <Typography variant="h5" fontWeight={600} mb={3} color="primary">
            Our Commitment to Privacy & Service
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 3 }}>
            TravelAI Pro is committed to protecting your privacy while providing exceptional travel planning services. 
            This document combines our Privacy Policy and Terms of Service to explain how we operate our 
            <strong>login-free platform</strong> and the terms governing our AI-powered travel planning services.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            By using TravelAI Pro, you agree to these terms. We operate without user accounts or login requirements, 
            ensuring maximum privacy and ease of use. We comply with GDPR, CCPA, and other applicable regulations.
          </Typography>
        </Card>

        {/* Policy Sections */}
        <Stack spacing={4}>
          {sections.map((section, index) => (
            <Card key={index} sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight={600} mb={3} color="primary">
                {section.title}
              </Typography>
              <List>
                {section.content.map((item, itemIndex) => (
                  <ListItem key={itemIndex} sx={{ pl: 0 }}>
                    <ListItemText
                      primary={item}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: 'text.secondary',
                          lineHeight: 1.6
                        }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Card>
          ))}
        </Stack>

        {/* Contact Information */}
        <Card sx={{ 
          mt: 6, 
          p: 4, 
          background: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.primary.dark} 100%)`,
          color: 'white',
          boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)'
        }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Contact Us About Privacy
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 3, color: 'rgba(255, 255, 255, 0.95)' }}>
            If you have any questions about this Privacy Policy or our service terms, please contact us:
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
              <strong>General Support:</strong>{' '}
              <Typography 
                component="span" 
                sx={{ 
                  color: 'white', 
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': { 
                    color: 'rgba(255,255,255,0.8)'
                  }
                }}
                onClick={() => window.location.href = 'mailto:travelplanner.ai.service@gmail.com'}
              >
                travelplanner.ai.service@gmail.com
              </Typography>
            </Typography>
            <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
              <strong>Developer Contact:</strong>{' '}
              <Typography 
                component="span" 
                sx={{ 
                  color: 'white', 
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': { 
                    color: 'rgba(255,255,255,0.8)'
                  }
                }}
                onClick={() => window.location.href = 'mailto:yashshinde.dev.work@gmail.com'}
              >
                yashshinde.dev.work@gmail.com
              </Typography>
            </Typography>
            <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
              <strong>Privacy Questions:</strong>{' '}
              <Typography 
                component="span" 
                sx={{ 
                  color: 'white', 
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': { 
                    color: 'rgba(255,255,255,0.8)'
                  }
                }}
                onClick={() => window.location.href = 'mailto:travelplanner.ai.service@gmail.com'}
              >
                travelplanner.ai.service@gmail.com
              </Typography>
            </Typography>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

export default PrivacyPolicyPage;