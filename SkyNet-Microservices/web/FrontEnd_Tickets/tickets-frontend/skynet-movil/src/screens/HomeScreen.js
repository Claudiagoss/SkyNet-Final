import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button } from "react-native";
import { api } from "../api";

export default function HomeScreen({ route }) {
  const { token } = route.params;
  const [visitas, setVisitas] = useState([]);

  useEffect(() => {
    api
      .get("/tickets/visitas/activas", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setVisitas(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        🧭 Mis visitas activas
      </Text>
      <FlatList
        data={visitas}
        keyExtractor={(item) => item.ticketId.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#eef",
              padding: 10,
              borderRadius: 10,
              marginBottom: 8,
            }}
          >
            <Text>Cliente: {item.clienteNombre}</Text>
            <Text>Estado: {item.estado}</Text>
          </View>
        )}
      />
    </View>
  );
}
