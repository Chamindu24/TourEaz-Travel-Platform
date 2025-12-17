// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to handle token refreshing
  const refreshToken = async () => {
    try {
      // Make sure credentials are included
      await axios.post('/auth/refresh-token', {}, {
        withCredentials: true
      });

      // If token refresh was successful, get user data
      const userData = await axios.get('/users/me', {
        withCredentials: true
      });

      setUser(userData.data);
      return true; // Return success
    } catch (error) {
      console.error("Token refresh failed:", error);
      setUser(null);

      // Only navigate to login if not already on login page
      if (!window.location.pathname.includes('/login')) {
        navigate('/login', { replace: true });
      }

      return false; // Return failure
    }
  };

  // Axios interceptor for 401 errors
  useEffect(() => {
    const id = axios.interceptors.response.use(
      res => res,
      async err => {
        const originalReq = err.config;

        if (err.response?.status === 401 && !originalReq._retry) {
          // Skip interceptor for initial auth checks
          if (originalReq.headers && originalReq.headers['X-Initial-Auth-Check']) {
            return Promise.reject(err);
          }

          // Only handle authentication-related 401s for specific protected endpoints
          const isProtectedEndpoint = originalReq.url.includes('/bookings') ||
                                     originalReq.url.includes('/profile') ||
                                     originalReq.url.includes('/admin') ||
                                     originalReq.url.includes('/settings') ||
                                     originalReq.url.includes('/users/me') ||
                                     (originalReq.url.includes('/auth/') && !originalReq.url.includes('/auth/login') && !originalReq.url.includes('/auth/register'));

          // If this is a refresh token call that failed, logout immediately
          if (originalReq.url.includes('/auth/refresh-token')) {
            setUser(null);
            // Only navigate to login if not already there and user was previously logged in
            if (!window.location.pathname.includes('/login') && user) {
              navigate('/login', { replace: true });
            }
            return Promise.reject(err);
          }

          // Only attempt token refresh for protected endpoints and if user was previously logged in
          if (isProtectedEndpoint && user) {
            originalReq._retry = true;
            try {
              const success = await refreshToken();
              if (success) {
                return axios(originalReq);
              } else {
                return Promise.reject(err);
              }
            } catch (error) {
              setUser(null);
              // Only navigate to login if not already there
              if (!window.location.pathname.includes('/login')) {
                navigate('/login', { replace: true });
              }
              return Promise.reject(err);
            }
          }
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, [navigate, user]);

  // Function to silently check authentication status
  const checkAuthStatus = async () => {
    try {
      // Use a direct axios call without interceptor interference for initial check
      const { data } = await axios.get('/users/me', { 
        withCredentials: true,
        // Add a custom header to identify this as an initial auth check
        headers: { 'X-Initial-Auth-Check': 'true' }
      });
      setUser(data);
      return true;
    } catch (err) {
      if (err.response?.status === 401) {
        // Try to refresh token silently, but don't redirect on failure
        try {
          await axios.post('/auth/refresh-token', {}, { 
            withCredentials: true,
            headers: { 'X-Initial-Auth-Check': 'true' }
          });
          const userData = await axios.get('/users/me', { 
            withCredentials: true,
            headers: { 'X-Initial-Auth-Check': 'true' }
          });
          setUser(userData.data);
          return true;
        } catch (refreshError) {
          // Silent failure - user is just not logged in
          setUser(null);
          return false;
        }
      } else {
        setUser(null);
        return false;
      }
    }
  };

  // Initial auth check - always check for existing session on mount
  // Note: httpOnly cookies cannot be read by JavaScript, so we must always attempt the check
  useEffect(() => {
    (async () => {
      try {
        // Always check auth status on mount since httpOnly cookies are not readable by JS
        await checkAuthStatus();
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Set up token refresh interval (every 45 minutes)
  useEffect(() => {
    const interval = setInterval(refreshToken, 24 * 60 * 60 * 1000); // 24 hours
    return () => clearInterval(interval);
  }, []);

  // Login function for use after registration
  const login = async (email, password) => {
    try {
      // Post to login endpoint
      await axios.post('/auth/login', { email, password }, { withCredentials: true });
      // Fetch user info
      const { data } = await axios.get('/users/me', { withCredentials: true });
      setUser(data);
      return { success: true };
    } catch (err) {
      setUser(null);
      return { success: false, error: err.response?.data?.msg || 'Login failed' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('/auth/logout', {}, { withCredentials: true });
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      // Even if logout fails on server, clear user locally
      setUser(null);
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};