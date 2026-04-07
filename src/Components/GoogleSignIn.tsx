import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { X } from 'lucide-react';

const mockAccounts = [
  { name: 'John Doe', email: 'john.doe@gmail.com', initial: 'J', color: 'bg-blue-600' },
  { name: 'Jane Smith', email: 'jane.smith@gmail.com', initial: 'J', color: 'bg-emerald-600' },
  { name: 'Demo User', email: 'demo@gmail.com', initial: 'D', color: 'bg-violet-600' },
];

export function GoogleSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleAccountClick = async (email: string, name: string) => {
    setIsLoading(true);
    const success = await loginWithGoogle(email, name);
    if (success) {
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-sans text-sm">
      <div className="w-full max-w-[448px] rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-[#202124] overflow-hidden relative">
        <button
           onClick={() => navigate('/login')}
           className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300 transition-colors"
           title="Cancel"
        >
           <X className="w-5 h-5" />
        </button>

        <div className="px-10 pt-12 pb-9 sm:px-12">
            <div className="flex justify-center mb-4">
               <svg className="w-[48px] h-[48px]" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            
            <h1 className="text-center text-2xl font-normal text-gray-900 dark:text-gray-100 pb-2">Choose an account</h1>
            <p className="text-center text-[15px] text-gray-600 dark:text-gray-300 mb-8">
              to continue to <span className="font-medium text-blue-600 dark:text-blue-400">JobTracker</span>
            </p>

            <div className="flex flex-col mb-4">
              {mockAccounts.map((account, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAccountClick(account.email, account.name)}
                  disabled={isLoading}
                  className="flex items-center gap-3 w-full border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-[#303134] py-3 pl-3 pr-4 rounded-lg transition-colors text-left opacity-100 disabled:opacity-50"
                >
                  <div className={`w-8 h-8 rounded-full ${account.color} text-white flex items-center justify-center font-medium text-sm flex-shrink-0`}>
                    {account.initial}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[14px] font-medium text-[#3c4043] dark:text-[#e8eaed] truncate">{account.name}</p>
                    <p className="text-[13px] text-[#5f6368] dark:text-[#9aa0a6] truncate">{account.email}</p>
                  </div>
                </button>
              ))}
              
              <button className="flex items-center gap-4 w-full border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#303134] mt-2 py-3 px-3 rounded-lg transition-colors text-left group">
                <div className="w-6 h-6 text-[#5f6368] dark:text-[#9aa0a6] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1 overflow-hidden">
                   <p className="text-[14px] font-medium text-[#3c4043] dark:text-[#e8eaed] transition-colors truncate">Use another account</p>
                </div>
              </button>
            </div>
            
            <div className="mt-8 pt-4 flex items-center justify-between text-xs text-[#5f6368] dark:text-[#9aa0a6]">
               <div className="flex gap-4">
                 <button className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 -ml-1.5 rounded transition-colors font-medium">Help</button>
                 <button className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded transition-colors font-medium">Privacy</button>
                 <button className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded transition-colors font-medium">Terms</button>
               </div>
               <button onClick={toggleTheme} className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 -mr-1.5 rounded transition-colors">
                 {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
               </button>
            </div>
        </div>
      </div>
    </div>
  );
}
