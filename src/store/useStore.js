import { create } from "zustand";

const useStore = create((set, get) => ({
  backend_url: "http://localhost:3000",

  // Auth state
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("auth_token") || null,
  refreshToken: localStorage.getItem("refresh_token") || null,

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("auth_token", token);
    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);

    set({ user, token, refreshToken });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, token: null, refreshToken: null });
  },

  refreshAuth: async () => {
    const { backend_url, refreshToken } = get();
    const deviceId = localStorage.getItem("device_id");
    if (!refreshToken || !deviceId) return;

    try {
      const res = await fetch(`${backend_url}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ refreshToken, deviceId }),
      });

      if (!res.ok) throw new Error("Failed to refresh token");
      const data = await res.json();
      console.log("refresh data:", data);
      

      if (data.jwt_token) {
        localStorage.setItem("auth_token", data.accessToken);
        set({ token: data.accessToken });

        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refreshToken);
          set({ refreshToken: data.refreshToken });
        }

        console.log("Token refreshed");
        return data.jwt_token;
      }
    } catch (err) {
      console.error("Refresh token failed", err);
      get().logout();
    }
  },
}));

export default useStore;
