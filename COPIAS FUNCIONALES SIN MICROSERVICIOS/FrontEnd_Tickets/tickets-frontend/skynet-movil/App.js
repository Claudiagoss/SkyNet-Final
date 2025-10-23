import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { registerRootComponent } from "expo";

// 🧩 Pantallas
import LoginScreen from "./src/screens/LoginScreen";
import TecnicoDashboard from "./src/screens/TecnicoDashboard";
import HistorialVisitas from "./src/screens/HistorialVisitas";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 🔹 Tabs (Dashboard + Historial)
function TecnicoTabs() {
  return (
    <Tab.Navigator
      initialRouteName="MisVisitas"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0a0f13",
          borderTopColor: "#1c1f26",
          height: 70,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: "#00d9ff",
        tabBarInactiveTintColor: "#777",
        tabBarIcon: ({ color }) => {
          let iconName;
          if (route.name === "MisVisitas") iconName = "briefcase";
          else if (route.name === "Historial") iconName = "time";
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="MisVisitas"
        component={TecnicoDashboard}
        options={{ title: "Mis Visitas" }}
      />
      <Tab.Screen
        name="Historial"
        component={HistorialVisitas}
        options={{ title: "Historial" }}
      />
    </Tab.Navigator>
  );
}

// 🔹 Stack principal (Login → Tabs)
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="TecnicoTabs" component={TecnicoTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

registerRootComponent(App);
export default App;
