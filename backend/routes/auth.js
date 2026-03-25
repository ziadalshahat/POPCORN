const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

// @desc    Authenticate or Register user
// @route   POST /api/auth
// @access  Public
router.post('/', async (req, res) => {
  const { action, name, email, password } = req.body;

  try {
    if (action === 'register') {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ success: false, message: 'User already exists' });

      user = await User.create({ name, email, password });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

      return res.status(201).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
      });
    }

    if (action === 'login') {
      const user = await User.findOne({ email }).select('+password');
      if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const isMatch = await user.matchPassword(password);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

      return res.status(200).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid action' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get current logged-in user
// @route   GET /api/auth
// @access  Private
router.get('/', protect, async (req, res) => {
  res.status(200).json(req.user);
});

module.exports = router;