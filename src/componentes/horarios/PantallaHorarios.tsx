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
    backgroundColor: "#F1F5F9"
  },

  contenido: {
    paddingBottom: 30
  },

  encabezado: {
    backgroundColor: colores.fondo,
    padding: 25
  },

  volver: {
    color: colores.blanco,
    marginBottom: 20,
    fontSize: 15
  },

  titulo: {
    color: colores.blanco,
    fontSize: 27,
    fontWeight: "800"
  },

  subtitulo: {
    color: "#CBD5E1",
    marginTop: 8
  },

  tarjeta: {
    backgroundColor: colores.blanco,
    padding: 22,
    margin: 18,
    borderRadius: 16
  },

  tituloTarjeta: {
    color: colores.titulo,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15
  },

  estado: {
    color: colores.primario,
    fontWeight: "700",
    marginBottom: 12
  },

  descripcion: {
    color: colores.textoSecundario,
    marginBottom: 8
  },

  boton: {
    backgroundColor: colores.primario,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14
  },

  deshabilitado: {
    opacity: 0.5
  },

  textoBoton: {
    color: colores.blanco,
    fontWeight: "700"
  },

  registro: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 14
  },

  fecha: {
    color: colores.titulo,
    fontWeight: "700",
    marginBottom: 8
  },

  error: {
    color: "#DC2626",
    marginTop: 14
  },

  exito: {
    color: "#15803D",
    marginTop: 14
  },

  actualizar: {
    color: colores.primario,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 20
  }

});