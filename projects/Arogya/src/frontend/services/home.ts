import { authStorage } from "@/services/storage";
import { API_BASE_URL } from "@/services/config";

export async function fetchDashboard() {
  const token = await authStorage.getToken();
  const response = await fetch(`${API_BASE_URL}/accounts/dashboard/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Failed to fetch dashboard");
  }
  return response.json();
}
