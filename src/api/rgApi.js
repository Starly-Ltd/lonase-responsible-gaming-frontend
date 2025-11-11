import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("rg_auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("rg_auth_token");
      localStorage.removeItem("rg_customer");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export const rgApi = {
  sendOtp: (mobileNumber) =>
    apiClient.post("/auth/send-otp", { mobile_number: mobileNumber }),

  verifyOtp: (mobileNumber, otp) =>
    apiClient.post("/auth/verify-otp", {
      mobile_number: mobileNumber,
      otp,
    }),

  setLimits: (controls) =>
    apiClient.post("/responsible-gaming/set-limits", controls),

  getMyLimits: () => apiClient.get("/responsible-gaming/my-limits"),

  clearLimits: () => apiClient.delete("/responsible-gaming/clear-limits"),

  logout: () => apiClient.post("/responsible-gaming/logout"),
};

export default apiClient;
