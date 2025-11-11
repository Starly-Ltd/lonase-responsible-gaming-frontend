import { createContext, useState, useContext, useEffect } from "react";
import { rgApi } from "../api/rgApi";

const DEFAULT_CONFIG = {
  currency: null,
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
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

    const savedConfig = localStorage.getItem("rg_config");
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...DEFAULT_CONFIG, ...parsedConfig });
      } catch (e) {
        console.error("Failed to parse config data:", e);
        localStorage.removeItem("rg_config");
      }
    }

    setLoading(false);
  }, []);

  const updateConfig = (updates = {}) => {
    setConfig((prev) => {
      const nextConfig = { ...DEFAULT_CONFIG, ...prev, ...updates };
      localStorage.setItem("rg_config", JSON.stringify(nextConfig));
      return nextConfig;
    });
  };

  /**
   * Login with token and customer data
   * @param {string} authToken - JWT token
   * @param {Object} customer - Customer data
   * @param {Object} configData - Additional configuration data
   */
  const login = (authToken, customer, configData = {}) => {
    localStorage.setItem("rg_auth_token", authToken);
    localStorage.setItem("rg_customer", JSON.stringify(customer));
    setToken(authToken);
    setUser(customer);
    updateConfig(configData);
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
      localStorage.removeItem("rg_config");
      setToken(null);
      setUser(null);
      setConfig(DEFAULT_CONFIG);
    }
  };

  const value = {
    user,
    token,
    config,
    currency: config?.currency ?? null,
    login,
    logout,
    loading,
    isAuthenticated: !!token,
    updateConfig,
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
