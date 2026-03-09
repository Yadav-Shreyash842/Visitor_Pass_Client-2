import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Visitors from './pages/Visitors';
import Passes from './pages/Passes';
import CheckLogs from './pages/CheckLogs';
import QRScanner from './pages/QRScanner';
import Reports from './pages/Reports';
import MyPass from './pages/MyPass';
import Profile from './pages/Profile';
import RegisterVisitor from './pages/RegisterVisitor';
import CreateVisitor from './pages/CreateVisitor';

// Layout
import Layout from './components/layout/Layout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role?.toLowerCase() === 'visitor') {
    return <Navigate to="/my-pass" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <RoleBasedRedirect /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <RoleBasedRedirect /> : <Register />} 
        />
        <Route 
          path="/register-visitor" 
          element={isAuthenticated ? <RoleBasedRedirect /> : <RegisterVisitor />} 
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RoleBasedRedirect />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="visitors" element={<Visitors />} />
          <Route path="create-visitor" element={<CreateVisitor />} />
          <Route path="passes" element={<Passes />} />
          <Route path="checklogs" element={<CheckLogs />} />
          <Route path="scanner" element={<QRScanner />} />
          <Route path="reports" element={<Reports />} />
          <Route path="my-pass" element={<MyPass />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
