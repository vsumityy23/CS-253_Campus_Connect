// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  // If no token, kick them back to login
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    // If roles are specified, check if the user has permission
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect based on their actual role if they try to access the wrong dashboard
      return (
        <Navigate
          to={
            user.role === "Professor"
              ? "/professor-dashboard"
              : "/student-dashboard"
          }
          replace
        />
      );
    }

    return children;
  } catch (error) {
    // If local storage data is corrupted, clear it and force login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
