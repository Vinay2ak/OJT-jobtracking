import { useState, useEffect } from 'react';
import { Save, User, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showSuccess, setShowSuccess] = useState(false);

  // Split name into first/last
  const nameParts = (user?.name || '').trim().split(' ');
  const defaultFirst = nameParts[0] || '';
  const defaultLast = nameParts.slice(1).join(' ') || '';

  const [firstName, setFirstName] = useState(defaultFirst);
  const [lastName, setLastName] = useState(defaultLast);
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [codingLanguages, setCodingLanguages] = useState(user?.codingLanguages || '');

  // Update fields when user object loads
  useEffect(() => {
    if (user) {
      const parts = (user.name || '').trim().split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setCodingLanguages(user.codingLanguages || '');

      // Load saved profile extras from localStorage
      const saved = localStorage.getItem('profile_extras');
      if (saved) {
        try {
          const extras = JSON.parse(saved);
          setPhone(extras.phone || '');
          setLocation(extras.location || '');
        } catch {}
      }
    }
  }, [user]);

  // Derive initials for avatar
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 
    (user?.email?.charAt(0).toUpperCase() ?? '?');

  const handleSave = () => {
    // Save extras (phone, location) to localStorage since backend doesn't have these fields
    localStorage.setItem('profile_extras', JSON.stringify({ phone, location }));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-200">
          <div className="h-2 w-2 rounded-full bg-green-600"></div>
          Settings saved successfully!
        </div>
      )}

      {/* Settings Container */}
      <div className="overflow-hidden rounded-lg border border-gray-200 surface dark:border-gray-700">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-transparent">
          <div className="flex gap-4 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-4 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Profile Information</h3>
                <div className="space-y-4">

                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-semibold text-white select-none">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {firstName} {lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
                    </div>
                  </div>

                  {/* Name fields */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="input w-full rounded-lg border px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="input w-full rounded-lg border px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  {/* Email - read-only since it's the login identifier */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email <span className="text-xs text-gray-400">(cannot change)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="input w-full rounded-lg border px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 dark:border-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Coding Languages */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Coding Languages
                    </label>
                    <input
                      type="text"
                      value={codingLanguages}
                      onChange={(e) => setCodingLanguages(e.target.value)}
                      className="input w-full rounded-lg border px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                      placeholder="e.g. JavaScript, Python, Java"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input w-full rounded-lg border px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="input w-full rounded-lg border px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                      placeholder="e.g. Bangalore, India"
                    />
                  </div>

                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="input w-full rounded-lg border px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="input w-full rounded-lg border px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="input w-full rounded-lg border px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user?.email || 'Current User'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active now</p>
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400">Current</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-end border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}