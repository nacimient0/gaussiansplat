import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Connected from "./components/Connected";
import Pantin from "./pages/Pantin";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Connected />
        <Routes>
          <Route
            path="/"
            element={
              <Pantin />
            }
          />
          <Route
            path="/secured"
            element={
              <ProtectedRoute>
                <Pantin />
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
