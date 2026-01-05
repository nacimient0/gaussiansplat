import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Connected from "./components/Connected";
import Homair from "./pages/Homair";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Connected />
        <Routes>
          <Route
            path="/"
            element={
              <Homair />
            }
          />
          <Route
            path="/secured"
            element={
              <ProtectedRoute>
                <Homair />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider >
  );
}

export default App;
