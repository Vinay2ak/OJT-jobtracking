import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function OtpVerification() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyOtp, clearPendingEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = (location.state as any)?.email || '';

  // Redirect back to login if no email in state
  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // take last digit
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const otpString = otp.join('');

    if (otpString.length < 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await verifyOtp(email, otpString);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }, [otp, email, verifyOtp, navigate]);

  const handleResend = () => {
    if (!canResend) return;
    setResendTimer(30);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
    // The backend sends OTP during login, so the user would need to re-login
    // For now we just reset the timer as the OTP was already sent
  };

  const handleBackToLogin = () => {
    clearPendingEmail();
    navigate('/login', { replace: true });
  };

  // Mask email for display
  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_: string, a: string, b: string, c: string) => a + '*'.repeat(b.length) + c)
    : '';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-4xl shadow-lg shadow-blue-500/25">
            🔐
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Verify Your Email
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We've sent a 6-digit verification code to
          </p>
          <p className="mt-1 font-semibold text-blue-600 dark:text-blue-400">
            {maskedEmail}
          </p>
        </div>

        {/* OTP Form Card */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/30 dark:border-red-700 p-4 animate-shake">
                <span className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-300">⚠️</span>
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* OTP Input Boxes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                Enter OTP Code
              </label>
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`h-14 w-12 rounded-xl border-2 text-center text-xl font-bold transition-all duration-200 focus:outline-none
                      ${digit
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400 shadow-sm shadow-blue-200 dark:shadow-blue-900/50'
                        : 'border-gray-300 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600'
                      }
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20
                      ${error ? 'border-red-400 dark:border-red-500' : ''}
                    `}
                    disabled={isLoading}
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading || otp.join('').length < 6}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 font-semibold text-white transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify & Sign In'
              )}
            </button>
          </form>

          {/* Resend & Back */}
          <div className="mt-6 space-y-3 text-center">
            {/* Resend OTP */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the code?{' '}
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Resend OTP
                </button>
              ) : (
                <span className="font-medium text-gray-500 dark:text-gray-500">
                  Resend in <span className="font-bold text-blue-600 dark:text-blue-400">{resendTimer}s</span>
                </span>
              )}
            </div>

            {/* Back to Login */}
            <button
              onClick={handleBackToLogin}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 dark:border-gray-700 dark:bg-gray-800 p-4">
          <p className="text-center text-sm text-blue-800 dark:text-blue-200">
            🔒 For your security, the OTP will expire in <strong>5 minutes</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
