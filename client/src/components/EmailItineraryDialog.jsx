import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, Alert, CircularProgress,
  Card, CardContent, InputAdornment
} from '@mui/material';
import { Email, Send, CheckCircle, AttachFile, Download } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function EmailItineraryDialog({ open, onClose, itinerary, destination, duration }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [fileName, setFileName] = useState('');

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use environment variable for API URL, fallback to local development
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/send-itinerary`, {
        email,
        itinerary,
        destination,
        duration,
        userInfo: {
          timestamp: new Date().toISOString()
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setEmail('');
        }, 3000);
      } else if (response.data.downloadAvailable) {
        // Email failed but PDF is available for download
        setError(response.data.message || 'Email failed but your PDF is ready for download!');
        setDownloadUrl(response.data.downloadUrl);
        setFileName(response.data.fileName);
      } else {
        setError(response.data.error || response.data.message || 'Email service temporarily unavailable. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      
      // More detailed and user-friendly error handling
      if (error.response && error.response.data) {
        console.error('Server error response:', error.response.data);
        const errorData = error.response.data;
        const errorMsg = errorData.error || errorData.message || errorData.suggestion || 'Unknown server error';
        
        console.log('Error message extracted:', errorMsg);
        
        if (errorMsg.includes('authentication') || errorMsg.includes('credentials') || errorMsg.includes('EAUTH')) {
          setError('Gmail authentication failed. Email service needs reconfiguration.');
        } else if (errorMsg.includes('connection') || errorMsg.includes('network') || errorMsg.includes('ECONNECTION')) {
          setError('Network connection issue. Please check your internet and try again.');
        } else if (errorMsg.includes('timeout')) {
          setError('Email sending timeout. Gmail servers may be slow - try again.');
        } else {
          setError(`Email failed: ${errorMsg}`);
        }
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please check your internet connection and try again.');
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError('Unable to connect to email service. The server might be temporarily down. Please try again in a few minutes.');
      } else if (error.message.includes('timeout')) {
        setError('Request timed out. Please try again.');
      } else {
        setError('Email service is temporarily unavailable. Please save your itinerary and try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setEmail('');
      setError('');
      setSuccess(false);
      setDownloadUrl('');
      setFileName('');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
        color: 'white',
        textAlign: 'center',
        pb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Email sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight={700}>
            Email Your Itinerary
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
          Receive your detailed {destination} travel plan via email
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ bgcolor: '#E8F5E8', border: '2px solid #81C784' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircle sx={{ fontSize: 64, color: '#2E7D32', mb: 2 }} />
                <Typography variant="h6" fontWeight={700} color="#2E7D32" gutterBottom>
                  Email Sent Successfully! 🎉
                </Typography>
                <Typography variant="body2" color="#424242" sx={{ mb: 2 }}>
                  Your itinerary has been sent to <strong>{email}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Check your inbox for the complete travel document with all location links and restaurant recommendations.
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Box>
            <Typography variant="h6" fontWeight={600} color="#2E7D32" gutterBottom>
              📧 Get Your Complete Travel Document
            </Typography>
            
            <Card sx={{ mb: 3, bgcolor: '#F1F8E9' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} color="#2E7D32" gutterBottom>
                  📎 What you'll receive:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2, color: '#424242' }}>
                  <li>📋 Complete day-by-day itinerary with specific timings</li>
                  <li>🍽️ Restaurant recommendations with Google Maps links</li>
                  <li>🗺️ Direct location links for easy navigation</li>
                  <li>💰 Detailed budget breakdown</li>
                  <li>🚗 Transportation guide for each day</li>
                  <li>📄 Downloadable text document for offline use</li>
                </Box>
              </CardContent>
            </Card>

            <TextField
              fullWidth
              label="Your Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email to receive the itinerary"
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
                endAdornment: loading && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                )
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#81C784',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#66BB6A',
                  },
                },
              }}
            />

            {error && (
              <Alert severity={downloadUrl ? "warning" : "error"} sx={{ mb: 2 }}>
                {error}
                {downloadUrl && (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Download />}
                      href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${downloadUrl}`}
                      download={fileName}
                      sx={{
                        background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)',
                        }
                      }}
                    >
                      Download PDF Instead
                    </Button>
                  </Box>
                )}
              </Alert>
            )}

            <Card sx={{ bgcolor: 'rgba(129, 199, 132, 0.1)', border: '1px solid #C8E6C9' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AttachFile sx={{ color: '#2E7D32', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={600} color="#2E7D32">
                    Document Details
                  </Typography>
                </Box>
                <Typography variant="body2" color="#424242">
                  <strong>Destination:</strong> {destination}<br/>
                  <strong>Duration:</strong> {duration} days<br/>
                  <strong>Format:</strong> Professional text document with all links<br/>
                  <strong>File size:</strong> ~5-15KB (very small for easy download)
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleClose}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendEmail}
            disabled={loading || !email}
            startIcon={loading ? <CircularProgress size={16} /> : <Send />}
            sx={{
              background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
              },
              '&:disabled': {
                background: '#ccc',
              }
            }}
          >
            {loading ? 'Sending...' : 'Send Itinerary'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}