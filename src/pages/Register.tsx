import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "" });
    const { setToken } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post("/register", form);
            setToken(res.data.token, res.data.user.id, res.data.user.name);
            navigate("/players");
        } catch (err: any) {
            console.error(err.response?.data);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Nom" onChange={handleChange} />
            <input name="email" placeholder="Email" onChange={handleChange} />
            <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} />
            <input type="password" name="password_confirmation" placeholder="Confirme" onChange={handleChange} />
            <button type="submit">Register</button>
        </form>
    );
}
