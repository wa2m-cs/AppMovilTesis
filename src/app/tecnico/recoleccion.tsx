import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { colores } from "@/constantes/colores";

import {
  consultarServiciosTecnico,
  consultarRecolecciones,
  registrarRecoleccion,
  type ServicioTecnico,
  type Recoleccion
} from "@/servicios/recoleccion.servicio";

export default function Recoleccion() {

  const router = useRouter();

  const [servicios, setServicios] =
    useState<ServicioTecnico[]>([]);

  const [historial, setHistorial] =
    useState<Recoleccion[]>([]);

  const [servicioSeleccionado, setServicioSeleccionado] =
    useState<number | null>(null);

  const [observacion, setObservacion] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarDatos() {

    setCargando(true);

    try {

      const [datosServicios, datosHistorial] =
        await Promise.all([
          consultarServiciosTecnico(),
          consultarRecolecciones()
        ]);

      setServicios(datosServicios);
      setHistorial(datosHistorial);
      setError("");

    } catch (e) {

      setError(
        e instanceof Error
          ? e.message
          : "No se pudo cargar la información."
      );

    } finally {

      setCargando(false);

    }
  }

  useEffect(() => {
    void cargarDatos();
  }, []);

  async function guardar() {

    if (guardando) return;

    if (servicioSeleccionado === null) {
      setError("Selecciona un servicio.");
      return;
    }

    if (!observacion.trim()) {
      setError("Escribe una observación.");
      return;
    }

    setGuardando(true);
    setError("");
    setMensaje("");

    try {

      await registrarRecoleccion(
        servicioSeleccionado,
        observacion.trim()
      );

      setObservacion("");
      setServicioSeleccionado(null);

      setMensaje(
        "Recolección registrada correctamente."
      );

      // Se comsulta nuevamente para actualizar la lista de recolecciones
      await cargarDatos();

    } catch (e) {

      setError(
        e instanceof Error
          ? e.message
          : "No se pudo registrar la recolección."
      );

    } finally {

      setGuardando(false);

    }
  }

  return (

    <SafeAreaView style={estilos.pantalla}>

      <ScrollView
        contentContainerStyle={estilos.contenido}
        keyboardShouldPersistTaps="handled"
      >

        <View style={estilos.encabezado}>

          <Pressable
            onPress={() => router.replace("/tecnico")}
          >
            <Text style={estilos.volver}>
              ← Volver
            </Text>
          </Pressable>

          <Text style={estilos.titulo}>
            Recolección
          </Text>

          <Text style={estilos.subtitulo}>
            Registra tus actividades de recolección
          </Text>

        </View>

        {cargando ? (

          <ActivityIndicator
            size="large"
            style={estilos.carga}
          />

        ) : (

          <View style={estilos.tarjeta}>

            <Text style={estilos.tituloTarjeta}>
              Nueva recolección
            </Text>

            <Text style={estilos.etiqueta}>
              Selecciona un servicio
            </Text>

            {servicios.length === 0 ? (

              <Text style={estilos.descripcion}>
                No tienes servicios asignados.
              </Text>

            ) : (

              servicios.map(servicio => (

                <Pressable
                  key={servicio.idServicioContrato}
                  onPress={() =>
                    setServicioSeleccionado(
                      servicio.idServicioContrato
                    )
                  }
                  style={[
                    estilos.opcion,

                    servicioSeleccionado ===
                      servicio.idServicioContrato &&
                      estilos.opcionSeleccionada
                  ]}
                >

                  <Text style={estilos.textoOpcion}>
                    {servicioSeleccionado ===
                      servicio.idServicioContrato
                        ? "✓ "
                        : ""}

                    Servicio #{servicio.idServicioContrato}
                  </Text>

                  <Text style={estilos.destino}>
                    {servicio.destino}
                  </Text>

                </Pressable>

              ))

            )}

            <Text style={estilos.etiqueta}>
              Observaciones
            </Text>

            <TextInput
              style={estilos.campo}
              multiline
              textAlignVertical="top"
              placeholder="Describe el trabajo realizado..."
              placeholderTextColor="#6B7280"
              value={observacion}
              onChangeText={setObservacion}
              maxLength={1000}
              editable={!guardando}
            />

            <Text style={estilos.contador}>
              {observacion.length}/1000
            </Text>

            {error ? (

              <Text style={estilos.error}>
                {error}
              </Text>

            ) : null}

            {mensaje ? (

              <Text style={estilos.exito}>
                {mensaje}
              </Text>

            ) : null}

            <Pressable
              style={[
                estilos.boton,

                (guardando || servicios.length === 0) &&
                  estilos.deshabilitado
              ]}
              disabled={
                guardando || servicios.length === 0
              }
              onPress={guardar}
            >

              <Text style={estilos.textoBoton}>
                {guardando
                  ? "Guardando..."
                  : "Registrar recolección"}
              </Text>

            </Pressable>

          </View>

        )}

        <View style={estilos.tarjeta}>

          <Text style={estilos.tituloTarjeta}>
            Historial de recolecciones
          </Text>

          {historial.length === 0 ? (

            <Text style={estilos.descripcion}>
              No hay recolecciones registradas.
            </Text>

          ) : (

            historial.map(registro => (

              <View
                key={registro.idLimpieza}
                style={estilos.registro}
              >

                <Text style={estilos.nombreRegistro}>
                  Servicio #{registro.idServicioContrato}
                </Text>

                <Text style={estilos.fecha}>
                  {registro.fecha.slice(0, 10)}
                </Text>

                <Text style={estilos.descripcion}>
                  {registro.observacion}
                </Text>

                <Text style={estilos.estado}>
                  {registro.etapa}
                </Text>

              </View>

            ))

          )}

          <Pressable
            onPress={cargarDatos}
            disabled={cargando || guardando}
          >

            <Text style={estilos.actualizar}>
              Actualizar información
            </Text>

          </Pressable>

        </View>

      </ScrollView>

    </SafeAreaView>

  );
}

