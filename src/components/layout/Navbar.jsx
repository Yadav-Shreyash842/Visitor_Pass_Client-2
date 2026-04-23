import { Bell, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = ({ onMenuClick, hideSidebar }) => {
  const { user, logout } = useAuth();
  const role = user?.role?.toLowerCase();

  // Visitor navbar
  if (role === 'visitor') {
    return (
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <Link to="/my-pass" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
              V
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                VisitorPass
              </h1>
              <p className="text-xs text-gray-500">Visitor Portal</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-6">
            <Link to="/my-pass" className="text-xs sm:text-sm text-gray-700 hover:text-primary-600 font-medium transition px-2 py-1 rounded-lg hover:bg-primary-50">
              My Pass
            </Link>
            <Link to="/profile" className="text-xs sm:text-sm text-gray-700 hover:text-primary-600 font-medium transition px-2 py-1 rounded-lg hover:bg-primary-50">
              Profile
            </Link>
            <button
              onClick={logout}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </nav>
        </div>
      </header>
    );
  }

  // Admin / Security / Employee navbar
  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 flex-shrink-0">
      <div className="flex items-center justify-between gap-3">
        {/* Mobile hamburger — only when sidebar exists */}
        {!hideSidebar && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Logo on mobile (when sidebar hidden) */}
        <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-600 rounded-md flex items-center justify-center text-white font-bold text-xs">
            V
          </div>
          <span className="text-sm font-bold text-primary-600 hidden sm:block">VisitorPass</span>
        </div>

        {/* Spacer on desktop */}
        <div className="hidden lg:block flex-1" />

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Notifications */}
          <button className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full" />
          </button>

          {/* User info */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
