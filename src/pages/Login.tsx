import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState<string | null>(null);
    const { setToken } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await api.post("/login", form);
            setToken(res.data.token, res.data.user.id, res.data.user.name);
            navigate("/v1"); // redirige vers la page v1 après connexion
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur inconnue");
            console.error("Erreur API :", err.response?.data || err.message);
        }
    };

    return (
        <div style={{ width: "100%", height: "100vh", backgroundImage: "url('log-bg.jpg')", backgroundSize: "cover", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
                display: "flex",
                padding: "30px",
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.85)",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                flexDirection: "column",
                alignItems: "center",
                width: "400px",
                minHeight: "300px",
                gap: "20px",
                justifyContent: "space-around"
            }}>
                <div style={{ fontSize: "22px", fontWeight: "bold", textDecoration: "underline" }}>Connexion</div>
                <img src="ifactory.svg" alt="Logo" style={{ display: "flex", backgroundColor: "white", height: '100px' }} />
                <form style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }} onSubmit={handleSubmit}>
                    <input className="input-login"
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input className="input-login"
                        type="password"
                        name="password"
                        placeholder="Mot de passe"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <button style={{ display: "flex", cursor: "pointer", backgroundColor: "#F59A00", padding: "10px 20px", borderRadius: "4px" }} type="submit">Se connecter</button>
                    </div>
                </form>
            </div>
        </div >
    );
}
