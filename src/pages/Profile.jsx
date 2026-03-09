import { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Shield, Save, Edit2, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validate passwords if changing
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setMessage({ type: 'error', text: 'Please enter your current password' });
        setLoading(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        setLoading(false);
        return;
      }
      if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
        setLoading(false);
        return;
      }
    }

    try {
      // Prepare update data
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      // Include password fields only if changing password
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/profile`,
        updateData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      // Update auth context with new user data
      if (updateUser) {
        updateUser(response.data.user);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setIsEditing(false);
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.name}</h2>
              <p className="text-sm text-gray-600 mb-4">{user?.email}</p>
              
              {/* Role Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                <span className="capitalize">{user?.role}</span>
              </div>
            </div>

            {/* Account Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      required
                    />
                  </div>

                  {/* Role (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Briefcase className="w-4 h-4 inline mr-2" />
                      Role
                    </label>
                    <input
                      type="text"
                      value={user?.role || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 capitalize"
                    />
                    <p className="text-xs text-gray-500 mt-1">Role cannot be changed. Contact admin for role updates.</p>
                  </div>
                </div>
              </div>

              {/* Change Password Section - Only show when editing */}
              {isEditing && (
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h4>
                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="Enter current password"
                        disabled={loading}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave blank if you don't want to change password</p>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        disabled={loading}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        disabled={loading}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons - Only show when editing */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-gray-400"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition disabled:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
