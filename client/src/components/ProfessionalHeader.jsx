import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useScrollTrigger,
  Slide
} from '@mui/material';
import {
  TravelExplore,
  Menu as MenuIcon,
  Language,
  Business
} from '@mui/icons-material';
import { brandColors } from '../theme';

// Hide AppBar on scroll for professional mobile experience
function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

// Professional Logo Component
const Logo = ({ size = 'medium' }) => {
  const logoSizes = {
    small: { icon: 24, text: '1.25rem' },
    medium: { icon: 32, text: '1.5rem' },
    large: { icon: 40, text: '1.75rem' }
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.secondary.main} 100%)`,
          borderRadius: 2,
          p: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <TravelExplore 
          sx={{ 
            fontSize: logoSizes[size].icon,
            color: 'white'
          }} 
        />
      </Box>
      <Typography
        variant="h6"
        component="div"
        sx={{
          fontSize: logoSizes[size].text,
          fontWeight: 700,
          background: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.secondary.main} 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.01em'
        }}
      >
        TravelAI Pro
      </Typography>
    </Box>
  );
};

// Professional Navigation Menu
const NavigationMenu = ({ onNavigate, currentPage, menuItems }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavClick = (href) => {
    if (onNavigate) {
      onNavigate(href);
    }
    handleClose();
  };

  return (
    <>
      {/* Desktop Navigation */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
        {menuItems.map((item) => (
          <Button
            key={item.label}
            color="inherit"
            onClick={() => handleNavClick(item.href)}
            sx={{
              color: currentPage === item.href ? brandColors.primary.main : brandColors.neutral[700],
              fontWeight: currentPage === item.href ? 600 : 500,
              px: 2,
              py: 1,
              borderRadius: 2,
              backgroundColor: currentPage === item.href ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                color: brandColors.primary.main
              }
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      {/* Mobile Navigation */}
      <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          onClick={handleMenu}
          sx={{ color: brandColors.neutral[700] }}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 3,
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
            }
          }}
        >
          {menuItems.map((item) => (
            <MenuItem 
              key={item.label} 
              onClick={() => handleNavClick(item.href)}
              sx={{
                fontWeight: currentPage === item.href ? 600 : 500,
                py: 1.5,
                backgroundColor: currentPage === item.href ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                color: currentPage === item.href ? brandColors.primary.main : 'inherit',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </>
  );
};

// Professional Header Component
const ProfessionalHeader = ({ onNavigate, currentPage }) => {

  const menuItems = [
    { label: 'Plan Trip', href: 'home' },
    { label: 'About Us', href: 'about' },
    { label: 'Contact', href: 'contact' },
    { label: 'Privacy & Terms', href: 'privacy' }
  ];

  return (
    <HideOnScroll>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${brandColors.neutral[200]}`
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1 }}>
          {/* Logo */}
          <Logo size="medium" />

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Navigation */}
          <NavigationMenu onNavigate={onNavigate} currentPage={currentPage} menuItems={menuItems} />

          {/* User Actions - Simplified for Login-Free */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            {/* Language Selector */}
            <IconButton
              size="small"
              sx={{ 
                color: brandColors.neutral[600],
                '&:hover': { color: brandColors.primary.main }
              }}
            >
              <Language fontSize="small" />
            </IconButton>

            {/* Business/Partner Portal */}
            <IconButton
              size="small"
              onClick={() => onNavigate && onNavigate('contact')}
              sx={{ 
                color: brandColors.neutral[600],
                '&:hover': { color: brandColors.primary.main }
              }}
            >
              <Business fontSize="small" />
            </IconButton>

            {/* CTA Button */}
            <Button
              variant="contained"
              size="small"
              onClick={() => onNavigate && onNavigate('home')}
              sx={{
                ml: 1,
                px: 2.5,
                py: 1,
                borderRadius: 2,
                fontWeight: 600,
                backgroundColor: brandColors.primary.main,
                color: 'white',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  backgroundColor: brandColors.primary.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
                }
              }}
            >
              Plan Trip
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};

export default ProfessionalHeader;
export { Logo };