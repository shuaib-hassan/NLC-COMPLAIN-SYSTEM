import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import db from '../db/database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nlccms-secret-key-2026';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Helper to send verification email
const sendVerificationEmail = async (email: string, name: string, token: string) => {
  const verificationUrl = `${BASE_URL}/api/auth/verify/${token}`;
  
  const mailOptions = {
    from: `"NLC Complaints" <${process.env.SMTP_USER || 'noreply@nlc.go.ke'}>`,
    to: email,
    subject: 'Verify Your NLC Complaints Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">National Land Commission</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Hello ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for registering with the NLC Complaints Management System. 
            Please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #10b981;">${verificationUrl}</a>
          </p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('[DEBUG AUTH] Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('[DEBUG AUTH] Failed to send email:', error);
    return false;
  }
};

// Helper to generate verification token
const generateVerificationToken = () => crypto.randomBytes(32).toString('hex');

// Register
router.post('/register', async (req, res) => {
  console.log('[DEBUG AUTH] Register endpoint hit:', req.body);
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    console.log('[DEBUG AUTH] Missing fields');
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const userExists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (userExists) {
      console.log('[DEBUG AUTH] User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const verificationToken = generateVerificationToken();
    
    const result = db.prepare('INSERT INTO users (name, email, password, verification_token, email_verified) VALUES (?, ?, ?, ?, ?)')
      .run(name, email, hashedPassword, verificationToken, 0);

    console.log('[DEBUG AUTH] User registered successfully:', { id: result.lastInsertRowid, email });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, name, verificationToken);
    
    if (!emailSent) {
      console.log('[DEBUG AUTH] Warning: Email may not have been sent. Check SMTP configuration.');
    }

    res.json({
      message: 'Registration successful! Please check your email to verify your account. Check your spam folder if you don\'t see it within a few minutes.'
    });
  } catch (err) {
    console.error('[DEBUG AUTH] Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify email
router.get('/verify/:token', (req, res) => {
  const { token } = req.params;
  console.log('[DEBUG AUTH] Verification attempt with token:', token.substring(0, 10) + '...');

  try {
    const user = db.prepare('SELECT id, email_verified FROM users WHERE verification_token = ?').get(token) as any;
    
    if (!user) {
      console.log('[DEBUG AUTH] Invalid verification token');
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    if (user.email_verified === 1) {
      console.log('[DEBUG AUTH] Email already verified for user:', user.id);
      return res.json({ message: 'Email already verified', alreadyVerified: true });
    }

    // Update user as verified
    db.prepare('UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?')
      .run(user.id);
    
    console.log('[DEBUG AUTH] Email verified successfully for user:', user.id);
    res.json({ message: 'Email verified successfully! You can now login.' });
  } catch (err) {
    console.error('[DEBUG AUTH] Verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  console.log('[DEBUG AUTH] Resend verification request for:', email);

  try {
    const user = db.prepare('SELECT id, name, email_verified FROM users WHERE email = ?').get(email) as any;
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.email_verified === 1) {
      return res.json({ message: 'Email already verified' });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    db.prepare('UPDATE users SET verification_token = ? WHERE email = ?').run(verificationToken, email);

    // Send verification email
    await sendVerificationEmail(email, user.name, verificationToken);

    res.json({ 
      message: 'Verification email sent! Please check your inbox.'
    });
  } catch (err) {
    console.error('[DEBUG AUTH] Resend verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  console.log('[DEBUG AUTH] Login endpoint hit:', { email: req.body.email });
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('[DEBUG AUTH] Missing fields');
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      console.log('[DEBUG AUTH] User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified (skip for admin users)
    if (user.role !== 'admin' && user.email_verified !== 1) {
      console.log('[DEBUG AUTH] Email not verified:', email);
      return res.status(403).json({ 
        message: 'Please verify your email before logging in.',
        emailVerified: false,
        email: email
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      console.log('[DEBUG AUTH] Password mismatch for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    console.log('[DEBUG AUTH] Login successful:', email);

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, department_id: user.department_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id
      }
    });
  } catch (err) {
    console.error('[DEBUG AUTH] Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
