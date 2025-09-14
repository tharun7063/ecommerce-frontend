import { create } from "zustand";

const useStore = create((set) => ({
    backend_url: "http://localhost:3000",

    // Auth state
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("auth_token") || null,

    setAuth: (user, token) => {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("auth_token", token);
        set({ user, token });
    },

    logout: () => {
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        set({ user: null, token: null });
    },
}));

export default useStore;

