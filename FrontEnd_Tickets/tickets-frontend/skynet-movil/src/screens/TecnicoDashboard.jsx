import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import axios from "axios";
import { getVisitasPorTecnico, checkInVisita, checkOutVisita } from "../api";

export default function TecnicoDashboard({ navigation }) {
  const [visitas, setVisitas] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Cargar visitas
  const cargarVisitas = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem("user");
      const tokenData = await AsyncStorage.getItem("token");
      if (!userData || !tokenData) return;

      const usuario = JSON.parse(userData);
      setUser(usuario);
      setToken(tokenData);

      const data = await getVisitasPorTecnico(usuario.usuarioId, tokenData);
      setVisitas(data);
    } catch (error) {
      console.error("❌ Error cargando visitas:", error);
      Alert.alert("Error", "No se pudieron cargar las visitas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVisitas();
  }, []);

  // 🔹 Cerrar sesión
  const logout = async () => {
    await AsyncStorage.clear();
    Alert.alert("✅ Sesión cerrada correctamente");
    navigation.replace("Login");
  };

  // 🟢 Iniciar visita (Check-In)
  const handleCheckIn = async (ticketId) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "No se puede obtener tu ubicación.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitudIngreso: location.coords.latitude,
        longitudIngreso: location.coords.longitude,
      };

      await checkInVisita(ticketId, coords, token);

      const hora = new Date().toISOString();
      setVisitas((prev) =>
        prev.map((v) =>
          v.ticketId === ticketId
            ? { ...v, iniciado: true, horaIngreso: hora }
            : v
        )
      );

      Alert.alert("✅ Visita iniciada correctamente");
    } catch (error) {
      console.error("Error en Check-In:", error);
      Alert.alert("Error", "No se pudo iniciar la visita.");
    }
  };

  // 🔴 Finalizar visita (Check-Out)
  const handleCheckOut = async (ticketId) => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const datos = {
        latitudSalida: location.coords.latitude,
        longitudSalida: location.coords.longitude,
        reporteFinal: "Visita completada exitosamente.",
      };

      await checkOutVisita(ticketId, datos, token);

      const horaSalida = new Date().toISOString();
      setVisitas((prev) =>
        prev.map((v) =>
          v.ticketId === ticketId
            ? { ...v, finalizada: true, horaSalida: horaSalida }
            : v
        )
      );

      Alert.alert("✅ Visita finalizada y enviada al historial");
      setTimeout(() => {
        setVisitas((prev) => prev.filter((v) => v.ticketId !== ticketId));
      }, 1500);
    } catch (error) {
      console.error("Error en Check-Out:", error);
      Alert.alert("Error", "No se pudo finalizar la visita.");
    }
  };

  // 🧠 Semáforo de tiempo
  const getSemaforo = (fechaLimite) => {
    if (!fechaLimite)
      return { color: "#999", texto: "Sin fecha límite definida" };

    const ahora = new Date();
    const limite = new Date(fechaLimite);
    const diffHoras = (limite - ahora) / (1000 * 60 * 60);

    if (diffHoras < 0)
      return { color: "#ff4d4d", texto: "🔴 Ya venció" };
    if (diffHoras < 1)
      return { color: "#ff8c00", texto: "🟠 Menos de 1 hora" };
    if (diffHoras <= 24)
      return { color: "#ffd60a", texto: "🟡 Próximo a vencer" };
    return { color: "#4CAF50", texto: "🟢 En tiempo" };
  };

  // 🔹 Render de cada tarjeta
  const renderVisita = ({ item }) => {
    const { color, texto } = getSemaforo(item.fechaLimite);

    return (
      <View
        style={[
          styles.card,
          { borderLeftColor: color, borderLeftWidth: 5 },
        ]}
      >
        <Text style={styles.ticket}>Ticket #{item.ticketId}</Text>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.cliente}>🏢 Cliente: {item.cliente}</Text>
        <Text style={styles.info}>🧑‍🔧 Técnico: {user?.username}</Text>

        {/* 📅 Fecha límite */}
        <Text style={[styles.fecha, { color }]}>
          📅 Fecha límite:{" "}
          {item.fechaLimite
            ? new Date(item.fechaLimite).toLocaleString()
            : "No asignada"}
        </Text>

        {/* 🔔 Estado visual */}
        <Text style={[styles.estado, { color }]}>{texto}</Text>

        {/* 🕒 Check-in / Check-out */}
        {item.horaIngreso && (
          <Text style={styles.tiempo}>
            📥 Inició: {new Date(item.horaIngreso).toLocaleTimeString()}
          </Text>
        )}
        {item.horaSalida && (
          <Text style={styles.tiempo}>
            📤 Finalizó: {new Date(item.horaSalida).toLocaleTimeString()}
          </Text>
        )}

        <View style={styles.btnGroup}>
          {!item.iniciado ? (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#28a745" }]}
              onPress={() => handleCheckIn(item.ticketId)}
            >
              <Text style={styles.btnText}>Iniciar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#dc3545" }]}
              onPress={() => handleCheckOut(item.ticketId)}
            >
              <Text style={styles.btnText}>Finalizar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#007bff" }]}
            onPress={() => Linking.openURL(item.googleMapsUrl)}
          >
            <Text style={styles.btnText}>Ver mapa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 🔹 Render general
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>👋 Bienvenido, {user?.username}</Text>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.refreshContainer}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={cargarVisitas}
          disabled={loading}
        >
          <Text style={styles.refreshText}>
            {loading ? "⏳ Actualizando..." : "🔄 Actualizar visitas"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>🧭 Mis Visitas Asignadas</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#00d9ff"
          style={{ marginTop: 20 }}
        />
      ) : visitas.length === 0 ? (
        <Text style={styles.vacio}>No hay visitas activas para hoy.</Text>
      ) : (
        <FlatList
          data={visitas}
          keyExtractor={(item) => item.ticketId.toString()}
          renderItem={renderVisita}
          contentContainerStyle={styles.lista}
        />
      )}
    </View>
  );
}

// 🎨 ESTILOS
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
  refreshContainer: { marginTop: 20, alignItems: "center" },
  refreshButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  refreshText: { color: "#fff", fontWeight: "bold" },
  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1c1f26",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  titulo: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 5 },
  ticket: { color: "#ffd60a", fontWeight: "bold", marginBottom: 3 },
  cliente: { color: "#00d9ff", fontWeight: "600" },
  info: { color: "#ccc", fontSize: 13 },
  fecha: { marginTop: 6, fontWeight: "bold" },
  estado: { marginTop: 3, fontWeight: "bold", fontSize: 14 },
  tiempo: { color: "#bbb", fontSize: 13, marginTop: 3 },
  btnGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 3,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  lista: { paddingBottom: 40 },
  vacio: { color: "#999", textAlign: "center", marginTop: 40 },
});
