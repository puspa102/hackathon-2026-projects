import { Tabs } from "expo-router";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { HapticTab } from "@/components/haptic-tab";

export default function PatientTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2A7B88",
        tabBarInactiveTintColor: "#95a5a6",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#ecf0f1",
          elevation: 0,
          shadowOpacity: 0,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="description" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          title: "Doctors",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="medical-services" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="check-in"
        options={{
          href: null,
          title: "Check-in",
        }}
      />
      <Tabs.Screen
        name="risk-result"
        options={{
          href: null,
          title: "Risk Result",
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
          title: "Explore",
        }}
      />
    </Tabs>
  );
}
