import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadAvatar } from '../api/auth';
import './ProfilePage.css';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Nala',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Loki',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Pepper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Storm',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Garfield',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Thor',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zara',
];

function ProfilePage() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset input so the same file could be selected again if needed
    e.target.value = '';

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    setError('');
    try {
      const res = await uploadAvatar(formData);
      setUser(res.data);
      setSelectedAvatar(res.data.avatar);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('profile.nameRequired', 'Name is required'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await updateProfile({ name: name.trim(), avatar: selectedAvatar });
      setUser(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-page__bg" />

      <motion.div
        className="profile-page__card glass-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="profile-page__header">
          <div className="profile-page__avatar-preview">
            <img src={selectedAvatar} alt={name} />
          </div>
          <h2>{t('profile.title', 'My Profile')}</h2>
          <p className="profile-page__email">{user.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-page__form">
          {/* Name Input */}
          <div className="profile-field">
            <label>{t('profile.displayName', 'Display Name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile.enterName', 'Enter your name')}
            />
          </div>

          {/* Avatar Picker */}
          <div className="profile-field">
            <label>{t('profile.chooseAvatar', 'Choose Avatar')}</label>
            <div className="profile-page__avatars">
              {/* Custom Upload Button */}
              <label 
                className="profile-page__avatar-option profile-page__avatar-upload"
                title="Upload from device"
              >
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/gif, image/webp" 
                  onChange={handleFileUpload} 
                  hidden 
                />
                {uploading ? (
                  <span className="spinner spinner--small" />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )}
              </label>

              {AVATAR_OPTIONS.map((url) => (
                <button
                  key={url}
                  type="button"
                  className={`profile-page__avatar-option ${selectedAvatar === url ? 'active' : ''}`}
                  onClick={() => setSelectedAvatar(url)}
                >
                  <img src={url} alt="Avatar" />
                </button>
              ))}
            </div>
          </div>

          {error && <p className="profile-page__error">{error}</p>}

          {success && (
            <motion.p
              className="profile-page__success"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ✓ {t('profile.saved', 'Profile updated successfully!')}
            </motion.p>
          )}

          <button
            type="submit"
            className="profile-page__save btn-primary"
            disabled={saving}
          >
            {saving ? <span className="spinner" /> : t('profile.saveChanges', 'Save Changes')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default ProfilePage;
