import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Admin Login
export const loginAdmin = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

// Get Current Admin
export const getCurrentAdmin = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Authentication failed"
      );
    }
  }
);

// Admin Logout
export const logoutAdmin = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Logout failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",

  initialState: {
    admin: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    initialized: false,
  },

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
        if (typeof window !== "undefined" && action.payload?.token) {
          localStorage.setItem("doctor_tracker_token", action.payload.token);
        }
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.initialized = true;
      })

      // Get Current Admin
      .addCase(getCurrentAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(getCurrentAdmin.rejected, (state) => {
        state.loading = false;
        state.admin = null;
        state.isAuthenticated = false;
        state.initialized = true;
        if (typeof window !== "undefined") {
          localStorage.removeItem("doctor_tracker_token");
        }
      })

      // Logout
      .addCase(logoutAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.loading = false;
        state.admin = null;
        state.isAuthenticated = false;
        state.error = null;
        state.initialized = true;
        if (typeof window !== "undefined") {
          localStorage.removeItem("doctor_tracker_token");
        }
      })
      .addCase(logoutAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (typeof window !== "undefined") {
          localStorage.removeItem("doctor_tracker_token");
        }
      });
  },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;