const estilos = StyleSheet.create({

  pantalla: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  contenido: {
    paddingBottom: 42,
    flexGrow: 1,
  },

  encabezado: {
    backgroundColor: "#050505",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 34,
    borderBottomWidth: 2,
    borderBottomColor: "#22C55E",
  },

  volver: {
    color: "#86EFAC",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 24,
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  subtitulo: {
    color: "#B5B5B5",
    fontSize: 14,
    marginTop: 10,
    lineHeight: 21,
  },

  tarjeta: {
    backgroundColor: "#111111",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 22,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#1F1F1F",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },

  tituloTarjeta: {
    color: "#22C55E",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F1F",
  },

  etiqueta: {
    color: "#E5E5E5",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 11,
    marginTop: 12,
  },

  opcion: {
    backgroundColor: "#0C0C0C",
    borderWidth: 1.5,
    borderColor: "#232323",
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 10,
  },

  opcionSeleccionada: {
    backgroundColor: "#0E1A12",
    borderColor: "#22C55E",
    borderLeftWidth: 5,
    borderLeftColor: "#22C55E",
  },

  textoOpcion: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  destino: {
    color: "#A3A3A3",
    fontSize: 13,
    marginTop: 6,
  },

  descripcion: {
    color: "#A3A3A3",
    fontSize: 13,
    lineHeight: 21,
  },

  campo: {
    minHeight: 150,
    backgroundColor: "#0C0C0C",
    borderWidth: 1.5,
    borderColor: "#232323",
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 16,
    fontSize: 15,
    lineHeight: 22,
    color: "#FFFFFF",
  },

  contador: {
    color: "#7A7A7A",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 8,
    marginBottom: 18,
  },

  boton: {
    backgroundColor: "#22C55E",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22C55E",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  deshabilitado: {
    opacity: 0.45,
  },

  textoBoton: {
    color: "#051108",
    fontSize: 15,
    fontWeight: "900",
  },

  error: {
    color: "#FCA5A5",
    backgroundColor: "#2A0E0E",
    borderWidth: 1,
    borderColor: "#7F1D1D",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    marginBottom: 14,
  },

  exito: {
    color: "#BBF7D0",
    backgroundColor: "#0F1F15",
    borderWidth: 1,
    borderColor: "#166534",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    marginBottom: 14,
  },

  registro: {
    backgroundColor: "#0C0C0C",
    borderWidth: 1,
    borderColor: "#202020",
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 16,
    marginBottom: 12,
  },

  nombreRegistro: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  fecha: {
    color: "#7A7A7A",
    fontSize: 12,
    fontWeight: "600",
    marginVertical: 8,
  },

  estado: {
    color: "#86EFAC",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 10,
  },

  carga: {
    marginTop: 35,
  },

  actualizar: {
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 22,
    paddingVertical: 8,
  },

});