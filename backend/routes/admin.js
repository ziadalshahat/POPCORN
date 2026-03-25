const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get login history
// @route   GET /api/admin/logins
// @access  Private/Admin
router.get('/logins', protect, isAdmin, async (req, res) => {
  try {
    const logins = await LoginHistory.find({})
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(logins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalLogins = await LoginHistory.countDocuments({});
    
    // Active users in last 24h
    const activeUsersDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await LoginHistory.distinct('userId', {
      createdAt: { $gte: activeUsersDate }
    }).then(users => users.length);

    res.json({
      totalUsers,
      totalLogins,
      activeUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
router.delete('/user/:id', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
