import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Env from "./pages/Env";
import Ifactory from "./pages/Ifactory";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Connected from "./components/Connected";
import Test from "./pages/Test";
import Homair from "./pages/Homair";
import Pantin from "./pages/Pantin";
import Clignancourt from "./pages/Clignancourt";

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* <Connected /> */}
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
          <Route
            path="/test"
            element={
              <Test />
            }
          />
          <Route
            path="/homair"
            element={
              <Homair />
            }
          />
             <Route
            path="/pantin"
            element={
              <Pantin />
            }
          />
             <Route
            path="/clignancourt"
            element={
              <Clignancourt />
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
