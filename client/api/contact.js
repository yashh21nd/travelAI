// Vercel API function for contact form
// This runs as a serverless function on Vercel

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { name, email, subject, message, inquiryType } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    // Get email credentials from environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPassword) {
      console.log('Email credentials not configured');
      return res.status(500).json({
        success: false,
        error: 'Email service not configured'
      });
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPassword
      },
      tls: {
        rejectUnauthorized: false,
        servername: 'smtp.gmail.com'
      }
    });

    // Admin notification email
    const adminMailOptions = {
      from: emailUser,
      to: emailUser, // Send to same email (help.travel.ai@gmail.com)
      subject: `🎯 TravelAI Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Inquiry Type:</strong> ${inquiryType || 'general'}</p>
            <div style="margin-top: 20px;">
              <strong>Message:</strong>
              <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            Sent from TravelAI Pro Contact Form
          </p>
        </div>
      `
    };

    // User acknowledgment email
    const userMailOptions = {
      from: emailUser,
      to: email,
      subject: '✅ Message Received - TravelAI Pro',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">Thank You for Contacting TravelAI Pro!</h2>
          <p>Hi ${name},</p>
          <p>We've received your message and will get back to you within 24 hours.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>Your Message:</strong><br>
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p>Thank you for your interest in TravelAI Pro!</p>
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>TravelAI Pro Team</strong>
          </p>
        </div>
      `
    };

    // Send both emails
    const adminResult = await transporter.sendMail(adminMailOptions);
    const userResult = await transporter.sendMail(userMailOptions);

    console.log('Admin notification sent:', adminResult.messageId);
    console.log('User acknowledgment sent:', userResult.messageId);

    res.status(200).json({
      success: true,
      message: "Message sent successfully! We'll get back to you within 24 hours.",
      warning: "Email notifications may experience delays in serverless environments"
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      details: error.message
    });
  }
}