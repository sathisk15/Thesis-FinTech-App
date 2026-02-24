import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = () => {
  const isAuth = isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
