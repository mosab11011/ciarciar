import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supervisorManager } from '@/services/supervisorManager';

interface SupervisorProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

const SupervisorProtectedRoute: React.FC<SupervisorProtectedRouteProps> = ({ 
  children, 
  requiredPermission 
}) => {
  const location = useLocation();
  const isLoggedIn = supervisorManager.isLoggedIn();
  const supervisor = supervisorManager.getCurrentSupervisor();

  // إذا لم يكن مسجل دخول، توجيه لصفحة تسجيل الدخول
  if (!isLoggedIn || !supervisor) {
    return <Navigate to="/supervisor/login" state={{ from: location }} replace />;
  }

  // إذا لم يكن نشطاً، توجيه لصفحة تسجيل الدخول
  if (!supervisor.isActive) {
    supervisorManager.logoutSupervisor();
    return <Navigate to="/supervisor/login" state={{ from: location }} replace />;
  }

  // إذا كان هناك صلاحية مطلوبة، التحقق منها
  if (requiredPermission && !supervisorManager.hasPermission(requiredPermission as any)) {
    return <Navigate to="/supervisor/dashboard" replace />;
  }

  return <>{children}</>;
};

export default SupervisorProtectedRoute;
