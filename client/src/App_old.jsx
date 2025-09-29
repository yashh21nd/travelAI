import React from 'react';
import { 
  CssBaseline, 
  ThemeProvider,
  Container, 
  Typography, 
  Box,
  Toolbar
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import theme from './theme';
import ProfessionalHeader from './components/ProfessionalHeader';
import ProfessionalFooter from './components/ProfessionalFooter';
import TravelForm from './components/TravelForm';
import ItineraryResult from './components/ItineraryResult';
import AboutUsPage from './components/AboutUsPage';
import ContactPage from './components/ContactPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import DeveloperPage from './components/DeveloperPage';

export default function App() {
  const [result, setResult] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState('home'); // home, about, contact, privacy, terms, developer

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setResult(null); // Reset result when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'about':
        return <AboutUsPage />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsOfServicePage />;
      case 'developer':
        return <DeveloperPage />;
      case 'home':
      default:
        return (
          <>
            {/* Professional Hero Section */}
            <Box sx={{ 
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
              py: 8,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23E3F2FD" fill-opacity="0.1"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.3
              }
            }}>
              <Container maxWidth="md">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 3,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      background: 'linear-gradient(135deg, #1976D2 0%, #FF6B35 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      position: 'relative'
                    }}
                  >
                    Professional AI Travel Planning
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'text.secondary',
                      maxWidth: 700, 
                      mx: 'auto',
                      mb: 4,
                      fontWeight: 400,
                      fontSize: { xs: '1.1rem', md: '1.25rem' },
                      lineHeight: 1.6,
                      position: 'relative'
                    }}
                  >
                    Enterprise-grade AI technology creates personalized travel itineraries with 
                    professional booking integration, detailed budgets, and expert local recommendations. 
                    Trusted by 50,000+ travelers worldwide.
                  </Typography>

                  {/* Trust Indicators */}
                  <Box 
                    display="flex" 
                    justifyContent="center" 
                    flexWrap="wrap" 
                    gap={2} 
                    sx={{ mb: 4, position: 'relative' }}
                  >
                    {['50K+ Users', 'GDPR Compliant', 'SSL Secured', '7 Partner Platforms'].map((badge) => (
                      <Box
                        key={badge}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          border: '1px solid rgba(25, 118, 210, 0.2)',
                          backdropFilter: 'blur(10px)',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'text.secondary'
                        }}
                      >
                        {badge}
                      </Box>
                    ))}
                  </Box>
                </motion.div>
              </Container>
            </Box>

            {/* Main Travel Planning Interface */}
            <Container maxWidth="lg" sx={{ py: 6 }}>
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ItineraryResult result={result} onReset={() => setResult(null)} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <TravelForm onResult={setResult} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Container>
          </>
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Professional Header */}
        <ProfessionalHeader />
        <Toolbar /> {/* Spacer for fixed header */}
        
        {/* Main Content */}
        <Box sx={{ flexGrow: 1 }}>
          {renderCurrentPage()}
        </Box>
        
        {/* Professional Footer */}
        <ProfessionalFooter />
      </Box>
    </ThemeProvider>
  );
}
              <AnimatePresence mode="wait">
                {!result ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.6 }}
                  >
                    <TravelForm onResult={setResult} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.6 }}
                  >
                    <ItineraryResult result={result} onBack={() => setResult(null)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Container>
          </>
        );
    }
  };

  return (
    <>
      <CssBaseline />
      
      {/* Modern Enhanced Navbar */}
      <AppBar position="static" elevation={0} sx={{ 
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <Toolbar sx={{ 
          justifyContent: 'space-between',
          py: 1,
          px: { xs: 2, md: 4 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <TravelExplore sx={{ 
                fontSize: 36, 
                color: '#FFD700',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }} />
            </motion.div>
            <Typography 
              variant="h5" 
              sx={{ 
                fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: 800, 
                background: 'linear-gradient(45deg, #FFD700, #FFA726)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                cursor: 'pointer',
                letterSpacing: '0.5px',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'scale(1.05)',
                  transition: 'all 0.3s ease'
                }
              }}
              onClick={() => handleNavigation('home')}
            >
              TravelAI Pro
            </Typography>
          </Box>
          
          {/* Modern Navigation Links */}
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {[
              { key: 'home', label: 'Home', icon: <Home />, gradient: 'linear-gradient(45deg, #4CAF50, #81C784)' },
              { key: 'about', label: 'About', icon: <Info />, gradient: 'linear-gradient(45deg, #2196F3, #64B5F6)' },
              { key: 'contact', label: 'Contact', icon: <ContactMail />, gradient: 'linear-gradient(45deg, #FF9800, #FFB74D)' },
              { key: 'developer', label: 'Developer', icon: <Person />, gradient: 'linear-gradient(45deg, #9C27B0, #CE93D8)' }
            ].map((item) => (
              <motion.div
                key={item.key}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.key)}
                  sx={{ 
                    color: 'white',
                    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
                    fontWeight: 600,
                    borderRadius: 3,
                    px: 2.5,
                    py: 1,
                    mx: 0.5,
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    '&:hover': { 
                      background: item.gradient,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {item.label}
                </Button>
              </motion.div>
            ))}
          </Stack>

          {/* Modern Mobile Navigation */}
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {[
              { key: 'about', icon: <Info />, color: '#2196F3' },
              { key: 'contact', icon: <ContactMail />, color: '#FF9800' },
              { key: 'developer', icon: <Person />, color: '#9C27B0' }
            ].map((item) => (
              <motion.div
                key={item.key}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IconButton 
                  color="inherit" 
                  onClick={() => handleNavigation(item.key)}
                  sx={{ 
                    color: 'white',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    '&:hover': {
                      background: `${item.color}40`,
                      transform: 'scale(1.1)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item.icon}
                </IconButton>
              </motion.div>
            ))}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Render Current Page */}
      {renderCurrentPage()}
      
      {/* Comprehensive Footer */}
      <Box sx={{ 
        mt: 8, 
        background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)',
        color: 'white'
      }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Footer Content */}
            <Stack spacing={4}>
              {/* Main Footer Info */}
              <Box>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="space-between">
                  {/* App Info */}
                  <Box flex={1}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                      <TravelExplore sx={{ fontSize: 32 }} />
                      <Typography variant="h5" fontWeight={700}>
                        TravelAI Pro
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ maxWidth: 400, lineHeight: 1.6, opacity: 0.9 }}>
                      Professional AI-powered travel planning platform that creates personalized itineraries 
                      with real locations, restaurant recommendations, and accommodation bookings.
                    </Typography>
                  </Box>
                  
                  {/* Quick Links */}
                  <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Quick Links
                    </Typography>
                    <Stack spacing={1}>
                      <Button 
                        color="inherit" 
                        sx={{ justifyContent: 'flex-start', p: 0, textTransform: 'none' }}
                        onClick={() => handleNavigation('home')}
                      >
                        🏠 Plan Your Trip
                      </Button>
                      <Button 
                        color="inherit" 
                        sx={{ justifyContent: 'flex-start', p: 0, textTransform: 'none' }}
                        onClick={() => handleNavigation('about')}
                      >
                        ℹ️ About TravelAI Pro
                      </Button>
                      <Button 
                        color="inherit" 
                        sx={{ justifyContent: 'flex-start', p: 0, textTransform: 'none' }}
                        href="mailto:travelplanner.ai.service@gmail.com"
                      >
                        📧 Get Support
                      </Button>
                    </Stack>
                  </Box>
                  
                  {/* Contact Info */}
                  <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Get In Touch
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email sx={{ fontSize: 18 }} />
                        <Typography variant="body2">
                          travelplanner.ai.service@gmail.com
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Connect with Developer
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="GitHub - View Source Code" arrow>
                            <IconButton 
                              href="https://github.com/yashh21nd" 
                              target="_blank"
                              sx={{ 
                                color: 'white', 
                                bgcolor: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                '&:hover': { 
                                  bgcolor: 'rgba(255,255,255,0.2)', 
                                  transform: 'scale(1.1)',
                                  border: '1px solid rgba(255,255,255,0.4)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <GitHub fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="LinkedIn - Professional Profile" arrow>
                            <IconButton 
                              href="https://www.linkedin.com/in/yash-shinde-dev?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BWBEjFChlTY2kYY%2FCRl0Q3A%3D%3D" 
                              target="_blank"
                              sx={{ 
                                color: 'white',
                                bgcolor: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                '&:hover': { 
                                  bgcolor: 'rgba(0,119,181,0.3)', 
                                  transform: 'scale(1.1)',
                                  border: '1px solid rgba(0,119,181,0.5)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <LinkedIn fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Email Developer" arrow>
                            <IconButton 
                              href="mailto:yashshinde.dev.work@gmail.com"
                              sx={{ 
                                color: 'white',
                                bgcolor: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                '&:hover': { 
                                  bgcolor: 'rgba(234,67,53,0.3)', 
                                  transform: 'scale(1.1)',
                                  border: '1px solid rgba(234,67,53,0.5)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <Email fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
              
              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              
              {/* Bottom Footer */}
              <Box>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  justifyContent="space-between" 
                  alignItems="center"
                  spacing={2}
                >
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    © 2025 TravelAI Pro. All Rights Reserved.
                  </Typography>
                </Stack>
                
                <Box textAlign="center" mt={2}>
                  <Typography variant="caption" sx={{ 
                    opacity: 1, 
                    fontStyle: 'italic',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    letterSpacing: '0.5px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    fontFamily: '"Poppins", "Inter", sans-serif'
                  }}>
                    🚀 Crafted by Yash Shinde • Where AI Meets Adventure • Your Next Journey Starts Here ✈️
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </motion.div>
        </Container>
      </Box>
    </>
  );
}
