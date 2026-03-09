import { Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();

  // Visitor role gets different navbar
  if (user?.role?.toLowerCase() === 'visitor') {
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
              V
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                VisitorPass
              </h1>
              <p className="text-xs text-gray-500">Visitor Portal</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/my-pass" className="text-gray-700 hover:text-primary-600 font-medium transition">
              My Digital Pass
            </Link>
            <Link to="/profile" className="text-gray-700 hover:text-primary-600 font-medium transition">
              Profile
            </Link>
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-4 mt-4 pb-2 border-t pt-4">
          <Link to="/my-pass" className="text-gray-700 hover:text-primary-600 font-medium transition text-sm">
            My Digital Pass
          </Link>
          <Link to="/profile" className="text-gray-700 hover:text-primary-600 font-medium transition text-sm">
            Profile
          </Link>
        </nav>
      </header>
    );
  }

  // Admin, Security, Employee get standard navbar
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search visitors, passes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
