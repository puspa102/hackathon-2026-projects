import { authStorage } from "@/services/storage";
import { API_BASE_URL } from "@/services/config";

export async function fetchProfile() {
  const token = await authStorage.getToken();
  const response = await fetch(`${API_BASE_URL}/accounts/profile/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
}

export async function updateProfile(data: Record<string, any>) {
  const token = await authStorage.getToken();
  const response = await fetch(`${API_BASE_URL}/accounts/profile/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || err.message || "Update failed");
  }
  return response.json();
}
