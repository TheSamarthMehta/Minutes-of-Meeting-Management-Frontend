import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import SignupPage from "../features/auth/SignupPage";
import ProtectedRoute from "../features/auth/ProtectedRoute";
import DashboardPage from "../features/dashboard/DashboardPage";
import ProfilePage from "../features/profile/ProfilePage";
import MasterConfigPage from "../features/masterConfig/MasterConfigPage";
import StaffManagementPage from "../features/staff/StaffManagementPage";
import MeetingManagerPage from "../features/meetings/MeetingManagerPage";
import AttendancePage from "../features/attendance/AttendancePage";
import DocumentsManagerPage from "../features/documents/DocumentsManagerPage";
import ReportsPage from "../features/reports/ReportsPage";
import MainLayout from "../layouts/MainLayout";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<MainLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/master-config"
          element={
            <ProtectedRoute requiredRoles={['Admin', 'Convener']}>
              <MasterConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <StaffManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meetings"
          element={
            <ProtectedRoute requiredRoles={['Admin', 'Convener']}>
              <MeetingManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute requiredRoles={['Admin', 'Convener']}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <DocumentsManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredRoles={['Admin', 'Convener']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        
      </Route>
    </Routes>
  );
};

export default AppRoutes;
