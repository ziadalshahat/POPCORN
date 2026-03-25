const mongoose = require('mongoose');

const LoginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically provides 'createdAt' and 'updatedAt' (acts as date)
  }
);

module.exports = mongoose.model('LoginHistory', LoginHistorySchema);
