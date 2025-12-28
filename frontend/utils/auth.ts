export const checkAuth = () => {
  // Read auth data only on the client to avoid SSR access to localStorage.
  if (typeof window === 'undefined') {
    return null;
  }
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return null;
  }
  
  return JSON.parse(user);
};

export const hasRole = (requiredRoles: string[]) => {
  // Role checks depend on localStorage, so keep this client-only.
  if (typeof window === 'undefined') {
    return false;
  }
  
  const user = checkAuth();
  if (!user) return false;
  return requiredRoles.includes(user.role);
};

// Redirect to login/unauthorized when the current role does not match.
export const requireRole = (requiredRoles: string[], redirectUrl: string = '/unauthorized') => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const user = checkAuth();
  
  if (!user) {
    window.location.href = '/login';
    return false;
  }
  
  if (!requiredRoles.includes(user.role)) {
    window.location.href = redirectUrl;
    return false;
  }
  
  return true;
};

// Centralized API error handling for auth/permission redirects.
export const handleApiError = (error: any, router?: any) => {
  if (error.response) {
    const status = error.response.status;
    
    switch (status) {
      case 401:
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (router) {
          router.push('/login');
        } else {
          window.location.href = '/login';
        }
        break;
      
      case 403:
        // Forbidden - redirect to unauthorized page
        if (router) {
          router.push('/unauthorized');
        } else {
          window.location.href = '/unauthorized';
        }
        break;
      
      case 404:
        // Not found
        if (router) {
          router.push('/not-found');
        }
        break;
      
      default:
        // Other errors - show error message
        console.error('API Error:', error.response.data?.message || error.message);
    }
  } else if (error.request) {
    // Network error
    console.error('Network Error:', error.message);
  } else {
    // Other errors
    console.error('Error:', error.message);
  }
};
