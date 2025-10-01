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
import DeveloperPage from './components/DeveloperPage';
import AccommodationBooking from './components/AccommodationBooking';
import { Toaster } from 'react-hot-toast';
import { brandColors } from './theme';

export default function App() {
  const [result, setResult] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState('home'); // home, about, contact, privacy, developer

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
      case 'developer':
        return <DeveloperPage />;
      case 'accommodation':
        return (
          <Box sx={{ py: 4 }}>
            <AccommodationBooking 
              destination="Sample Destination"
              checkIn="2025-10-15"
              checkOut="2025-10-18"
              guests={2}
              currency="USD"
              tripDuration={3}
              onClose={() => setCurrentPage('home')}
            />
          </Box>
        );
      case 'home':
      default:
        return (
          <>
            {/* Professional Hero Section */}
            <Box sx={{ 
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
              backgroundImage: 'url(/background.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
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
                background: 'rgba(255, 255, 255, 0.7)',
                zIndex: 1
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23E3F2FD" fill-opacity="0.1"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.3,
                zIndex: 2
              }
            }}>
              <Container maxWidth="md" sx={{ position: 'relative', zIndex: 3 }}>
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
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          border: '1px solid rgba(25, 118, 210, 0.3)',
                          backdropFilter: 'blur(10px)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#424242',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '14px',
            fontWeight: '500'
          },
          success: {
            iconTheme: {
              primary: brandColors.primary.main,
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f44336',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: brandColors.primary.main,
              secondary: '#fff',
            },
          }
        }}
      />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Professional Header */}
        <ProfessionalHeader onNavigate={handleNavigation} currentPage={currentPage} />
        <Toolbar /> {/* Spacer for fixed header */}
        
        {/* Main Content */}
        <Box sx={{ flexGrow: 1 }}>
          {renderCurrentPage()}
        </Box>
        
        {/* Professional Footer */}
        <ProfessionalFooter onNavigate={handleNavigation} />
      </Box>
    </ThemeProvider>
  );
}