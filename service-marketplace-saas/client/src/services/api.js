import axios from "axios";

/* ================= BASE INSTANCE ================= */

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

/* ================= REQUEST INTERCEPTOR ================= */

API.interceptors.request.use(
  (req) => {
    try {
      // ✅ GET TOKEN CORRECTLY
      const token = localStorage.getItem("token");

      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }

    } catch (err) {
      console.log("Token error:", err);
    }

    return req;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */

API.interceptors.response.use(
  (response) => response,
  (error) => {

    // ✅ Auto logout if token invalid/expired
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;