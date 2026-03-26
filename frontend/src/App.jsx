// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth & Admin
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import Forgot from "./pages/forgot.jsx";
import AdminLogin from "./pages/adminLogin.jsx";
import AdminDashboard from "./pages/adminDashboard.jsx";

// Pages
import SessionDetail from "./pages/SessionDetail";
import ProfessorDashboard from "./pages/professor_dashboard.jsx";
import ManageCourses from "./pages/ManageCourses.jsx";
import Projects from "./pages/projects.jsx";
import Forum from "./pages/forum.jsx";

import ProfessorProjects from "./pages/professor_project.jsx";
import CourseViewer from "./pages/CourseViewer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* PROTECTED ROUTES (No Layout Wrapper Here!) */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

       

        <Route
          path="/professor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["Professor"]}>
              <ProfessorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute allowedRoles={["Student", "Professor"]}>
              <CourseViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions/:sessionId"
          element={
            <ProtectedRoute allowedRoles={["Student", "Professor"]}>
              <SessionDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-courses"
          element={
            <ProtectedRoute allowedRoles={["Professor"]}>
              <ManageCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor-projects"
          element={
            <ProtectedRoute allowedRoles={["Professor"]}>
              <ProfessorProjects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={["Student", "Professor"]}>
              <Projects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/forum"
          element={
            <ProtectedRoute allowedRoles={["Student", "Professor"]}>
              <Forum />
            </ProtectedRoute>
          }
        />



        {/* 404 CATCH-ALL */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
