import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please add a name'] },
    email: { type: String, required: [true, 'Please add an email'], unique: true },
    password: { type: String, required: [true, 'Please add a password'], minlength: 6, select: false },
    avatar: { type: String, default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    watchlist: [{
      id: Number,
      media_type: String,
      title: String,
      name: String,
      poster_path: String,
      vote_average: Number,
      release_date: String,
      first_air_date: String,
    }],
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
