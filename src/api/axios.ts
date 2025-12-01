import axios from "axios";

const api = axios.create({
    baseURL: "https://api.ifactory.asylum.fr",
    withCredentials: true, // 🔥 essentiel pour les cookies cross-domain
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Ajout de l'intercepteur pour le Bearer token (utile si tu enregistres un token Sanctum)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
