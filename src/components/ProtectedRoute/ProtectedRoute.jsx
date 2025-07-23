import { Navigate } from "react-router-dom";

function ProtectedRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/profile" replace />;
}

export default ProtectedRoute;