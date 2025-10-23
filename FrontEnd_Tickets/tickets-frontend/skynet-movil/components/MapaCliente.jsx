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
import { getVisitasPorTecnico, checkInVisita, checkOutVisita } from "../api";

export default function TecnicoDashboard({ navigation }) {
  const [visitas, setVisitas] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingInId, setCheckingInId] = useState(null);
  const [checkingOutId, setCheckingOutId] = useState(null);

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

  const logout = async () => {
    await AsyncStorage.clear();
    Alert.alert("✅ Sesión cerrada correctamente");
    navigation.replace("Login");
  };

  const handleCheckIn = async (ticketId) => {
    try {
      setCheckingInId(ticketId);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "No se puede obtener tu ubicación.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: 3 });
      if (!location?.coords) {
        Alert.alert("Error", "No se pudo obtener tu ubicación.");
        return;
      }

      const payload = {
        LatitudIngreso: location.coords.latitude,
        LongitudIngreso: location.coords.longitude,
      };

      await checkInVisita(ticketId, payload, token);

      // 🔁 Actualiza estado local a “En proceso”
      setVisitas((prev) =>
        prev.map((v) =>
          v.ticketId === ticketId
            ? {
                ...v,
                estado: "En proceso",
                horaIngreso: new Date().toISOString(),
              }
            : v
        )
      );

      Alert.alert("✅ Check-in registrado correctamente");
    } catch (error) {
      console.error("Error en Check-In:", error);
      Alert.alert("Error", "No se pudo registrar el inicio de visita.");
    } finally {
      setCheckingInId(null);
    }
  };

  const handleCheckOut = async (ticketId) => {
    try {
      setCheckingOutId(ticketId);

      const location = await Location.getCurrentPositionAsync({ accuracy: 3 });
      if (!location?.coords) {
        Alert.alert("Error", "No se pudo obtener tu ubicación.");
        return;
      }

      const payload = {
        LatitudSalida: location.coords.latitude,
        LongitudSalida: location.coords.longitude,
        ReporteFinal: "Visita completada exitosamente.",
      };

      await checkOutVisita(ticketId, payload, token);

      // ❌ Quita del dashboard inmediatamente
      setVisitas((prev) => prev.filter((v) => v.ticketId !== ticketId));

      Alert.alert("✅ Visita finalizada y cerrada correctamente");
    } catch (error) {
      console.error("Error en Check-Out:", error);
      Alert.alert("Error", "No se pudo finalizar la visita.");
    } finally {
      setCheckingOutId(null);
    }
  };

  const renderVisita = ({ item }) => {
    const inCheckIn = checkingInId === item.ticketId;
    const inCheckOut = checkingOutId === item.ticketId;

    return (
      <View style={styles.card}>
        <Text style={styles.ticket}>🎫 Ticket #{item.ticketId}</Text>
        <Text style={styles.cliente}>🏢 Cliente: {item.cliente}</Text>
        <Text style={styles.info}>🧑‍🔧 Técnico: {user?.username}</Text>
        {item.horaIngreso && (
          <Text style={styles.info}>
            ⏰ Inicio: {new Date(item.horaIngreso).toLocaleString()}
          </Text>
        )}
        <View style={styles.btnGroup}>
          {/* 🟢 INICIAR solo si está pendiente */}
          {item.estado === "Pendiente" && (
            <TouchableOpacity
              style={[
                styles.btn,
                { backgroundColor: "#28a745", opacity: inCheckIn ? 0.6 : 1 },
              ]}
              onPress={() => handleCheckIn(item.ticketId)}
              disabled={inCheckIn}
            >
              <Text style={styles.btnText}>
                {inCheckIn ? "Iniciando..." : "Iniciar"}
              </Text>
            </TouchableOpacity>
          )}

          {/* 🔴 FINALIZAR solo si está en proceso */}
          {item.estado === "En proceso" && (
            <TouchableOpacity
              style={[
                styles.btn,
                { backgroundColor: "#dc3545", opacity: inCheckOut ? 0.6 : 1 },
              ]}
              onPress={() => handleCheckOut(item.ticketId)}
              disabled={inCheckOut}
            >
              <Text style={styles.btnText}>
                {inCheckOut ? "Finalizando..." : "Finalizar"}
              </Text>
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

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>👋 Bienvenido, {user?.username}</Text>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Botón actualizar */}
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
        <ActivityIndicator size="large" color="#00d9ff" style={{ marginTop: 20 }} />
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
  logoutBtn: { padding: 6 },
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
  ticket: { color: "#ffd60a", fontWeight: "bold", marginBottom: 3 },
  cliente: { color: "#00d9ff", fontWeight: "600" },
  info: { color: "#ccc", fontSize: 13 },
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
