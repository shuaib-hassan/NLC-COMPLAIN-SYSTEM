import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AIChatbot from "./components/AIChatbot";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SubmitComplaint from "./pages/SubmitComplaint";
import AnonymousComplaint from "./pages/AnonymousComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import MyComplaints from "./pages/MyComplaints";
import AdminDashboard from "./pages/AdminDashboard";
import AdminComplaints from "./pages/AdminComplaints";
import AdminComplaintDetail from "./pages/AdminComplaintDetail";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/track" element={<TrackComplaint />} />
              <Route path="/anonymous" element={<AnonymousComplaint />} />

              <Route
                path="/submit"
                element={
                  <ProtectedRoute>
                    <SubmitComplaint />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-complaints"
                element={
                  <ProtectedRoute>
                    <MyComplaints />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <AdminRoute>
                    <AdminComplaints />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/complaints/:id"
                element={
                  <AdminRoute>
                    <AdminComplaintDetail />
                  </AdminRoute>
                }
              />
            </Routes>
          </main>
          <AIChatbot />
          <Analytics />
          <SpeedInsights />
          <footer className="bg-white border-t border-slate-200 py-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="flex justify-center mb-6">
                <img
                  src="/LOGO.png"
                  alt="NLC Logo"
                  className="h-20 w-20 object-contain"
                />
              </div>
              <p className="text-slate-900 font-bold mb-2">
                National Land Commission
              </p>
              <p className="text-slate-500 text-sm">
                &copy; {new Date().getFullYear()} Complaint Management System.
                All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
