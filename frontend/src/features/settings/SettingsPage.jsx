import { useState } from 'react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/useAuthStore';

const SettingsPage = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [profileData, setProfileData] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    contact: user?.contact || '',
    country: user?.country || '',
    currency: user?.currency || 'EUR',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  const handleProfileChange = (e) => {
    setProfileData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);

    try {
      const response = await api.put('auth/user/profile', profileData);

      // Update Zustand user
      setUser(response.data.user);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Profile update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordError('Passwords do not match');
    }

    setPasswordLoading(true);

    try {
      await api.put('auth/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Password change failed');
    } finally {
      setPasswordLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen bg-background w-full items-center justify-center">
      <div className="w-full max-w-4xl p-4 my-6 md:px-10 md:my-10 bg-card border border-border rounded-lg shadow-sm">
        {/* Section Header */}
        <div className="mt-6 border-b border-border pb-4">
          <p className="text-2xl 2xl:text-3xl font-semibold text-text">
            General Settings
          </p>
        </div>

        {/* Profile Info */}
        <div className="py-10">
          <p className="text-lg font-bold text-text">Profile Information</p>

          <div className="flex items-center gap-4 my-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold text-2xl">
              S
            </div>
            <p className="text-2xl font-semibold text-text">Sathiskumar</p>
          </div>

          {/* Profile Form */}
          <form className="space-y-6" onSubmit={handleProfileSubmit}>
            {/* Names */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-text/60">
                  First Name
                </label>
                <input
                  className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
                  name="firstname"
                  value={profileData.firstname}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-text/60">
                  Last Name
                </label>
                <input
                  className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
                  name="lastname"
                  value={profileData?.lastname}
                  onChange={handleProfileChange}
                />
              </div>
            </div>

            {/* Email  */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-text/60">
                  Email
                </label>
                <input
                  className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  disabled
                />
              </div>
              {/*  Contact */}
              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-text/60">
                  Contact
                </label>
                <input
                  className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
                  name="contact"
                  value={profileData.contact}
                  onChange={handleProfileChange}
                />
              </div>
            </div>

            {/* Country & Currency */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-text/60">
                  Country
                </label>
                <input
                  className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
                  name="country"
                  value={profileData.country}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-text/60">
                  Currency
                </label>
                <select
                  className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
                  disabled
                >
                  <option>{profileData.currency}</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="h-10 px-8 rounded-md bg-primary text-white font-medium cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="py-10 border-t border-border">
          <p className="text-xl font-bold text-text mb-1">Change Password</p>
          <span className="text-sm text-text/60">
            This will be used to log into your account and perform sensitive
            actions.
          </span>

          <form className="mt-6 space-y-6" onSubmit={handlePasswordSubmit}>
            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text/60">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text/60">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text/60">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="h-10 px-8 rounded-md bg-primary text-white font-medium cursor-pointer"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
