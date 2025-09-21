import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import Home from "./pages/Dashboard/Home";
import Income from "./pages/Dashboard/Income";
import Expense from "./pages/Dashboard/Expense";
import UserProvider, { UserContext } from "./context/useContext";
import { Toaster } from "react-hot-toast";
import VerifyOtp from "./pages/Auth/VerifyOtp";
import RequestOtpPage from "./pages/forgot-password/request";
import ResetPasswordPage from "./pages/forgot-password/ResetPasswordPage";
import VerifyOtpPage from "./pages/forgot-password/VerifyOtpPage";
import Cookies from "js-cookie"; // ✅ for reading cookies

const App = () => {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<Root />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              }
            />
            <Route
              path="/verify-otp"
              element={
                <PublicRoute>
                  <VerifyOtp />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password/request"
              element={
                <PublicRoute>
                  <RequestOtpPage />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password/verify"
              element={
                <PublicRoute>
                  <VerifyOtpPage />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password/reset"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/income"
              element={
                <ProtectedRoute>
                  <Income />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expense"
              element={
                <ProtectedRoute>
                  <Expense />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </div>
      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </UserProvider>
  );
};

export default App;

// ✅ Root redirection based on cookie + context
const Root = () => {
  const { user } = useContext(UserContext);
  const accessToken = Cookies.get("accessToken"); // from cookie
  const isAuthenticated = !!user || !!accessToken;

  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

// ✅ ProtectedRoute: check cookie before allowing access
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);
  const accessToken = Cookies.get("accessToken");

  const isAuthenticated = !!user || !!accessToken;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ✅ PublicRoute: if cookie exists, redirect to dashboard
const PublicRoute = ({ children }) => {
  const { user } = useContext(UserContext);
  const accessToken = Cookies.get("accessToken");
  const location = window.location.pathname;

  const isAuthenticated = !!user || !!accessToken;

  // ✅ Special case: allow verify-otp even if authenticated
  if (location === "/verify-otp") {
    return children;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

