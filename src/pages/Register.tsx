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
            await api.get("/sanctum/csrf-cookie");

            const res = await api.post("/api/register", form);

            setToken(res.data.token, res.data.user.id, res.data.user.name);
            navigate("/"); // redirige après inscription
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur inconnue");
            console.error("Erreur API :", err.response?.data || err.message);
        }
    };

    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                backgroundImage: "url('log-bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-around",
                    backgroundColor: "rgba(0, 0, 0, 0.85)",
                    padding: "30px",
                    borderRadius: "8px",
                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                    color: "white",
                    width: "400px",
                    minHeight: "400px",
                    gap: "20px",
                }}
            >
                <div
                    style={{
                        fontSize: "22px",
                        fontWeight: "bold",
                        textDecoration: "underline",
                    }}
                >
                    Inscription
                </div>

                {/* <img
                    src="ifactory.svg"
                    alt="Logo"
                    style={{
                        display: "flex",
                        backgroundColor: "white",
                        height: "100px",
                        borderRadius: "5px",
                        padding: "10px",
                    }}
                /> */}

                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        width: "100%",
                    }}
                >
                    <input
                        className="input-login"
                        type="text"
                        name="name"
                        placeholder="Nom"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="input-login"
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="input-login"
                        type="password"
                        name="password"
                        placeholder="Mot de passe"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="input-login"
                        type="password"
                        name="password_confirmation"
                        placeholder="Confirmez le mot de passe"
                        value={form.password_confirmation}
                        onChange={handleChange}
                        required
                    />

                    {error && (
                        <p style={{ color: "red", fontSize: "14px", textAlign: "center" }}>
                            {error}
                        </p>
                    )}

                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <button style={{ display: "flex", cursor: "pointer", backgroundColor: "#F59A00", padding: "10px 20px", borderRadius: "4px", textShadow: "0 0 5px black" }} type="submit">S'inscrire</button>
                    </div>
                </form>

                <p style={{ fontSize: "14px", textAlign: "center" }}>
                    Déjà un compte ?{" "}
                    <a
                        href="/login"
                        style={{
                            color: "#F59A00",
                            textDecoration: "underline",
                            fontWeight: "bold",
                        }}
                    >
                        Se connecter
                    </a>
                </p>
            </div>
        </div>
    );
}
