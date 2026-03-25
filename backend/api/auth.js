import connectDB from '../utils/db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// CORS configuration wrapper for Serverless Functions
const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Update with frontend domain in production
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

async function handler(req, res) {
  try {
    // 1. Establish DB Connection
    await connectDB();

    // 2. Handle POST Request (Login / Register)
    if (req.method === 'POST') {
      const { action, name, email, password } = req.body;

      if (!action) {
        return res.status(400).json({ success: false, message: 'Action (register/login) is required' });
      }

      // --- REGISTER ---
      if (action === 'register') {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, message: 'User already exists' });

        const user = await User.create({ name, email, password });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(201).json({
          success: true,
          token,
          user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
        });
      }

      // --- LOGIN ---
      if (action === 'login') {
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
          success: true,
          token,
          user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
        });
      }

      return res.status(400).json({ success: false, message: 'Invalid action. Use "login" or "register"' });
    }

    // 3. Handle GET Request (/me - Protected Route)
    if (req.method === 'GET') {
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        return res.status(200).json({ success: true, user });
      } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
      }
    }

    // Fallback for other methods
    return res.status(405).json({ message: 'Method Not Allowed' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export default allowCors(handler);
