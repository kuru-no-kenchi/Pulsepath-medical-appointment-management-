import API from "@/lib/axios";
import { UserResponse, LoginRequest, RegisterRequest, ResetPasswordRequest } from "@/types/user";

export const authService = {
  async register(data: RegisterRequest): Promise<void> {
    await API.post("/auth/register", data);
  },

  async login(data: LoginRequest): Promise<UserResponse> {
    const response = await API.post("/auth/login", data);
    return response.data;
  },

  async refresh(): Promise<UserResponse> {
    const response = await API.post<UserResponse>("/token/refresh");
    return response.data;
  },

  async resetPassword(data : ResetPasswordRequest) {
    const response = await API.post("/auth/reset-password", data);
    return response.data;
  },

  async logout(): Promise<void> {
    await API.post("/auth/logout");
  },
};
