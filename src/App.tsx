import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Test from "./pages/Test";

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* <Connected /> */}
        <Routes>
          <Route
            path="/"
            element={
              <Test />
            }
          />
          <Route
            path="/secured"
            element={
              <ProtectedRoute>
                <Test />
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
