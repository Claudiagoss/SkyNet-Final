import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser } from "../api";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧩 LOGIN
  const handleLogin = async () => {
    try {
      setLoading(true);
      const data = await loginUser({ username, password });

      console.log("🔐 Respuesta del backend:", data);
      const { token, usuarioId, usuario, rolId } = data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({ usuarioId, username: usuario, rolId })
      );

      Alert.alert("✅ Login exitoso");
      navigation.replace("TecnicoTabs");
    } catch (error) {
      console.error("❌ Error en login:", error);

      if (error.code === "ECONNABORTED") {
        Alert.alert("⏳ Timeout", "El servidor tardó demasiado en responder.");
      } else if (error.message?.includes("Network")) {
        Alert.alert("🌐 Red", "No se pudo conectar con el servidor.");
      } else if (error.response?.status === 401) {
        Alert.alert("🚫 Credenciales", "Usuario o contraseña incorrectos.");
      } else {
        Alert.alert("❌ Error", "Ocurrió un error inesperado en el login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Iniciar Sesión</Text>

      <TextInput
        placeholder="Usuario"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Contraseña"
        placeholderTextColor="#aaa"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Entrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f13",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    marginBottom: 30,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    backgroundColor: "#1c1f26",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
  },
  btn: {
    backgroundColor: "#007bff",
    width: "100%",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
