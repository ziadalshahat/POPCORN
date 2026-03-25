import mongoose from 'mongoose';

const LoginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ip: String,
  userAgent: String,
}, { timestamps: true });

export default mongoose.models.LoginHistory || mongoose.model('LoginHistory', LoginHistorySchema);
