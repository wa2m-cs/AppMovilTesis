import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Viaje } from "@/servicios/viajes.servicio";
import { fechaConDia } from "@/utilidades/textoFechado";

interface Propiedades {
  viajes: Viaje[];
  hoy: string;
  seleccionado: number | null;
  onSeleccionar: (idRutaTrabajo: number) => void;
  deshabilitado?: boolean;
}

const VISIBLES = 6;

export default function SelectorViaje({
  viajes,
  hoy,
  seleccionado,
  onSeleccionar,
  deshabilitado = false,
}: Propiedades) {
  const [verTodos, setVerTodos] = useState(false);

  if (viajes.length === 0) {
    return (
      <Text style={estilos.vacio}>
        No tienes viajes asignados para hoy.
      </Text>
    );
  }

  const lista = verTodos ? viajes : viajes.slice(0, VISIBLES);

  return (
    <View>
      {lista.map(viaje => {
        const activo = seleccionado === viaje.idRutaTrabajo;
        const esHoy = viaje.fecha === hoy;

        return (
          <Pressable
            key={viaje.idRutaTrabajo}
            onPress={() => onSeleccionar(viaje.idRutaTrabajo)}
            disabled={deshabilitado}
            style={[estilos.opcion, activo && estilos.opcionSeleccionada]}
          >
            <View style={estilos.fila}>
              <Text style={estilos.fecha}>
                {activo ? "✓ " : ""}
                {fechaConDia(viaje.fecha)}
              </Text>
              {esHoy ? <Text style={estilos.hoy}>HOY</Text> : null}
            </View>

            <Text style={estilos.destino}>{viaje.destino}</Text>

            {viaje.cliente || viaje.tipo ? (
              <Text style={estilos.detalle}>
                {[viaje.cliente, viaje.tipo].filter(Boolean).join(" · ")}
              </Text>
            ) : null}
          </Pressable>
        );
      })}

      {viajes.length > VISIBLES ? (
        <Pressable onPress={() => setVerTodos(!verTodos)} disabled={deshabilitado}>
          <Text style={estilos.verMas}>
            {verTodos ? "Ver menos" : `Ver ${viajes.length - VISIBLES} viaje(s) anteriores`}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  vacio: {
    color: "#A3A3A3",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  opcion: {
    backgroundColor: "#0C0C0C",
    borderWidth: 1.5,
    borderColor: "#232323",
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 13,
    marginBottom: 10,
  },
  opcionSeleccionada: {
    backgroundColor: "#0E1A12",
    borderColor: "#22C55E",
    borderLeftWidth: 5,
    borderLeftColor: "#22C55E",
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fecha: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  hoy: {
    color: "#051108",
    backgroundColor: "#22C55E",
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
  },
  destino: {
    color: "#E5E5E5",
    fontSize: 14,
    marginTop: 6,
  },
  detalle: {
    color: "#A3A3A3",
    fontSize: 12,
    marginTop: 4,
  },
  verMas: {
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
    paddingVertical: 8,
    marginBottom: 6,
  },
});
