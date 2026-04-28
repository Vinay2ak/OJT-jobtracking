import { useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell } from 'lucide-react';
import Logo from './Logo';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = useMemo(() => [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/applications', label: 'Applications', icon: '💼' },
    { path: '/tracking', label: 'Job Tracking System', icon: '📋' },
    { path: '/interviews', label: 'Upcoming Interviews', icon: '📅' },

    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ], []);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const outletContext = useMemo(
    () => ({ isModalOpen, setIsModalOpen }),
    [isModalOpen]
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col surface border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
          </div>
          <div />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const linkClasses = active
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-600/20 dark:text-blue-300'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/20';

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${linkClasses}`}
              >
                <span className={`flex-shrink-0 text-xl ${active ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-300'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && <span className={`truncate ${active ? 'text-blue-600 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="space-y-3 border-t border-gray-200 p-4">
          {/* User Profile */}
          <button
            onClick={() => navigate('/settings')}
            title="Go to account settings"
            className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0 text-left">
                <p className="truncate font-medium text-gray-900 dark:text-gray-100">{user?.name || 'Your Account'}</p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-300">{user?.email || 'No email set'}</p>
              </div>
            )}
          </button>
          
          {/* Logout Button */}
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 transition-colors hover:bg-red-50"
            >
              <span className="text-xl">🚪</span>
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 surface px-6">
          <div className="flex items-center gap-4">
            <div style={{ color: 'var(--text-primary)' }} className="flex items-center gap-6">
              <Link to="/" className="flex items-center overflow-hidden focus:outline-none outline-none target:outline-none active:outline-none rounded-lg">
                <Logo compact={false} className="h-9 w-auto max-w-[180px] hover:opacity-90 transition-opacity cursor-pointer" />
              </Link>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/notifications" 
              className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  );
}