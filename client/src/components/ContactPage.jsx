import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  TextField,
  Button,
  Stack,
  Divider,
  Chip
} from '@mui/material';
import {
  Email,
  Business,
  Support,
  TravelExplore,
  CheckCircle,
  Code,
  CloudQueue,
  Analytics
} from '@mui/icons-material';
import { brandColors } from '../theme';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'

  // Email validation helper
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    // Clear submit status when user makes changes
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting.');
      setSubmitStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    // Show loading toast
    const loadingToast = toast.loading('Sending your message...');
    
    try {
      // Use your backend API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          inquiryType: formData.inquiryType
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Success
        toast.dismiss(loadingToast);
        toast.success('✅ Message sent successfully! We\'ll get back to you within 24 hours.', {
          duration: 8000,
          icon: '🚀',
        });
        setSubmitStatus('success');
        
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
            inquiryType: 'general'
          });
          setSubmitStatus(null);
        }, 2000);
        
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
      
    } catch (error) {
      console.error('Contact form error:', error);
      toast.dismiss(loadingToast);
      
      // Fallback to mailto if backend fails
      const emailSubject = encodeURIComponent(`TravelAI Pro Contact: ${formData.subject}`);
      const inquiryTypeLabel = inquiryTypes.find(type => type.value === formData.inquiryType)?.label || formData.inquiryType;
      const emailBody = encodeURIComponent(
        `Contact from: ${formData.name} (${formData.email})\n\n` +
        `Inquiry Type: ${inquiryTypeLabel}\n` +
        `Subject: ${formData.subject}\n\n` +
        `Message:\n${formData.message}\n\n` +
        `Submitted: ${new Date().toLocaleString()}\n` +
        `Website: ${window.location.origin}`
      );
      
      const mailtoLink = `mailto:travelplanner.ai.service@gmail.com?subject=${emailSubject}&body=${emailBody}`;
      window.open(mailtoLink, '_blank');
      
      toast.error('Unable to send via server. Opening email client as backup.', {
        duration: 8000,
        icon: '📧',
      });
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Email,
      title: 'General Support',
      primary: 'travelplanner.ai.service@gmail.com',
      secondary: 'All travel planning and support queries',
      color: brandColors.primary.main
    },
    {
      icon: Code,
      title: 'Developer Contact',
      primary: 'yashshinde.dev.work@gmail.com',
      secondary: 'Technical inquiries and development',
      color: brandColors.secondary.main
    },
    {
      icon: Business,
      title: 'Business Partnerships',
      primary: 'travelplanner.ai.service@gmail.com',
      secondary: 'Affiliate and API partnerships',
      color: brandColors.accent.gold
    },
    {
      icon: TravelExplore,
      title: 'Platform Features',
      primary: 'Login-Free Service',
      secondary: 'Privacy-focused AI travel planning',
      color: brandColors.accent.teal
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'partnership', label: 'Partnership/Affiliate' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'business', label: 'Business Development' }
  ];

  const platformFeatures = [
    'No Login Required',
    'Privacy-First Design',
    'AI-Powered Recommendations', 
    'Real-time Booking Integration',
    'Global Coverage'
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
        <Box textAlign="center" mb={8}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              mb: 2,
              background: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Contact TravelAI Pro
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Professional AI travel planning platform - no login required
          </Typography>
          
          {/* Platform Features */}
          <Stack direction="row" flexWrap="wrap" spacing={1} justifyContent="center">
            {platformFeatures.map((feature) => (
              <Chip
                key={feature}
                icon={<CheckCircle />}
                label={feature}
                size="small"
                sx={{
                  backgroundColor: brandColors.accent?.green || '#4CAF50',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '& .MuiChip-icon': { 
                    color: 'white',
                    filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))'
                  },
                  '& .MuiChip-label': {
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    fontWeight: 600
                  }
                }}
              />
            ))}
          </Stack>
        </Box>

        <Grid container spacing={6}>
          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Card 
              sx={{ 
                p: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                borderRadius: 3,
                border: `1px solid ${brandColors.neutral[200]}`
              }}
            >
              <Typography variant="h4" fontWeight={600} mb={4} color="primary">
                Send Us a Message
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Inquiry Type"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      SelectProps={{ native: true }}
                      variant="outlined"
                    >
                      {inquiryTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      multiline
                      rows={6}
                      variant="outlined"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        background: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.secondary.main} 100%)`,
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 8px 25px rgba(25, 118, 210, 0.25)'
                        }
                      }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Card>

            {/* Partnership Information */}
            <Card 
              sx={{ 
                mt: 4, 
                p: 4, 
                border: `2px solid ${brandColors.accent.gold}`,
                borderRadius: 3,
                background: `linear-gradient(135deg, rgba(255, 179, 0, 0.02) 0%, rgba(255, 179, 0, 0.05) 100%)`
              }}
            >
              <Typography variant="h5" fontWeight={600} mb={3} color={brandColors.accent.gold}>
                Partnership & Affiliate Opportunities
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                TravelAI Pro partners with leading travel companies and booking platforms. 
                We offer professional affiliate programs with transparent reporting and 
                competitive commission rates.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={600} mb={1}>
                    Current Partners:
                  </Typography>
                  <Stack spacing={0.5}>
                    {['Booking.com', 'Expedia Group', 'Hotels.com', 'Agoda', 'GoIbibo', 'MakeMyTrip'].map((partner) => (
                      <Typography key={partner} variant="body2" color="text.secondary">
                        • {partner}
                      </Typography>
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={600} mb={1}>
                    Partnership Benefits:
                  </Typography>
                  <Stack spacing={0.5}>
                    {['Professional API integration', 'Real-time booking system', 'Transparent reporting', 'Global reach'].map((benefit) => (
                      <Typography key={benefit} variant="body2" color="text.secondary">
                        • {benefit}
                      </Typography>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Contact Information Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={4}>
              {/* Contact Methods */}
              {contactMethods.map((method) => (
                <Card 
                  key={method.title} 
                  sx={{ 
                    p: 3,
                    borderRadius: 3,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                    border: `1px solid ${brandColors.neutral[200]}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box
                      sx={{
                        backgroundColor: method.color,
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <method.icon sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {method.title}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body1" 
                    fontWeight={600} 
                    mb={1} 
                    sx={{
                      color: 'text.primary',
                      textShadow: 'none',
                      cursor: method.primary.includes('@') ? 'pointer' : 'default',
                      '&:hover': method.primary.includes('@') ? {
                        color: 'primary.main',
                        textDecoration: 'underline'
                      } : {}
                    }}
                    onClick={() => {
                      if (method.primary.includes('@')) {
                        window.location.href = `mailto:${method.primary}`;
                      }
                    }}
                  >
                    {method.primary}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: 'text.primary',
                    opacity: 0.8,
                    fontWeight: 500,
                    fontSize: '0.9rem'
                  }}>
                    {method.secondary}
                  </Typography>
                </Card>
              ))}

              {/* Platform Stats */}
              <Card
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.primary.dark || '#1565C0'} 50%, ${brandColors.secondary.main} 100%)`,
                  color: 'white',
                  boxShadow: '0 12px 40px rgba(25, 118, 210, 0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Typography variant="h6" fontWeight={600} mb={3} sx={{ 
                  textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                  color: 'white'
                }}>
                  Platform Statistics
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h3" fontWeight={700} sx={{ 
                      textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                      color: 'white',
                      fontSize: '3rem'
                    }}>
                      50K+
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      opacity: 1,
                      color: 'rgba(255,255,255,0.95)',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                      fontWeight: 500
                    }}>
                      Active Users
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h3" fontWeight={700} sx={{ 
                      textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                      color: 'white',
                      fontSize: '3rem'
                    }}>
                      195+
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      opacity: 1,
                      color: 'rgba(255,255,255,0.95)',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                      fontWeight: 500
                    }}>
                      Countries Covered
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h3" fontWeight={700} sx={{ 
                      textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                      color: 'white',
                      fontSize: '3rem'
                    }}>
                      0
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      opacity: 1,
                      color: 'rgba(255,255,255,0.95)',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                      fontWeight: 500
                    }}>
                      Data Storage (Privacy First)
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ContactPage;