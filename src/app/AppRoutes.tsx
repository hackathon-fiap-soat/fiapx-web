import { Navigate, Route, Routes } from 'react-router-dom';
import { GuestRoute, ProtectedRoute } from '../features/auth/ProtectedRoute';
import { ChangePasswordPage } from '../pages/ChangePasswordPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { VideosPage } from '../pages/VideosPage';
import { AuthenticatedLayout } from './AuthenticatedLayout';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/videos" replace />} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/cadastro" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/conta/senha" element={<ChangePasswordPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/videos" replace />} />
    </Routes>
  );
}
