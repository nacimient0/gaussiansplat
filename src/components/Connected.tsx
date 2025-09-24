import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Connected() {
    const { token, userName, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="absolute right-0 bg-gray-800 text-white p-4 flex justify-between items-center">
            <nav>
                {token ? (
                    <div className="flex items-center gap-4">
                        <span>Connecté en tant que <b>{userName}</b></span>
                        <button
                            onClick={handleLogout}
                            className="cursor-pointer px-3 py-1 bg-red-500 rounded hover:bg-red-600"
                        >
                            Déconnexion
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </div>
                )}
            </nav>
        </header>
    );
}
