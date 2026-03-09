import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  
  // Check if user is a visitor
  const isVisitor = user?.role?.toLowerCase() === 'visitor';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - Hide for visitors */}
      {!isVisitor && (
        <Sidebar 
          isCollapsed={isCollapsed} 
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
