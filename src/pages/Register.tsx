import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const [error, setError] = useState<string | null>(null);
    const { setToken } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (form.password !== form.password_confirmation) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        try {
            const res = await api.post("/register", form);
            setToken(res.data.token, res.data.user.id, res.data.user.name);
            navigate("/"); // redirige vers la page d'accueil
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur inconnue");
            console.error("Erreur API :", err.response?.data || err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="name"
                placeholder="Nom"
                value={form.name}
                onChange={handleChange}
                required
            />
            <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
            />
            <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange}
                required
            />
            <input
                type="password"
                name="password_confirmation"
                placeholder="Confirme"
                value={form.password_confirmation}
                onChange={handleChange}
                required
            />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button type="submit">Register</button>
        </form>
    );
}
