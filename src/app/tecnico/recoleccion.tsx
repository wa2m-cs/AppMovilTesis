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
    backgroundColor: "#F1F5F9"
  },

  contenido: {
    paddingBottom: 35
  },

  encabezado: {
    backgroundColor: colores.fondo,
    paddingHorizontal: 24,
    paddingVertical: 28
  },

  volver: {
    color: colores.blanco,
    marginBottom: 20,
    fontSize: 15
  },

  titulo: {
    color: colores.blanco,
    fontSize: 28,
    fontWeight: "800"
  },

  subtitulo: {
    color: "#CBD5E1",
    marginTop: 8
  },

  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: 16,
    margin: 18,
    marginBottom: 0,
    padding: 22
  },

  tituloTarjeta: {
    color: colores.titulo,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18
  },

  etiqueta: {
    color: colores.titulo,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 10
  },

  opcion: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10
  },

  opcionSeleccionada: {
    borderColor: colores.primario,
    backgroundColor: "#DBEAFE"
  },

  textoOpcion: {
    color: colores.titulo,
    fontWeight: "700"
  },

  destino: {
    color: colores.textoSecundario,
    marginTop: 5
  },

  descripcion: {
    color: colores.textoSecundario,
    lineHeight: 21
  },

  campo: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colores.titulo
  },

  contador: {
    color: colores.textoSecundario,
    textAlign: "right",
    marginTop: 6,
    marginBottom: 18
  },

  boton: {
    backgroundColor: colores.primario,
    borderRadius: 12,
    padding: 17,
    alignItems: "center"
  },

  deshabilitado: {
    opacity: 0.5
  },

  textoBoton: {
    color: colores.blanco,
    fontWeight: "700"
  },

  error: {
    color: "#DC2626",
    marginBottom: 14
  },

  exito: {
    color: "#15803D",
    marginBottom: 14
  },

  registro: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 14
  },

  nombreRegistro: {
    fontWeight: "700",
    color: colores.titulo,
    fontSize: 15
  },

  fecha: {
    color: colores.textoSecundario,
    fontSize: 12,
    marginVertical: 6
  },

  estado: {
    color: "#15803D",
    fontWeight: "700",
    marginTop: 8
  },

  carga: {
    marginTop: 35
  },

  actualizar: {
    color: colores.primario,
    textAlign: "center",
    marginTop: 22,
    fontWeight: "700"
  }

});