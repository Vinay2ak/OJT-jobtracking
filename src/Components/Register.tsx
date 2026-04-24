import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codingLanguages, setCodingLanguages] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    const success = await register(name, email, password, codingLanguages);
    
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Registration failed: Email already exists or backend is not connected');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-3xl">
            💼
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">Register</h1>
          <p className="text-gray-600">Start tracking your job applications today</p>
        </div>

        {/* Register Form */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/30 dark:border-red-700 p-4">
                <span className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-300">⚠️</span>
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 py-3 pl-10 pr-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 py-3 pl-10 pr-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Coding Languages Field */}
            <div>
              <label htmlFor="codingLanguages" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Coding Languages
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">💻</span>
                <input
                  type="text"
                  id="codingLanguages"
                  value={codingLanguages}
                  onChange={(e) => setCodingLanguages(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 py-3 pl-10 pr-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. JavaScript, Python, C++"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 py-3 px-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your password"
              />
              <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 py-3 px-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Confirm your password"
              />
            </div>

            {/* Terms & Conditions */}
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-purple-600 hover:text-purple-700">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-purple-600 hover:text-purple-700">
                  Privacy Policy
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
          <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-gray-200 bg-white dark:bg-gray-700 dark:border-gray-600 p-3 text-center">
            <div className="mx-auto mb-1 text-2xl">✅</div>
            <p className="text-xs text-gray-600">Track Applications</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white dark:bg-gray-700 dark:border-gray-600 p-3 text-center">
            <div className="mx-auto mb-1 text-2xl">✅</div>
            <p className="text-xs text-gray-600">Schedule Interviews</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white dark:bg-gray-700 dark:border-gray-600 p-3 text-center">
            <div className="mx-auto mb-1 text-2xl">✅</div>
            <p className="text-xs text-gray-600">Analytics Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}