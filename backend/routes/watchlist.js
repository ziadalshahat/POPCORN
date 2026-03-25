const express = require('express');
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

// @desc    Get user watchlist
// @route   GET /api/watchlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add item to watchlist
// @route   POST /api/watchlist
// @access  Private
router.post('/', protect, async (req, res) => {
  const { id, title, poster_path, media_type } = req.body;

  try {
    const user = await User.findById(req.user._id);

    // Check if already in watchlist
    const exists = user.watchlist.some((item) => item.id === id);
    if (exists) {
      return res.status(400).json({ message: 'Already in watchlist' });
    }

    user.watchlist.push({ id, title, poster_path, media_type });
    await user.save();

    res.status(201).json(user.watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Remove item from watchlist
// @route   DELETE /api/watchlist?id=
// @access  Private
router.delete('/', protect, async (req, res) => {
  const itemId = parseInt(req.query.id);

  try {
    const user = await User.findById(req.user._id);
    user.watchlist = user.watchlist.filter((item) => item.id !== itemId);
    await user.save();

    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
