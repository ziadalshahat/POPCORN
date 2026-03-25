import connectDB from '../utils/db.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  return await fn(req, res);
};

const protect = async (req, res) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id).select('-password');
  } catch (e) {
    return null;
  }
};

async function handler(req, res) {
  try {
    await connectDB();
    const user = await protect(req, res);
    
    if (!user) return res.status(401).json({ message: 'Not authorized, token failed' });

    if (req.method === 'GET') {
      return res.status(200).json(user.watchlist);
    }

    if (req.method === 'POST') {
      const item = req.body;
      if (!user.watchlist.find((w) => w.id === item.id)) {
        user.watchlist.push(item);
        await user.save();
      }
      return res.status(201).json(user.watchlist);
    }

    if (req.method === 'DELETE') {
      // We expect the ID to be passed as a query param ?id=123
      const { id } = req.query;
      user.watchlist = user.watchlist.filter((w) => w.id !== Number(id));
      await user.save();
      return res.status(200).json(user.watchlist);
    }

    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export default allowCors(handler);
