import { useLayoutEffect, useState } from "react";
import { AuthContext } from "./authContext.jsx";
import axios from "axios";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount - try to restore from refresh token cookie
  useLayoutEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/auth/refresh`);
        setToken(data.accessToken);
        setUser(data.user);
      } catch {
        // No active session or refresh token expired - that's ok
        console.log('No active session found');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useLayoutEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  // Interceptor to handle 401 and refresh the token
  useLayoutEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
          // If it's 401 and not an auth endpoint, try to refresh the token
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/api/auth/')
        ) {
          originalRequest._retry = true;
          
          try {
            const { data } = await axios.get(`${API_BASE}/api/auth/refresh`);
            setToken(data.accessToken);
            setUser(data.user);
            
            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // If the refresh fails (session expired), clear everything and show toast
            setToken(null);
            setUser(null);
            toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_BASE}/api/auth/login`, {
      email,
      password,
    });
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const googleLogin = async () => {
    const { data } = await axios.post(`${API_BASE}/api/auth/google`);
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await axios.post(`${API_BASE}/api/auth/signup`, formData);
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/api/auth/logout`);
    } catch (err) {
      console.warn("Logout failed:", err);
    }
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    googleLogin,
    register,
    logout,
  };

  // Show loading state while checking for existing session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}</AuthContext.Provider>
  );
};
