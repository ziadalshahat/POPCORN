import connectDB from '../utils/db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  return await fn(req, res);
};

async function handler(req, res) {
  try {
    await connectDB();

    if (req.method === 'POST') {
      const { action, name, email, password } = req.body;

      if (action === 'register') {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ success: false, message: 'User already exists' });
        
        const user = await User.create({ name, email, password });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        
        return res.status(201).json({ success: true, token, user });
      }

      if (action === 'login') {
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        
        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        return res.status(200).json({ success: true, token, user });
      }

      return res.status(400).json({ message: 'Invalid action' });
    }

    if (req.method === 'GET') {
      let token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'Not authorized' });

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(401).json({ message: 'Not authorized' });
        return res.status(200).json(user); // Send raw user directly to match `/auth/me` local response
      } catch (e) {
        return res.status(401).json({ message: 'Token failed' });
      }
    }

    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export default allowCors(handler);
