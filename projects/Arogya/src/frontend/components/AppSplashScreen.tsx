import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Animated } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { height, width } = Dimensions.get("window");

interface AppSplashScreenProps {
  onFinish: () => void;
}

export default function AppSplashScreen({ onFinish }: AppSplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const screenFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Step 1: logo appears with scale + fade
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Step 2: pulse the icon ring once
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Step 3: fade in title + subtitle
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Step 4: fill progress bar
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start(() => {
        // Step 5: fade out entire screen
        Animated.timing(screenFadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          onFinish();
        });
      });
    });
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenFadeAnim }]}>
      {/* Background circles for depth */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Animated icon */}
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View
            style={[styles.iconRing, { transform: [{ scale: pulseAnim }] }]}
          />
          <View style={styles.iconCircle}>
            <MaterialIcons name="health-and-safety" size={42} color="#ffffff" />
          </View>
        </Animated.View>

        {/* App name + tagline */}
        <Animated.View style={{ opacity: textFadeAnim, alignItems: "center" }}>
          <Text style={styles.appName}>Arogya</Text>
          <Text style={styles.tagline}>Your Health, Our Priority</Text>
        </Animated.View>
      </View>

      {/* Bottom section */}
      <Animated.View style={[styles.bottomSection, { opacity: textFadeAnim }]}>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: progressWidth }]}
          />
        </View>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f5fffe",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  // Decorative background circles
  bgCircle1: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: "#e8f8f5",
    top: -width * 0.3,
    right: -width * 0.2,
  },
  bgCircle2: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: "#eafaf7",
    bottom: -width * 0.2,
    left: -width * 0.2,
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },

  // Icon
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#16a08540",
    backgroundColor: "transparent",
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: "#16a085",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16a085",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },

  // Text
  appName: {
    fontSize: 36,
    fontWeight: "800",
    color: "#16a085",
    letterSpacing: 1,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 13,
    color: "#7f8c8d",
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  // Bottom
  bottomSection: {
    alignItems: "center",
    paddingBottom: 48,
    gap: 12,
  },
  progressTrack: {
    width: 120,
    height: 4,
    backgroundColor: "#d5ede9",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#16a085",
    borderRadius: 2,
  },
  versionText: {
    fontSize: 11,
    color: "#aab7b8",
    fontWeight: "400",
  },
});
