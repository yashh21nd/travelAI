import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Stack,
  Button,
  Paper,
  IconButton,
  TextField,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Email,
  Phone,
  LocationOn,
  GitHub,
  LinkedIn,
  Send,
  Support,
  Business,
  Feedback,
  ContactMail,
  Message,
  Person,
  Subject
} from '@mui/icons-material';
import axios from 'axios';

export default function ContactPage() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);

  const contactMethods = [
    {
      icon: <Email />,
      title: "Email Support",
      description: "Get help with your travel planning",
      contact: "travelplanner.ai.service@gmail.com",
      action: "mailto:travelplanner.ai.service@gmail.com",
      color: "#EA4335"
    },
    {
      icon: <Business />,
      title: "Business Inquiries",
      description: "Partnership and collaboration opportunities",
      contact: "yashshinde.dev.work@gmail.com",
      action: "mailto:yashshinde.dev.work@gmail.com",
      color: "#4285F4"
    },
    {
      icon: <Support />,
      title: "Technical Support",
      description: "Issues with bookings or itinerary generation",
      contact: "Available 24/7",
      action: "mailto:travelplanner.ai.service@gmail.com?subject=Technical Support",
      color: "#34A853"
    },
    {
      icon: <Feedback />,
      title: "Feedback & Suggestions",
      description: "Help us improve TravelAI Pro",
      contact: "We value your input",
      action: "mailto:travelplanner.ai.service@gmail.com?subject=Feedback",
      color: "#FBBC05"
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    try {
      const response = await axios.post('/api/contact', formData);
      
      if (response.data.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setError(true);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header Section */}
        <Box textAlign="center" mb={8}>
          <Typography 
            variant="h2" 
            component="h1" 
            fontWeight={700} 
            color="#2E7D32"
            gutterBottom
            sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}
          >
            📞 Get In Touch
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            mb={4}
            sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}
          >
            Have questions about your travel plans? Need technical support? Want to collaborate? 
            We're here to help you every step of your journey.
          </Typography>
        </Box>

        {/* Contact Methods */}
        <Box mb={8}>
          <Typography variant="h3" fontWeight={700} color="#2E7D32" gutterBottom textAlign="center" mb={6}>
            How Can We Help You?
          </Typography>
          
          <Grid container spacing={4}>
            {contactMethods.map((method, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    elevation={2} 
                    sx={{ 
                      height: '100%', 
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-8px)', 
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)' 
                      }
                    }}
                    onClick={() => window.location.href = method.action}
                  >
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Box 
                        sx={{ 
                          display: 'inline-flex',
                          p: 2,
                          borderRadius: '50%',
                          bgcolor: `${method.color}15`,
                          color: method.color,
                          mb: 3
                        }}
                      >
                        {React.cloneElement(method.icon, { fontSize: 'large' })}
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="#2E7D32" gutterBottom>
                        {method.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" mb={2} lineHeight={1.6}>
                        {method.description}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={600} color={method.color}>
                        {method.contact}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Contact Form and Quick Contact */}
        <Grid container spacing={6}>
          {/* Contact Form */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={0} sx={{ bgcolor: '#F8F9FA', p: 6, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <ContactMail sx={{ fontSize: 32, color: '#2E7D32', mr: 2 }} />
              <Typography 
                variant="h4" 
                sx={{
                  fontWeight: 600,
                  color: '#2E7D32',
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontFamily: '"Inter", "Roboto", sans-serif'
                }}
              >
                Send Us a Message
              </Typography>
            </Box>
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                      <Person sx={{ color: '#66BB6A', mb: 0.5 }} />
                      <TextField
                        fullWidth
                        label="Your Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#66BB6A' },
                            '&.Mui-focused fieldset': { borderColor: '#2E7D32' }
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                      <Email sx={{ color: '#66BB6A', mb: 0.5 }} />
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#66BB6A' },
                            '&.Mui-focused fieldset': { borderColor: '#2E7D32' }
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                      <Subject sx={{ color: '#66BB6A', mb: 0.5 }} />
                      <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#66BB6A' },
                            '&.Mui-focused fieldset': { borderColor: '#2E7D32' }
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Message sx={{ color: '#66BB6A', mt: 2 }} />
                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#66BB6A' },
                            '&.Mui-focused fieldset': { borderColor: '#2E7D32' }
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{
                        bgcolor: '#2E7D32',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1rem',
                        fontWeight: 600,
                        fontFamily: '"Inter", "Roboto", sans-serif',
                        '&:hover': { 
                          bgcolor: '#1B5E20', 
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(46, 125, 50, 0.3)'
                        },
                        '&:disabled': {
                          bgcolor: '#A5D6A7'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                      ) : (
                        <Send sx={{ mr: 1 }} />
                      )}
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Quick Contact Info */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={4}>
              {/* Main Contact */}
              <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight={700} color="#2E7D32" gutterBottom>
                    🚀 TravelAI Pro
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ color: '#2E7D32', mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Support Email
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          travelplanner.ai.service@gmail.com
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Support sx={{ color: '#2E7D32', mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Response Time
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          Within 24 Hours
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Developer Contact */}
              <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight={700} color="#2E7D32" gutterBottom>
                    👨‍💻 Developer
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ color: '#2E7D32', mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Yash Shinde
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          yashshinde.dev.work@gmail.com
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" mb={2}>
                      Connect with Developer
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Tooltip title="GitHub Profile" arrow>
                        <IconButton 
                          href="https://github.com/yashh21nd" 
                          target="_blank"
                          sx={{ 
                            bgcolor: '#f0f0f0', 
                            border: '2px solid transparent',
                            '&:hover': { 
                              bgcolor: '#e8f4f8', 
                              transform: 'scale(1.1)',
                              border: '2px solid #333',
                              boxShadow: '0 4px 8px rgba(51,51,51,0.2)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <GitHub sx={{ color: '#333', fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="LinkedIn Profile" arrow>
                        <IconButton 
                          href="https://www.linkedin.com/in/yash-shinde-dev?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BWBEjFChlTY2kYY%2FCRl0Q3A%3D%3D" 
                          target="_blank"
                          sx={{ 
                            bgcolor: '#f0f0f0', 
                            border: '2px solid transparent',
                            '&:hover': { 
                              bgcolor: '#e3f2fd', 
                              transform: 'scale(1.1)',
                              border: '2px solid #0077B5',
                              boxShadow: '0 4px 8px rgba(0,119,181,0.2)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <LinkedIn sx={{ color: '#0077B5', fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Email Developer" arrow>
                        <IconButton 
                          href="mailto:yashshinde.dev.work@gmail.com"
                          sx={{ 
                            bgcolor: '#f0f0f0', 
                            border: '2px solid transparent',
                            '&:hover': { 
                              bgcolor: '#ffebee', 
                              transform: 'scale(1.1)',
                              border: '2px solid #EA4335',
                              boxShadow: '0 4px 8px rgba(234,67,53,0.2)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Email sx={{ color: '#EA4335', fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>

              {/* FAQ Quick Links */}
              <Paper elevation={0} sx={{ bgcolor: '#E8F5E8', p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} color="#2E7D32" gutterBottom>
                  💡 Quick Help
                </Typography>
                <Stack spacing={2}>
                  <Button 
                    variant="text" 
                    sx={{ justifyContent: 'flex-start', color: '#2E7D32' }}
                    href="mailto:travelplanner.ai.service@gmail.com?subject=Booking Issue"
                  >
                    • Accommodation Booking Issues
                  </Button>
                  <Button 
                    variant="text" 
                    sx={{ justifyContent: 'flex-start', color: '#2E7D32' }}
                    href="mailto:travelplanner.ai.service@gmail.com?subject=Itinerary Problem"
                  >
                    • Itinerary Generation Problems
                  </Button>
                  <Button 
                    variant="text" 
                    sx={{ justifyContent: 'flex-start', color: '#2E7D32' }}
                    href="mailto:travelplanner.ai.service@gmail.com?subject=Feature Request"
                  >
                    • Feature Requests
                  </Button>
                  <Button 
                    variant="text" 
                    sx={{ justifyContent: 'flex-start', color: '#2E7D32' }}
                    href="mailto:travelplanner.ai.service@gmail.com?subject=Partnership"
                  >
                    • Business Partnerships
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom CTA */}
        <Box textAlign="center" mt={8}>
          <Paper elevation={0} sx={{ 
            background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
            p: 6, 
            borderRadius: 3 
          }}>
            <Typography variant="h4" fontWeight={700} color="#2E7D32" gutterBottom>
              Ready to Start Your Journey?
            </Typography>
            <Typography variant="h6" color="text.secondary" mb={4}>
              Get personalized travel itineraries with AI technology
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{
                bgcolor: '#2E7D32',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                '&:hover': { bgcolor: '#1B5E20', transform: 'scale(1.05)' },
                transition: 'all 0.2s ease'
              }}
            >
              Plan Your Trip Now
            </Button>
          </Paper>
        </Box>
      </motion.div>
      
      {/* Success/Error Notifications */}
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Thank you for your message! We'll get back to you within 24 hours.
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={error} 
        autoHideDuration={6000} 
        onClose={() => setError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(false)} 
          severity="error" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Sorry, there was an error sending your message. Please try again.
        </Alert>
      </Snackbar>
    </Container>
  );
}