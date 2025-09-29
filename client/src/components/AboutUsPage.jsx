import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  LinearProgress,
  Button,
  Divider
} from '@mui/material';
import {
  TravelExplore,
  Group,
  TrendingUp,
  Security,
  AutoAwesome,
  Language,
  BusinessCenter,
  Award,
  Analytics,
  Speed
} from '@mui/icons-material';
import { brandColors } from '../theme';

const AboutUsPage = () => {
  const stats = [
    { label: 'Happy Travelers', value: '50,000+', icon: Group },
    { label: 'Destinations Covered', value: '195+', icon: TravelExplore },
    { label: 'Monthly Growth', value: '35%', icon: TrendingUp },
    { label: 'Partner Hotels', value: 'Initial Partners', icon: BusinessCenter }
  ];

  const features = [
    {
      icon: AutoAwesome,
      title: 'AI-Powered Planning',
      description: 'Advanced machine learning algorithms create personalized itineraries based on your preferences, budget, and travel style.'
    },
    {
      icon: Security,
      title: 'Secure & Trusted',
      description: 'Enterprise-grade security with SSL encryption, GDPR compliance, and partnerships with verified travel providers.'
    },
    {
      icon: Language,
      title: 'Global Coverage',
      description: 'Comprehensive destination database with local insights, cultural tips, and region-specific recommendations.'
    },
    {
      icon: Speed,
      title: 'Instant Results',
      description: 'Generate complete travel plans in seconds, with real-time pricing and availability from multiple sources.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-Founder',
      bio: 'Former travel industry executive with 15+ years experience at Expedia and Booking.com',
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-Founder', 
      bio: 'AI/ML expert, former Google engineer with expertise in recommendation systems',
      avatar: 'MC'
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Partnerships',
      bio: 'Travel industry veteran managing relationships with 100+ global accommodation partners',
      avatar: 'PS'
    },
    {
      name: 'James Wilson',
      role: 'Head of Product',
      bio: 'UX expert focused on creating seamless travel planning experiences',
      avatar: 'JW'
    }
  ];

  const milestones = [
    { 
      year: '2025', 
      title: 'Platform Launch', 
      description: 'TravelAI Pro officially launched with cutting-edge AI travel planning technology. Built on modern React architecture with enterprise-grade security, the platform introduced revolutionary features like real-time itinerary generation, budget optimization, and privacy-first design. Our initial launch focused on creating the most intuitive travel planning experience, eliminating the need for user accounts while delivering personalized results. The platform immediately gained traction among early adopters who appreciated the seamless, intelligent approach to travel planning.' 
    },
    { 
      year: '2025', 
      title: 'AI Core Development', 
      description: 'Completed development of our proprietary AI engine that powers personalized travel recommendations. The system integrates multiple data sources including weather patterns, local events, cultural preferences, and budget constraints to create perfectly tailored itineraries. Our machine learning algorithms continuously improve recommendations based on successful trip outcomes, ensuring each suggestion becomes more accurate over time. This technological foundation sets us apart in the competitive travel tech landscape.' 
    },
    { 
      year: '2025', 
      title: 'Partnership Network', 
      description: 'Established strategic partnerships with major travel platforms including Booking.com, Expedia, Agoda, Hotels.com, Priceline, Kayak, and Skyscanner. These affiliate relationships enable seamless booking integration while maintaining our commitment to user privacy. Our partnership model ensures users get competitive prices while we maintain sustainable revenue streams. The network expansion represents a crucial milestone in our journey toward becoming a comprehensive travel solution.' 
    },
    { 
      year: '2026', 
      title: 'Global Expansion', 
      description: 'Planned expansion into international markets starting with India through partnerships with GoIbibo and MakeMyTrip. This strategic move will introduce our AI-powered platform to millions of new users in one of the world\'s fastest-growing travel markets. The expansion includes localization features, regional travel preferences, and partnerships with local service providers to ensure authentic, culturally-aware travel recommendations.' 
    }
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        backgroundImage: 'url(/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.7)',
          zIndex: 1
        }
      }}
    >
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 2 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={8}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 700,
              mb: 3,
              background: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Revolutionizing Travel Planning with AI
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: 'auto', mb: 4, lineHeight: 1.6 }}
          >
            TravelAI Pro is a professional travel technology company that combines artificial intelligence 
            with deep travel industry expertise to create personalized, seamless travel experiences for 
            modern travelers worldwide.
          </Typography>
          
          {/* Stats */}
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {stats.map((stat) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <Card sx={{ textAlign: 'center', p: 2 }}>
                  <stat.icon sx={{ fontSize: 40, color: brandColors.primary.main, mb: 1 }} />
                  <Typography variant="h4" fontWeight={700} color="primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Mission & Vision */}
        <Grid container spacing={6} sx={{ mb: 8 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', p: 4 }}>
              <Typography variant="h4" fontWeight={600} mb={3} color="primary">
                Our Mission
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                To democratize premium travel planning by making personalized, AI-powered travel 
                recommendations accessible to everyone. We believe that every traveler deserves 
                a perfectly crafted journey that matches their unique preferences, budget, and dreams.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', p: 4 }}>
              <Typography variant="h4" fontWeight={600} mb={3} color="secondary">
                Our Vision
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                To become the world's most trusted AI travel companion, setting the standard for 
                intelligent travel planning technology. We envision a future where planning the 
                perfect trip is effortless, enjoyable, and tailored to each individual's desires.
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Features */}
        <Box mb={8}>
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight={600}
            mb={2}
            color="text.primary"
          >
            Why Choose TravelAI Pro
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Our platform combines cutting-edge technology with travel industry expertise
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature) => (
              <Grid item xs={12} md={6} key={feature.title}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Box
                      sx={{
                        backgroundColor: brandColors.primary.main,
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <feature.icon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600} mb={1}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* About Developer Section */}
        <Box mb={8}>
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight={600}
            mb={2}
            color="text.primary"
          >
            About the Developer
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Meet the mind behind TravelAI Pro's innovative technology
          </Typography>
          
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Card 
              sx={{ 
                p: 4,
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                borderRadius: 4,
                background: `linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, rgba(255, 107, 53, 0.02) 100%)`,
                border: `1px solid ${brandColors.neutral[200]}`
              }}
            >
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center" gap={4}>
                {/* Developer Avatar */}
                <Avatar
                  src="/profile.jpg?v=1"
                  alt="Yash Shinde Profile Picture"
                  sx={{
                    width: { xs: 120, md: 150 },
                    height: { xs: 120, md: 150 },
                    background: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.secondary.main} 100%)`,
                    fontSize: { xs: '2.5rem', md: '3rem' },
                    fontWeight: 700,
                    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)'
                  }}
                >
                  YS
                </Avatar>
                
                {/* Developer Info */}
                <Box flex={1}>
                  <Typography variant="h4" fontWeight={700} mb={1} color="primary">
                    Yash Shinde
                  </Typography>
                  <Typography variant="h6" color="secondary" fontWeight={600} mb={3}>
                    Cloud Computing Developer & AI Specialist
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
                    "I Build. I Deploy. I Scale. Welcome to my space."
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 4 }}>
                    I am a passionate Cloud Computing Developer with a strong background in artificial intelligence 
                    and data science. I specialize in building scalable, serverless applications on AWS and have 
                    hands-on experience with the MERN stack. My journey began with a curiosity for technology and 
                    a drive to solve real-world problems. I enjoy collaborating on innovative projects, mentoring 
                    peers, and continuously learning new skills. I Build. I Deploy. I Scale. Welcome to my space, 
                    where I turn ideas into impactful solutions.
                  </Typography>
                  
                  {/* Skills */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} mb={2} color="text.primary">
                      Core Technologies:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {['AWS Cloud', 'MERN Stack', 'AI/ML', 'Serverless', 'React', 'Node.js', 'Python', 'Data Science'].map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{
                            backgroundColor: brandColors.primary.main,
                            color: 'white',
                            fontWeight: 500
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>

        {/* Project Motivation */}
        <Box mb={8}>
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight={600}
            mb={2}
            color="text.primary"
          >
            Our Motivation
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Why we built TravelAI Pro and our vision for the future
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  height: '100%', 
                  p: 4,
                  background: `linear-gradient(135deg, rgba(25, 118, 210, 0.85) 0%, rgba(21, 101, 192, 0.85) 100%)`,
                  color: 'white',
                  boxShadow: '0 8px 30px rgba(25, 118, 210, 0.25)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Typography variant="h5" fontWeight={600} mb={3} sx={{ color: 'white' }}>
                  The Problem We Solve
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.95)' }}>
                  Travel planning is complex, time-consuming, and often overwhelming. People spend hours researching 
                  destinations, comparing prices, and creating itineraries, only to worry they've missed something important. 
                  Traditional travel sites focus on bookings, not planning.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  height: '100%', 
                  p: 4,
                  background: `linear-gradient(135deg, rgba(255, 107, 53, 0.85) 0%, rgba(229, 81, 0, 0.85) 100%)`,
                  color: 'white',
                  boxShadow: '0 8px 30px rgba(255, 107, 53, 0.25)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Typography variant="h5" fontWeight={600} mb={3} sx={{ color: 'white' }}>
                  Our Solution
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.95)' }}>
                  TravelAI Pro uses advanced AI to understand your preferences and create personalized itineraries instantly. 
                  No accounts, no data storage, no complexity - just intelligent travel planning that respects your privacy 
                  while delivering exceptional results.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Mission & Vision */}
        <Box mb={8}>
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight={600}
            mb={2}
            color="text.primary"
          >
            Our Journey
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Key milestones in building the future of travel planning
          </Typography>
          
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {milestones.map((milestone, index) => (
              <Box key={milestone.year} sx={{ mb: 4 }}>
                <Box display="flex" alignItems="center" gap={3} mb={2}>
                  <Chip
                    label={milestone.year}
                    sx={{
                      backgroundColor: brandColors.primary.main,
                      color: 'white',
                      fontWeight: 600,
                      minWidth: 80
                    }}
                  />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {milestone.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {milestone.description}
                    </Typography>
                  </Box>
                </Box>
                {index < milestones.length - 1 && (
                  <Divider sx={{ ml: 5, borderColor: brandColors.neutral[300] }} />
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* CTA Section */}
        <Card
          sx={{
            p: 6,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.secondary.main} 100%)`,
            color: 'white'
          }}
        >
          <Typography variant="h4" fontWeight={600} mb={2}>
            Ready to Transform Your Travel Planning?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of travelers who trust TravelAI Pro for their perfect trips
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: brandColors.primary.main,
                fontWeight: 700,
                fontSize: '1.2rem',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                border: `3px solid ${brandColors.primary.main}`,
                boxShadow: '0 4px 20px rgba(255,255,255,0.9)',
                textShadow: 'none',
                '&:hover': {
                  backgroundColor: brandColors.primary.main,
                  color: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 30px rgba(255,255,255,1)',
                  border: '3px solid white',
                }
              }}
            >
              Start Planning Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.2rem',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                border: '3px solid white',
                backdropFilter: 'blur(10px)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                '&:hover': {
                  backgroundColor: 'white',
                  borderColor: 'white',
                  color: brandColors.primary.main,
                  transform: 'translateY(-2px)',
                  textShadow: 'none'
                }
              }}
            >
              Learn More
            </Button>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

export default AboutUsPage;