import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotFoundPage from '../../pages/NotFoundPage';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // If user is null or doesn't have the admin role, show the 404 page
  if (!user || user.role !== 'admin') {
    return <NotFoundPage />;
  }

  return children;
};

export default AdminRoute;
