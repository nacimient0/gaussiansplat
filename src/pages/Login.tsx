import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const { setToken } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post("/login", form);
            setToken(res.data.token, res.data.user.id, res.data.user.name);
            navigate("/players");
        } catch (err: any) {
            console.error("Erreur API :", err.response?.data || err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="email" placeholder="Email" onChange={handleChange} />
            <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} />
            <button type="submit">Login</button>
        </form>
    );
}