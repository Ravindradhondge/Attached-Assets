import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="customers">
        <Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
        <Label>Customers</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="entries">
        <Icon sf={{ default: "drop", selected: "drop.fill" }} />
        <Label>Entries</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="bills">
        <Icon sf={{ default: "doc.text", selected: "doc.text.fill" }} />
        <Label>Bills</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reports">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>Reports</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf={{ default: "gear", selected: "gear" }} />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#475569",
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : "#0F1623",
          borderTopWidth: 1,
          borderTopColor: "#2A3148",
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0F1623" }]} />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_500Medium",
          marginBottom: isWeb ? 10 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="house" tintColor={color} size={22} /> : <Feather name="home" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: "Customers",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="person.2" tintColor={color} size={22} /> : <Feather name="users" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="entries"
        options={{
          title: "Entries",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="drop" tintColor={color} size={22} /> : <Feather name="droplet" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          title: "Bills",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="doc.text" tintColor={color} size={22} /> : <Feather name="file-text" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="chart.bar" tintColor={color} size={22} /> : <Feather name="bar-chart-2" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="gear" tintColor={color} size={22} /> : <Feather name="settings" size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
