import { request } from '../../shared/httpClient';

export interface AccessToken {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
}

export interface ResetTokenInfo {
  email_masked: string;
  expires_at: string;
}

/** Contratos de /auth/* (fiapx-docs/api/openapi.yaml). */
export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    request<RegisteredUser>('/auth/register', { method: 'POST', body }),
  login: (body: { email: string; password: string }) => request<AccessToken>('/auth/login', { method: 'POST', body }),
  forgotPassword: (email: string) => request<{ message: string }>('/auth/password/forgot', { method: 'POST', body: { email } }),
  verifyResetToken: (token: string) =>
    request<ResetTokenInfo>('/auth/password/reset/verify', { method: 'POST', body: { token } }),
  resetPassword: (body: { token: string; password: string }) =>
    request<AccessToken>('/auth/password/reset', { method: 'POST', body }),
  changePassword: (body: { current_password: string; new_password: string }) =>
    request<null>('/auth/password', { method: 'PUT', body, auth: true }),
};
