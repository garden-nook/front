// src/components/common/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Путь для редиректа, если не авторизован */
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectPath = '/login' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div>Загрузка...</div>

    );
  }

  // ❌ Не авторизован — редирект на логин
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // ✅ Авторизован — показываем контент
  return <>{children}</>;
};

export default ProtectedRoute;