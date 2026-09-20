import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  consultarHorarios,
  registrarEntrada,
  registrarSalida,
  type Horario
} from "@/servicios/horarios.servicio";

import { colores } from "@/constantes/colores";

interface Propiedades {
  rol: "transportista" | "tecnico";
}

export default function PantallaHorarios({
  rol
}: Propiedades) {

  const router = useRouter();

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargar() {

    setCargando(true);

    try {
      const datos = await consultarHorarios();
      setHorarios(datos);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Error al consultar horarios."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  const jornadaAbierta = horarios.find(
    horario => horario.salida == null
  );

  async function marcar() {

    if (guardando || cargando) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    try {

      if (jornadaAbierta) {

        await registrarSalida(
          jornadaAbierta.idHorarioTrabajo
        );

        setMensaje("Salida registrada correctamente.");

      } else {

        await registrarEntrada();

        setMensaje("Entrada registrada correctamente.");

      }

      await cargar();

    } catch (e) {

      setError(
        e instanceof Error
          ? e.message
          : "No se pudo registrar el horario."
      );

    } finally {

      setGuardando(false);

    }
  }

  function volver() {
    router.replace(
      rol === "transportista"
        ? "/transportista"
        : "/tecnico"
    );
  }

  return (

    <SafeAreaView style={estilos.pantalla}>

      <ScrollView contentContainerStyle={estilos.contenido}>

        <View style={estilos.encabezado}>

          <Pressable onPress={volver}>
            <Text style={estilos.volver}>
              ← Volver
            </Text>
          </Pressable>

          <Text style={estilos.titulo}>
            Mis horarios
          </Text>

          <Text style={estilos.subtitulo}>
            Registro de entrada y salida
          </Text>

        </View>

        <View style={estilos.tarjeta}>

          <Text style={estilos.tituloTarjeta}>
            Mi jornada
          </Text>

          {cargando ? (

            <ActivityIndicator />

          ) : (

            <>

              <Text style={estilos.estado}>
                {jornadaAbierta
                  ? "Jornada en curso"
                  : "Sin jornada abierta"}
              </Text>

              {jornadaAbierta ? (

                <Text style={estilos.descripcion}>
                  Entrada: {jornadaAbierta.entrada.slice(0, 5)}
                </Text>

              ) : null}

              <Pressable
                style={[
                  estilos.boton,
                  guardando && estilos.deshabilitado
                ]}
                disabled={guardando}
                onPress={marcar}
              >

                <Text style={estilos.textoBoton}>
                  {guardando
                    ? "Guardando..."
                    : jornadaAbierta
                      ? "Marcar salida"
                      : "Marcar entrada"}
                </Text>

              </Pressable>

            </>

          )}

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

        </View>

        <View style={estilos.tarjeta}>

          <Text style={estilos.tituloTarjeta}>
            Historial de horarios
          </Text>

          {horarios.length === 0 ? (

            <Text style={estilos.descripcion}>
              No tienes horarios registrados.
            </Text>

          ) : (

            horarios.map(horario => (

              <View
                key={horario.idHorarioTrabajo}
                style={estilos.registro}
              >

                <Text style={estilos.fecha}>
                  {horario.fecha.slice(0, 10)}
                </Text>

                <Text style={estilos.descripcion}>
                  Entrada: {horario.entrada.slice(0, 5)}
                </Text>

                <Text style={estilos.descripcion}>
                  Salida: {horario.salida
                    ? horario.salida.slice(0, 5)
                    : "Pendiente"}
                </Text>

              </View>

            ))

          )}

          <Pressable onPress={cargar} disabled={cargando}>
            <Text style={estilos.actualizar}>
              Actualizar horarios
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
    marginBottom: 24,
    fontSize: 14,
    fontWeight: "700",
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

  estado: {
    color: "#86EFAC",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 14,
    backgroundColor: "#0E1A12",
    borderWidth: 1,
    borderColor: "#166534",
    borderRadius: 10,
    padding: 12,
    overflow: "hidden",
  },

  descripcion: {
    color: "#A3A3A3",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
  },

  boton: {
    backgroundColor: "#22C55E",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: "#22C55E",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  deshabilitado: {
    opacity: 0.45,
  },

  textoBoton: {
    color: "#051108",
    fontSize: 15,
    fontWeight: "900",
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

  fecha: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 9,
  },

  error: {
    color: "#FCA5A5",
    backgroundColor: "#2A0E0E",
    borderWidth: 1,
    borderColor: "#7F1D1D",
    borderRadius: 12,
    padding: 13,
    marginTop: 14,
    overflow: "hidden",
  },

  exito: {
    color: "#BBF7D0",
    backgroundColor: "#0F1F15",
    borderWidth: 1,
    borderColor: "#166534",
    borderRadius: 12,
    padding: 13,
    marginTop: 14,
    overflow: "hidden",
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