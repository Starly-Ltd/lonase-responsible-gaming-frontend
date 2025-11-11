import { createContext, useState, useContext, useEffect } from "react";
import { rgApi } from "../api/rgApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("rg_auth_token");
    const savedCustomer = localStorage.getItem("rg_customer");

    if (savedToken && savedCustomer) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedCustomer));
      } catch (e) {
        console.error("Failed to parse customer data:", e);
        localStorage.removeItem("rg_customer");
      }
    }

    setLoading(false);
  }, []);

  /**
   * Login with token and customer data
   * @param {string} authToken - JWT token
   * @param {Object} customer - Customer data
   */
  const login = (authToken, customer) => {
    localStorage.setItem("rg_auth_token", authToken);
    localStorage.setItem("rg_customer", JSON.stringify(customer));
    setToken(authToken);
    setUser(customer);
  };

  /**
   * Logout and clear all data
   */
  const logout = async () => {
    try {
      await rgApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("rg_auth_token");
      localStorage.removeItem("rg_customer");
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
