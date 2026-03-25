import connectDB from '../../utils/db.js';
import User from '../../models/User.js';
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

    // Verify Admin JWT
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminUser = await User.findById(decoded.id);
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    // DELETE /api/admin/user?id=...
    if (req.method === 'DELETE') {
      const userId = req.query.id;
      if (!userId) return res.status(400).json({ message: 'User ID required' });

      const userToDelete = await User.findById(userId);
      if (!userToDelete) return res.status(404).json({ message: 'User not found' });
      if (userToDelete.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin' });

      await User.findByIdAndDelete(userId);
      return res.json({ message: 'User deleted' });
    }

    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export default allowCors(handler);
