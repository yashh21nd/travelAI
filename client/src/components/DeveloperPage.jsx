import React, { useState } from 'react';
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
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  GitHub,
  LinkedIn, 
  Email,
  Code,
  CloudQueue,
  Psychology,
  Storage,
  Speed,
  Security,
  Build,
  MonetizationOn,
  Person
} from '@mui/icons-material';
import AffiliateDashboard from './AffiliateDashboard';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function DeveloperPage() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  const skills = [
    { name: "Cloud Computing", level: 95, color: "#FF9800" },
    { name: "AWS Services", level: 92, color: "#FF5722" },
    { name: "React & Node.js", level: 90, color: "#2196F3" },
    { name: "Python & AI/DS", level: 88, color: "#4CAF50" },
    { name: "Data Science", level: 85, color: "#9C27B0" },
    { name: "DevOps & CI/CD", level: 82, color: "#607D8B" }
  ];

  const achievements = [
    {
      icon: <CloudQueue />,
      title: "Cloud Architecture Expert",
      description: "Designed and deployed 50+ scalable applications on AWS with 99.9% uptime"
    },
    {
      icon: <Psychology />,
      title: "AI/DS Specialist",
      description: "Implemented machine learning models for predictive analytics and automation"
    },
    {
      icon: <Code />,
      title: "Full-Stack Developer",
      description: "Proficient in MERN stack with expertise in serverless architectures"
    },
    {
      icon: <Storage />,
      title: "Data Engineering",
      description: "Built data pipelines processing millions of records with real-time analytics"
    },
    {
      icon: <Security />,
      title: "Security & Compliance",
      description: "Implemented enterprise-grade security measures and compliance frameworks"
    },
    {
      icon: <Speed />,
      title: "Performance Optimization",
      description: "Optimized applications for sub-second response times and cost efficiency"
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header Section with Profile */}
        <Paper elevation={0} sx={{ 
          background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)',
          animation: 'gradient 15s ease infinite',
          backgroundSize: '400% 400%',
          '@keyframes gradient': {
            '0%': {
              backgroundPosition: '0% 50%'
            },
            '50%': {
              backgroundPosition: '100% 50%'
            },
            '100%': {
              backgroundPosition: '0% 50%'
            }
          },
          borderRadius: 4,
          mb: 4,
          p: 6
        }}>
          {/* Navigation Tabs */}
          <Box sx={{ mb: 4 }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  color: '#1976D2'
                },
                '& .Mui-selected': {
                  color: '#0D47A1 !important'
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1976D2',
                  height: 3
                }
              }}
            >
              <Tab 
                icon={<Person />} 
                label="Developer Profile" 
                iconPosition="start"
              />
              <Tab 
                icon={<MonetizationOn />} 
                label="Affiliate Revenue" 
                iconPosition="start"
              />
            </Tabs>
          </Box>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={currentTab} index={0}>
          {/* Original Developer Profile Content */}
          <Paper elevation={0} sx={{ 
            background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)',
            animation: 'gradient 15s ease infinite',
            backgroundSize: '400% 400%',
            '@keyframes gradient': {
              '0%': {
                backgroundPosition: '0% 50%'
              },
              '50%': {
                backgroundPosition: '100% 50%'
              },
              '100%': {
                backgroundPosition: '0% 50%'
              }
            },
          p: 6, 
          borderRadius: 3, 
          mb: 8, 
          textAlign: 'center' 
        }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Avatar
              src="/api/placeholder/150/150"
              sx={{ 
                width: 150, 
                height: 150, 
                mx: 'auto', 
                mb: 3,
                border: '4px solid white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }}
            />
          </motion.div>
          
          <Typography 
            variant="h3" 
            fontWeight={700} 
            color="#1565C0" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '2.2rem', md: '2.8rem' },
              fontFamily: '"Poppins", "Inter", "Roboto", sans-serif',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              letterSpacing: '0.5px'
            }}
          >
            Yash Shinde
          </Typography>
          
          <Typography 
            variant="h5" 
            color="#1976D2" 
            mb={2} 
            fontWeight={600}
            sx={{ 
              fontSize: '1.4rem',
              fontFamily: '"Poppins", "Inter", sans-serif'
            }}
          >
            Cloud Computing Developer
          </Typography>
          
          <Typography 
            variant="h5" 
            color="#0D47A1" 
            mb={3} 
            fontWeight={600}
            sx={{
              fontFamily: '"Inter", "Roboto", sans-serif',
              fontSize: '1.2rem'
            }}
          >
            B.Tech in AIDS (Artificial Intelligence and Data Science)
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              maxWidth: 600, 
              mx: 'auto', 
              mb: 4,
              fontStyle: 'italic',
              color: '#0D47A1',
              fontWeight: 600,
              fontFamily: '"Poppins", "Inter", sans-serif',
              fontSize: '1.1rem',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            "I Build. I Deploy. I Scale. Welcome to my space."
          </Typography>

          {/* Social Links */}
          <Stack direction="row" spacing={2} justifyContent="center" mb={4}>
            <Tooltip title="View GitHub Profile" arrow>
              <IconButton 
                href="https://github.com/yashh21nd" 
                target="_blank"
                sx={{ 
                  bgcolor: 'white', 
                  border: '2px solid transparent',
                  '&:hover': { 
                    bgcolor: '#f5f5f5', 
                    transform: 'scale(1.1)', 
                    border: '2px solid #333',
                    boxShadow: '0 4px 12px rgba(51,51,51,0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <GitHub sx={{ color: '#333', fontSize: 28 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Connect on LinkedIn" arrow>
              <IconButton 
                href="https://www.linkedin.com/in/yash-shinde-dev?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BWBEjFChlTY2kYY%2FCRl0Q3A%3D%3D" 
                target="_blank"
                sx={{ 
                  bgcolor: 'white', 
                  border: '2px solid transparent',
                  '&:hover': { 
                    bgcolor: '#f0f8ff', 
                    transform: 'scale(1.1)', 
                    border: '2px solid #0077B5',
                    boxShadow: '0 4px 12px rgba(0,119,181,0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <LinkedIn sx={{ color: '#0077B5', fontSize: 28 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Send Email" arrow>
              <IconButton 
                href="mailto:yashshinde.dev.work@gmail.com"
                sx={{ 
                  bgcolor: 'white', 
                  border: '2px solid transparent',
                  '&:hover': { 
                    bgcolor: '#fff5f5', 
                    transform: 'scale(1.1)', 
                    border: '2px solid #EA4335',
                    boxShadow: '0 4px 12px rgba(234,67,53,0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Email sx={{ color: '#EA4335', fontSize: 28 }} />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Chip 
              label="Cloud Computing Expert" 
              sx={{ 
                bgcolor: 'white', 
                color: '#1565C0', 
                fontWeight: 600,
                fontFamily: '"Inter", "Roboto", sans-serif',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }} 
            />
            <Chip 
              label="AI/DS Specialist" 
              sx={{ 
                bgcolor: 'white', 
                color: '#1565C0', 
                fontWeight: 600,
                fontFamily: '"Inter", "Roboto", sans-serif',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }} 
            />
            <Chip 
              label="MERN Stack Developer" 
              sx={{ 
                bgcolor: 'white', 
                color: '#1565C0', 
                fontWeight: 600,
                fontFamily: '"Inter", "Roboto", sans-serif',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }} 
            />
          </Stack>
        </Paper>

        {/* About Section */}
        <Box mb={8}>
          <Typography 
            variant="h3" 
            fontWeight={700} 
            color="#1565C0" 
            gutterBottom 
            textAlign="center" 
            mb={6}
            sx={{
              fontFamily: '"Poppins", "Inter", sans-serif',
              fontSize: { xs: '2rem', md: '2.4rem' },
              letterSpacing: '0.5px'
            }}
          >
            About My Journey
          </Typography>
          
          <Paper elevation={0} sx={{ 
            background: 'linear-gradient(135deg, #F3F8FF 0%, #E8F0FE 100%)', 
            p: 6, 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(21,101,192,0.1)'
          }}>
            <Typography 
              variant="h6" 
              color="text.primary" 
              sx={{ 
                lineHeight: 1.8, 
                textAlign: 'center', 
                maxWidth: 1000, 
                mx: 'auto',
                fontFamily: '"Inter", "Roboto", sans-serif',
                fontSize: '1.1rem'
              }}
            >
              I am a passionate <strong style={{ color: '#1565C0' }}>Cloud Computing Developer</strong> with a strong background in 
              artificial intelligence and data science (AIDS). I specialize in building scalable, serverless applications on AWS and have 
              hands-on experience with the MERN stack. My journey began with a curiosity for technology and a drive to solve 
              real-world problems.
            </Typography>
            
            <Typography 
              variant="h6" 
              color="text.primary" 
              sx={{ 
                lineHeight: 1.8, 
                textAlign: 'center', 
                maxWidth: 1000, 
                mx: 'auto', 
                mt: 3,
                fontFamily: '"Inter", "Roboto", sans-serif',
                fontSize: '1.1rem'
              }}
            >
              I enjoy collaborating on innovative projects, mentoring peers, and continuously learning new skills. 
              <strong style={{ color: '#1565C0' }}> I Build. I Deploy. I Scale.</strong> Welcome to my space, where I turn ideas into impactful solutions.
            </Typography>
          </Paper>
        </Box>

        {/* Skills Section */}
        <Box mb={8}>
          <Typography 
            variant="h3" 
            fontWeight={700} 
            color="#1565C0" 
            gutterBottom 
            textAlign="center" 
            mb={6}
            sx={{
              fontFamily: '"Poppins", "Inter", sans-serif',
              fontSize: { xs: '2rem', md: '2.4rem' },
              letterSpacing: '0.5px'
            }}
          >
            Technical Expertise
          </Typography>
          
          <Grid container spacing={4}>
            {skills.map((skill, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography 
                          variant="h6" 
                          fontWeight={600} 
                          color="#1565C0"
                          sx={{ fontFamily: '"Inter", "Roboto", sans-serif' }}
                        >
                          {skill.name}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color={skill.color}>
                          {skill.level}%
                        </Typography>
                      </Box>
                      
                      <Box sx={{ bgcolor: '#f0f0f0', borderRadius: 1, height: 8, mb: 1 }}>
                        <motion.div
                          style={{
                            width: `${skill.level}%`,
                            height: '100%',
                            backgroundColor: skill.color,
                            borderRadius: 4
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Achievements */}
        <Box mb={8}>
          <Typography 
            variant="h3" 
            fontWeight={700} 
            color="#1565C0" 
            gutterBottom 
            textAlign="center" 
            mb={6}
            sx={{
              fontFamily: '"Poppins", "Inter", sans-serif',
              fontSize: { xs: '2rem', md: '2.4rem' },
              letterSpacing: '0.5px'
            }}
          >
            Professional Achievements
          </Typography>
          
          <Grid container spacing={4}>
            {achievements.map((achievement, index) => (
              <Grid item xs={12} sm={6} lg={4} key={index}>
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
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-8px)', 
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)' 
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Box 
                        sx={{ 
                          display: 'inline-flex',
                          p: 2,
                          borderRadius: '50%',
                          bgcolor: '#E3F2FD',
                          color: '#1565C0',
                          mb: 3
                        }}
                      >
                        {React.cloneElement(achievement.icon, { fontSize: 'large' })}
                      </Box>
                      <Typography 
                        variant="h6" 
                        fontWeight={700} 
                        color="#1565C0" 
                        gutterBottom
                        sx={{ fontFamily: '"Inter", "Roboto", sans-serif' }}
                      >
                        {achievement.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" lineHeight={1.6}>
                        {achievement.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Contact Section */}
        <Box textAlign="center" mt={8}>
          <Typography 
            variant="h4" 
            fontWeight={700} 
            color="#1565C0" 
            gutterBottom
            sx={{ fontFamily: '"Poppins", "Inter", sans-serif' }}
          >
            Let's Build Something Amazing Together
          </Typography>
          <Typography variant="h6" color="text.secondary" mb={4}>
            Ready to turn your ideas into scalable, cloud-native solutions?
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            href="mailto:yashshinde.dev.work@gmail.com"
            sx={{
              bgcolor: '#1565C0',
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontFamily: '"Inter", "Roboto", sans-serif',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(21,101,192,0.3)',
              '&:hover': { 
                bgcolor: '#0D47A1', 
                transform: 'scale(1.05)',
                boxShadow: '0 6px 16px rgba(21,101,192,0.4)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Email sx={{ mr: 1 }} />
            Get In Touch
          </Button>
        </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          {/* Affiliate Dashboard */}
          <AffiliateDashboard />
        </TabPanel>
      </motion.div>
    </Container>
  );
}