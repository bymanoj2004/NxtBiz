import { create } from "zustand";
import { api } from "../api/http";

const savedUser = localStorage.getItem("nxtbiz_user");
const savedToken = localStorage.getItem("nxtbiz_access_token");

export const useAuthStore = create((set) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  accessToken: savedToken || "",
  async login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("nxtbiz_user", JSON.stringify(data.user));
    localStorage.setItem("nxtbiz_access_token", data.accessToken);
    set({ user: data.user, accessToken: data.accessToken });
  },
  async register(payload) {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("nxtbiz_user", JSON.stringify(data.user));
    localStorage.setItem("nxtbiz_access_token", data.accessToken);
    set({ user: data.user, accessToken: data.accessToken });
  },
  async logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("nxtbiz_user");
      localStorage.removeItem("nxtbiz_access_token");
      set({ user: null, accessToken: "" });
    }
  }
}));
