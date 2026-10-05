import API from "@/lib/axios";

export const userService = {
  async getCurrentUser() {
    const response = await API.get("/users/me");
    return response.data;
  },
};
