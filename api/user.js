import connectDB from '../utils/db.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*'); 
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

    if (req.method === 'PUT') {
      const { name, avatar } = req.body;
      if (name) user.name = name;
      if (avatar) user.avatar = avatar;
      const updated = await user.save();
      return res.status(200).json({
        id: updated._id,
        name: updated.name,
        email: updated.email,
        avatar: updated.avatar,
      });
    }

    if (req.method === 'POST') {
      // NOTE FOR VERCEL: Vercel Serverless does not support uploading files to a local filesystem
      // natively like Multer. To support Image Uploads, you must integrate specialized 
      // cloud storage like AWS S3, Cloudinary, or Vercel Blob. 
      // This endpoint is left as a stub to prevent 404s, but will return an error 
      // prompting the use of a third-party bucket.
      return res.status(400).json({ 
        message: 'File uploads are not natively supported on Vercel Serverless Functions. Please use a cloud service like Cloudinary or Vercel Blob.' 
      });
    }

    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export default allowCors(handler);
