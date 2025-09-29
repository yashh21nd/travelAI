import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
  Stack,
  Chip
} from '@mui/material';
import {
  Email,
  Security,
  Verified,
  TravelExplore
} from '@mui/icons-material';
import { brandColors } from '../theme';
import { Logo } from './ProfessionalHeader';

// Professional Footer Component
const ProfessionalFooter = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const footerSections = {
    company: {
      title: 'Company',
      links: [
        { label: 'About Us', href: 'about' },
        { label: 'Our Story', href: 'about' },
        { label: 'Careers', href: 'contact' },
        { label: 'Press', href: 'contact' },
        { label: 'Blog', href: 'contact' }
      ]
    },
    services: {
      title: 'Services',
      links: [
        { label: 'AI Trip Planning', href: 'home' },
        { label: 'Hotel Booking', href: 'home' },
        { label: 'Flight Search', href: 'home' },
        { label: 'Local Experiences', href: 'home' },
        { label: 'Travel Insurance', href: 'contact' }
      ]
    },
    destinations: {
      title: 'Popular Destinations',
      links: [
        { label: 'India Tours', href: 'home' },
        { label: 'Europe Packages', href: 'home' },
        { label: 'Asia Adventures', href: 'home' },
        { label: 'USA Travel', href: 'home' },
        { label: 'All Destinations', href: 'home' }
      ]
    },
    support: {
      title: 'Support',
      links: [
        { label: 'Help Center', href: 'contact' },
        { label: 'Contact Us', href: 'contact' },
        { label: 'Live Chat', href: 'contact' },
        { label: 'Travel Guides', href: 'home' },
        { label: 'FAQ', href: 'contact' }
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy & Terms', href: 'privacy' },
        { label: 'Cookie Policy', href: 'privacy' },
        { label: 'Refund Policy', href: 'privacy' },
        { label: 'Affiliate Disclosure', href: 'privacy' }
      ]
    }
  };

  const trustBadges = [
    { label: 'SSL Secured', icon: Security },
    { label: 'Verified Business', icon: Verified },
    { label: 'GDPR Compliant', icon: Security }
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: brandColors.neutral[900],
        color: 'white',
        py: 6,
        mt: 8
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Grid container spacing={4}>
          {/* Company Information */}
          <Grid item xs={12} md={4}>
            <Box mb={3}>
              <Logo size="medium" />
            </Box>
            
            <Typography variant="body2" sx={{ mb: 3, color: brandColors.neutral[400], lineHeight: 1.6 }}>
              Professional AI-powered travel planning platform trusted by thousands of travelers worldwide. 
              Create personalized itineraries with intelligent recommendations and seamless booking integration.
            </Typography>

            {/* Contact Information */}
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Box 
                component="button"
                onClick={() => window.location.href = 'mailto:travelplanner.ai.service@gmail.com'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: brandColors.neutral[400],
                  transition: 'color 0.2s ease',
                  p: 0,
                  '&:hover': {
                    color: brandColors.primary.light
                  }
                }}
              >
                <Email sx={{ fontSize: 16, color: brandColors.neutral[500] }} />
                <Typography variant="body2">
                  Support
                </Typography>
              </Box>
            </Stack>

            {/* Platform Info */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                TravelAI Pro
              </Typography>
              <Typography variant="body2" sx={{ color: brandColors.neutral[500] }}>
                Privacy-first AI travel planning platform with no login requirements.
              </Typography>
            </Box>
          </Grid>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <Grid item xs={6} sm={4} md={key === 'company' ? 2 : 1.6} key={key}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  fontSize: '1rem', 
                  fontWeight: 600,
                  color: 'white'
                }}
              >
                {section.title}
              </Typography>
              <Stack spacing={1.5}>
                {section.links.map((link) => (
                  <Box
                    key={link.label}
                    component="button"
                    onClick={() => onNavigate && onNavigate(link.href)}
                    sx={{
                      background: 'none',
                      border: 'none',
                      color: brandColors.neutral[400],
                      fontSize: '0.875rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease',
                      p: 0,
                      '&:hover': {
                        color: brandColors.primary.light,
                        paddingLeft: '4px'
                      }
                    }}
                  >
                    {link.label}
                  </Box>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4, borderColor: brandColors.neutral[700] }} />

        {/* Bottom Footer */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          gap={2}
        >
          {/* Copyright */}
          <Box>
            <Typography variant="body2" color={brandColors.neutral[500]} sx={{ mb: 1 }}>
              © {currentYear} TravelAI Pro. All rights reserved.
            </Typography>
            <Typography variant="body2" color={brandColors.neutral[600]} sx={{ fontSize: '0.75rem' }}>
              Professional travel planning platform with affiliate partnerships
            </Typography>
          </Box>

          {/* Trust Badges */}
          <Box display="flex" flexWrap="wrap" gap={1}>
            {trustBadges.map((badge) => (
              <Chip
                key={badge.label}
                icon={<badge.icon sx={{ fontSize: 16 }} />}
                label={badge.label}
                size="small"
                sx={{
                  backgroundColor: brandColors.neutral[800],
                  color: brandColors.neutral[300],
                  border: `1px solid ${brandColors.neutral[700]}`,
                  '& .MuiChip-icon': {
                    color: brandColors.accent.green
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Partnership Disclosure */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: brandColors.neutral[800],
            borderRadius: 2,
            border: `1px solid ${brandColors.neutral[700]}`
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: '0.75rem',
              color: brandColors.neutral[400],
              textAlign: 'center',
              lineHeight: 1.5
            }}
          >
            <strong>Affiliate Disclosure:</strong> TravelAI Pro is a professional travel planning platform that earns 
            commissions from qualified bookings through our trusted hotel and travel partners including Booking.com, 
            Expedia, Hotels.com, Agoda, GoIbibo, and MakeMyTrip. These partnerships help us provide free AI-powered 
            travel planning services to our users. Our recommendations are always unbiased and based on user preferences.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ProfessionalFooter;