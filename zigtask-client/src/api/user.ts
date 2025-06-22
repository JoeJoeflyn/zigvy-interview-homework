import { api } from "@/lib/api";

// action to get user info
export async function getUserInfo() {
    return api.get<{ id: string; email: string }>("/user/me");
  }
