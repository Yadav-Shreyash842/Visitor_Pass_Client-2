import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  ClipboardList, 
  QrCode,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings,
  Plus,
  Shield,
  UserPlus,
  User
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  // Role-based menu items
  const getMenuItems = () => {
    const role = user?.role?.toLowerCase();
    
    const allItems = [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'security'] },
      { path: '/visitors', icon: Users, label: 'Visitor Log', roles: ['admin', 'security', 'employee'] },
      { path: '/create-visitor', icon: Plus, label: 'Create Visitor', roles: ['admin', 'security', 'employee'] },
      { path: '/scanner', icon: QrCode, label: 'QR Scanner', roles: ['admin', 'security'] },
      { path: '/passes', icon: CreditCard, label: 'Passes', roles: ['admin', 'security'] },
      { path: '/checklogs', icon: ClipboardList, label: 'Check Logs', roles: ['admin', 'security'] },
      { path: '/reports', icon: FileText, label: 'Reports', roles: ['admin', 'security'] },
      { path: '/history', icon: Calendar, label: 'History', roles: ['admin', 'security'] },
      { path: '/audit', icon: Shield, label: 'Audit Logs', roles: ['admin'] },
      { path: '/register-user', icon: UserPlus, label: 'Register User', roles: ['admin'] },
      { path: '/profile', icon: User, label: 'Profile', roles: ['admin', 'security', 'employee'] },
    ];

    return allItems.filter(item => item.roles.includes(role));
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            {!isCollapsed ? (
              <>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  VisitorPass
                </h1>
                <p className="text-sm text-gray-500 mt-1">Management System</p>
              </>
            ) : (
              <div className="flex justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  V
                </div>
              </div>
            )}
          </div>

          {/* Collapse Toggle (Desktop only) */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-50 transition-colors shadow-md"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {/* User Info */}
          {!isCollapsed ? (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-gray-200 flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? item.label : ''}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className={`flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title={isCollapsed ? 'Logout' : ''}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
