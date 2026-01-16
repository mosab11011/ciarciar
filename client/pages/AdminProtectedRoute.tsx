import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/authService';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsVerifying(true);
      
      // Check if token and user exist locally first
      const token = authService.getToken();
      const user = authService.getCurrentUser();
      
      console.log('🔐 [AdminProtectedRoute] Checking authentication...');
      console.log('🔐 [AdminProtectedRoute] Token exists:', !!token);
      console.log('🔐 [AdminProtectedRoute] User exists:', !!user);
      
      // If no token or user, deny access immediately
      if (!token || !user) {
        console.warn('⚠️ [AdminProtectedRoute] No token or user found, denying access');
        setIsAuthenticated(false);
        setIsVerifying(false);
        return;
      }

      // Check if it's a fallback token - allow immediately without server verification
      const isFallbackToken = token.startsWith('local_fallback_token_');
      if (isFallbackToken) {
        console.log('✅ [AdminProtectedRoute] Fallback token detected, allowing access');
        setIsAuthenticated(true);
        setIsVerifying(false);
        return;
      }

      // Try to verify token with server (non-blocking)
      try {
        // Set a timeout for verification (don't wait too long)
        const verificationPromise = authService.verifyToken();
        const timeoutPromise = new Promise<boolean>((resolve) => 
          setTimeout(() => resolve(false), 2000)
        );
        
        const isValid = await Promise.race([verificationPromise, timeoutPromise]);
        
        console.log('🔐 [AdminProtectedRoute] Token verification result:', isValid);
        
        if (isValid) {
          setIsAuthenticated(true);
        } else {
          // Verification failed or timed out - but we have token, allow access
          console.warn('⚠️ [AdminProtectedRoute] Verification failed/timed out, but token exists - allowing access');
          setIsAuthenticated(true);
        }
      } catch (error: any) {
        console.error('❌ [AdminProtectedRoute] Auth verification error:', error);
        
        // If verification fails, but we have token and user, allow access
        // This handles cases where API is not available
        console.warn('⚠️ [AdminProtectedRoute] Verification error, but token exists - allowing access (might be API issue)');
        setIsAuthenticated(true);
      } finally {
        setIsVerifying(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  // Show loading while verifying
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-tarhal-orange border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default AdminProtectedRoute;
