import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Env from "./pages/Env";
import Ifactory from "./pages/Ifactory";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Connected from "./components/Connected";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Connected />
        <Routes>
          <Route
            path="/"
            element={
              <Ifactory />
            }
          />
          <Route
            path="/secured"
            element={
              <ProtectedRoute>
                <Ifactory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/environnement"
            element={
              <Env />
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider >
  );
}

export default App;
