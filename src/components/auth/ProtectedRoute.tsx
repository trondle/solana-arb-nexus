
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'trader' | 'viewer';
}

const ProtectedRoute = ({ children, requiredRole = 'viewer' }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role hierarchy: admin > trader > viewer
  const roleHierarchy = { admin: 3, trader: 2, viewer: 1 };
  const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole];

  if (userRoleLevel < requiredRoleLevel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
