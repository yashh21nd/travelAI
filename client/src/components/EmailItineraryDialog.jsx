import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Alert, CircularProgress,
  Card, CardContent
} from '@mui/material';
import { Download, CheckCircle, AttachFile } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function EmailItineraryDialog({ open, onClose, itinerary, destination, duration }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [fileName, setFileName] = useState('');

  const handleDownloadPDF = async () => {
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      console.log('📄 Generating PDF for download...');
      
      // Call the backend to generate PDF
      const response = await axios.post(`${apiUrl}/api/send-itinerary`, {
        email: 'download@travelai.com', // Dummy email for PDF generation
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
        }, 2000);
      } else if (response.data.downloadAvailable || response.data.downloadUrl) {
        // PDF is available for download
        const downloadLink = response.data.downloadUrl;
        const pdfFileName = response.data.fileName;
        
        // Create download link and trigger download
        const fullDownloadUrl = `${apiUrl}${downloadLink}`;
        
        const link = document.createElement('a');
        link.href = fullDownloadUrl;
        link.download = pdfFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        setError(response.data.error || response.data.message || 'Failed to generate PDF. Please try again.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        if (errorData.downloadAvailable || errorData.downloadUrl) {
          const downloadLink = errorData.downloadUrl;
          const pdfFileName = errorData.fileName;
          
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          const fullDownloadUrl = `${apiUrl}${downloadLink}`;
          
          const link = document.createElement('a');
          link.href = fullDownloadUrl;
          link.download = pdfFileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setSuccess(true);
          setTimeout(() => {
            onClose();
            setSuccess(false);
          }, 2000);
        } else {
          const errorMsg = errorData.error || errorData.message || 'Unknown server error';
          setError(`PDF generation failed: ${errorMsg}`);
        }
      } else {
        setError('PDF generation service is temporarily unavailable. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError('');
      setSuccess(false);
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
          <Download sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight={700}>
            Download Your Itinerary
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
          Get your detailed {destination} travel plan as a professional PDF
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
                  PDF Downloaded Successfully! 🎉
                </Typography>
                <Typography variant="body2" color="#424242" sx={{ mb: 2 }}>
                  Your itinerary PDF has been downloaded to your device
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Check your downloads folder for the complete travel document with all location links and restaurant recommendations.
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Box>
            <Typography variant="h6" fontWeight={600} color="#2E7D32" gutterBottom>
              � Get Your Complete Travel Document
            </Typography>
            
            <Card sx={{ mb: 3, bgcolor: '#F1F8E9' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} color="#2E7D32" gutterBottom>
                  📎 What you'll get:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2, color: '#424242' }}>
                  <li>📋 Complete day-by-day itinerary with specific timings</li>
                  <li>🍽️ Restaurant recommendations with Google Maps links</li>
                  <li>🗺️ Direct location links for easy navigation</li>
                  <li>💰 Detailed budget breakdown</li>
                  <li>🚗 Transportation guide for each day</li>
                  <li>📄 Professional PDF document for printing/sharing</li>
                </Box>
              </CardContent>
            </Card>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
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
                  <strong>Format:</strong> Professional PDF with clickable links<br/>
                  <strong>File size:</strong> ~500KB-2MB (optimized for all devices)
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
            onClick={handleDownloadPDF}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Download />}
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
            {loading ? 'Generating PDF...' : 'Download PDF'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}