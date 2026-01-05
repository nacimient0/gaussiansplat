import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "", project: "ifactory" });
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const { setToken, token } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await api.get("/sanctum/csrf-cookie");
            const res = await api.post("/api/login", form);

            setToken(res.data.token, res.data.user.id, res.data.user.name);
            navigate("/secured");
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur inconnue");
            console.error("Erreur API :", err.response?.data || err.message);
        }
    };


    return (
        <div style={{
            width: "100%", height: "100vh", backgroundImage: "url('log-bg.jpg')", backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
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
                {token && (
                    <div style={{
                        backgroundColor: "rgba(245, 154, 0, 0.2)",
                        border: "1px solid #F59A00",
                        borderRadius: "6px",
                        padding: "12px",
                        width: "100%",
                        color: "#F59A00",
                        fontSize: "14px",
                        textAlign: "center"
                    }}>
                        ℹ️ Vous êtes déjà connecté
                    </div>
                )}
                <form style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }} onSubmit={handleSubmit}>
                    <input className="input-login"
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <div style={{ position: "relative", width: "100%" }}>
                        <input className="input-login"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Mot de passe"
                            value={form.password}
                            onChange={handleChange}
                            required
                            style={{ width: "100%", paddingRight: "40px", marginBottom: 0 }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: "absolute",
                                right: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: "0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                height: "20px",
                                width: "20px",
                            }}
                        >
                            {showPassword ? (
                                // Icône œil barré (masquer)
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            ) : (
                                // Icône œil (afficher)
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            )}
                        </button>
                    </div>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <button style={{ display: "flex", cursor: "pointer", backgroundColor: "#F59A00", padding: "10px 20px", borderRadius: "4px", textShadow: "0 0 5px black" }} type="submit">Se connecter</button>
                    </div>
                </form>
            </div>
        </div >
    );
}