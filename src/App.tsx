import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import V1 from "./pages/v1";
import V2 from "./pages/v2";
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
            path="/v1"
            element={
              <ProtectedRoute>
                <V1 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/v2"
            element={
              <ProtectedRoute>
                <V2 />
              </ProtectedRoute>
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
