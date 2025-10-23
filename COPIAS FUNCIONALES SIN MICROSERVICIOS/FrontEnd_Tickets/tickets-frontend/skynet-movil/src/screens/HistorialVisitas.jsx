import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native"; // 👈 clave
import { getHistorialPorTecnico } from "../api";

export default function HistorialVisitas({ navigation }) {
  const [historial, setHistorial] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const isFocused = useIsFocused(); // 👈 detecta cuando esta pantalla está activa

  const cargarHistorial = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const tokenData = await AsyncStorage.getItem("token");

      if (!userData || !tokenData) return;

      const usuario = JSON.parse(userData);
      setUser(usuario);
      setToken(tokenData);

      console.log("📜 Cargando historial del técnico:", usuario.usuarioId);
      const data = await getHistorialPorTecnico(usuario.usuarioId, tokenData);
      setHistorial(data);
    } catch (error) {
      console.error("❌ Error cargando historial:", error);
      Alert.alert("Error", "No se pudo cargar el historial de visitas");
    }
  };

  // 👇 Se ejecuta cada vez que la pantalla vuelve a ser visible
  useEffect(() => {
    if (isFocused) {
      cargarHistorial();
    }
  }, [isFocused]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.ticket}>🎫 Ticket #{item.ticketId}</Text>
      <Text style={styles.cliente}>🏢 Cliente: {item.cliente}</Text>
      <Text style={styles.info}>🧑‍🔧 Técnico: {user?.username}</Text>
      <Text style={styles.info}>
        ⏰ Inicio:{" "}
        {item.horaIngreso
          ? new Date(item.horaIngreso).toLocaleString()
          : "N/A"}
      </Text>
      <Text style={styles.info}>
        ✅ Finalizó:{" "}
        {item.horaSalida
          ? new Date(item.horaSalida).toLocaleString()
          : "Sin registro"}
      </Text>
      <Text style={styles.reporte}>📝 {item.reporteFinal}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>📜 Historial de {user?.username}</Text>
          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.clear();
              Alert.alert("✅ Sesión cerrada correctamente");
              navigation.replace("Login");
            }}
          >
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>🧾 Visitas Completadas</Text>

      {historial.length === 0 ? (
        <Text style={styles.vacio}>Aún no tienes visitas completadas.</Text>
      ) : (
        <FlatList
          data={historial}
          keyExtractor={(item) => item.ticketId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0f13", paddingHorizontal: 14 },
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#1c1f26",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  logoutText: { color: "#ff4d4d", fontWeight: "600", fontSize: 14 },
  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 20,
    textAlign: "center",
  }, 
  card: {
    backgroundColor: "#1c1f26",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  ticket: { color: "#ffd60a", fontWeight: "bold", marginBottom: 3 },
  cliente: { color: "#00d9ff", fontWeight: "600", marginBottom: 3 },
  info: { color: "#ccc", fontSize: 13, marginBottom: 2 },
  reporte: { color: "#9fd8ff", fontSize: 13, marginTop: 5, fontStyle: "italic" },
  vacio: { color: "#999", textAlign: "center", marginTop: 40 },
});
