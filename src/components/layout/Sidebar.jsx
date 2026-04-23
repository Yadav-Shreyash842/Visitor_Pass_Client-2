import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, ClipboardList,
  QrCode, LogOut, X, ChevronLeft, ChevronRight,
  FileText, Plus, Shield, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ALL_ITEMS = [
  { path: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard',      roles: ['admin', 'security'] },
  { path: '/visitors',      icon: Users,           label: 'Visitor Log',    roles: ['admin', 'security', 'employee'] },
  { path: '/create-visitor',icon: Plus,            label: 'Create Visitor', roles: ['admin', 'security', 'employee'] },
  { path: '/scanner',       icon: QrCode,          label: 'QR Scanner',     roles: ['admin', 'security'] },
  { path: '/passes',        icon: CreditCard,      label: 'Passes',         roles: ['admin', 'security'] },
  { path: '/checklogs',     icon: ClipboardList,   label: 'Check Logs',     roles: ['admin', 'security'] },
  { path: '/reports',       icon: FileText,        label: 'Reports',        roles: ['admin', 'security'] },
  { path: '/events',        icon: Shield,          label: 'Special Events', roles: ['admin'] },
  { path: '/profile',       icon: User,            label: 'Profile',        roles: ['admin', 'security', 'employee'] },
];

const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const role = user?.role?.toLowerCase();
  const menuItems = ALL_ITEMS.filter(i => i.roles.includes(role));

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          bg-white border-r border-gray-200
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-[70px]' : 'lg:w-64'}
          w-64
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 flex-shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                V
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm leading-tight truncate">VisitorPass</p>
                <p className="text-xs text-gray-400 truncate">Management System</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto">
              V
            </div>
          )}
          {/* Mobile close */}
          <button onClick={onMobileClose} className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-16 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-50 shadow-md z-10"
        >
          {isCollapsed
            ? <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            : <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
          }
        </button>

        {/* User info */}
        <div className={`px-3 py-3 border-b border-gray-100 flex-shrink-0 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center gap-2 ${isCollapsed ? '' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              title={isCollapsed ? item.label : ''}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150
                ${isActive
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
                ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              <item.icon className="w-4.5 h-4.5 w-[18px] h-[18px] flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={logout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition text-sm ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
