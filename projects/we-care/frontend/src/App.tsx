import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { RESET_PASSWORD_TOKEN_KEY } from "./lib/auth-api";
import { api } from "./lib/axios";
import { router } from "./routes";
import { useAuthStore } from "./stores/authStore";

export default function App() {
  useEffect(() => {
    const { token, setToken, setDoctor, setInitialized, clearAuth } =
      useAuthStore.getState();

    const hashParams = new URLSearchParams(
      window.location.hash.replace("#", ""),
    );
    const hashToken = hashParams.get("access_token");
    const hashType = hashParams.get("type");

    if (hashToken && hashType === "recovery") {
      sessionStorage.setItem(RESET_PASSWORD_TOKEN_KEY, hashToken);
      clearAuth();
      window.history.replaceState({}, "", "/reset-password");
      return;
    }

    if (!token) {
      setInitialized();
      return;
    }

    setToken(token);

    api
      .get("/api/v1/doctors/profile")
      .then((res) => {
        setDoctor(res.data);
        setInitialized();
      })
      .catch(() => {
        clearAuth();
      });
  }, []);

  return <RouterProvider router={router} />;
}
