import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/services/AuthContext";
import AppSplashScreen from "@/components/AppSplashScreen";

export default function Index() {
  const router = useRouter();
  const { state } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (!splashDone || state.isLoading) return;

    if (state.userToken && state.user) {
      if (state.user.role === "doctor") {
        router.replace("/(doctor-tabs)");
      } else {
        router.replace("/(tabs)");
      }
    } else {
      router.replace("/(auth)/login");
    }
  }, [splashDone, state.isLoading, state.userToken, state.user]);

  return <AppSplashScreen onFinish={() => setSplashDone(true)} />;
}
