import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import GaleriaFotos from "@/componentes/evidencias/GaleriaFotos";
import SelectorFotos, {
  type FotoSeleccionada,
} from "@/componentes/evidencias/SelectorFotos";
import { subirFotosEvidencia } from "@/servicios/evidencias.servicio";
import {
  consultarEvidenciasTransportista,
  guardarEvidenciaTransportista,
  type EvidenciaTransportista,
  type TipoEvidencia,
} from "@/servicios/transportista.servicio";
import SelectorViaje from "@/componentes/viajes/SelectorViaje";
import { consultarMisViajes, viajesHastaHoy, type Viaje } from "@/servicios/viajes.servicio";
import { fechaConDia, fechaCorta, fechaIso } from "@/utilidades/textoFechado";

const TIPOS: { valor: TipoEvidencia; titulo: string; descripcion: string }[] = [
  {
    valor: "limpieza",
    titulo: "Limpieza de la unidad",
    descripcion: "Evidencia de que el camión o la unidad quedó limpia.",
  },
  {
    valor: "ruta",
    titulo: "Ruta del viaje",
    descripcion: "Evidencia del recorrido que hiciste durante el viaje.",
  },
];

export default function EvidenciasTransportista() {

  const router = useRouter();

  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [hoy, setHoy] = useState(fechaIso(new Date()));

  const [evidencias, setEvidencias] =
    useState<EvidenciaTransportista[]>([]);

  const [viajeSeleccionado, setViajeSeleccionado] =
    useState<number | null>(null);

  const [tipo, setTipo] = useState<TipoEvidencia | null>(null);

  const [texto, setTexto] = useState("");
  const [fotos, setFotos] = useState<FotoSeleccionada[]>([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarDatos() {

    setCargando(true);

    try {

      const [misViajes, listaEvidencias] =
        await Promise.all([
          consultarMisViajes(),
          consultarEvidenciasTransportista(),
        ]);

      setHoy(misViajes.hoy);
      setViajes(viajesHastaHoy(misViajes.viajes, misViajes.hoy));
      setEvidencias(listaEvidencias);
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

    if (viajeSeleccionado === null) {
      setError("Selecciona el viaje.");
      return;
    }

    if (tipo === null) {
      setError("Selecciona el tipo de evidencia.");
      return;
    }

    if (!texto.trim()) {
      setError("Debes escribir una evidencia.");
      return;
    }

    setGuardando(true);
    setError("");
    setMensaje("");

    try {

      const creada = await guardarEvidenciaTransportista(
        viajeSeleccionado,
        tipo,
        texto.trim()
      );

      const fallidas = await subirFotosEvidencia(
        creada.idLimpieza,
        fotos.map(foto => foto.base64)
      );

      setTexto("");
      setTipo(null);
      setFotos([]);
      setViajeSeleccionado(null);

      if (fallidas > 0) {
        setError(
          `La evidencia se guardó, pero ${fallidas} foto(s) no se pudieron subir. Revisa tu conexión.`
        );
      } else {
        setMensaje("Evidencia guardada correctamente.");
      }

      try {

        const lista = await consultarEvidenciasTransportista();

        setEvidencias(lista);

      } catch {

        setError(
          "La evidencia se guardó, pero no se pudo actualizar el listado. Pulsa Actualizar."
        );

      }

    } catch (e) {

      setError(
        e instanceof Error
          ? e.message
          : "No se pudo guardar la evidencia."
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
            onPress={() => router.replace("/transportista")}
          >
            <Text style={estilos.volver}>
              ← Volver
            </Text>
          </Pressable>

          <Text style={estilos.titulo}>
            Mis evidencias
          </Text>

          <Text style={estilos.subtitulo}>
            Registra la limpieza de la unidad y la ruta de tus viajes, con fotos si las tienes.
          </Text>

        </View>

        <View style={estilos.tarjeta}>

          <Text style={estilos.tituloTarjeta}>
            Nueva evidencia
          </Text>

          {cargando ? (

            <ActivityIndicator size="large" />

          ) : (

            <>

              <Text style={estilos.etiqueta}>
                ¿De qué viaje es la evidencia?
              </Text>

              <SelectorViaje
                viajes={viajes}
                hoy={hoy}
                seleccionado={viajeSeleccionado}
                onSeleccionar={setViajeSeleccionado}
                deshabilitado={guardando}
              />

              <Text style={estilos.etiqueta}>
                Tipo de evidencia
              </Text>

              {TIPOS.map(opcion => (

                <Pressable
                  key={opcion.valor}
                  onPress={() => setTipo(opcion.valor)}
                  disabled={guardando}
                  style={[
                    estilos.opcion,
                    tipo === opcion.valor && estilos.opcionSeleccionada
                  ]}
                >

                  <Text style={estilos.nombre}>
                    {tipo === opcion.valor ? "✓ " : ""}
                    {opcion.titulo}
                  </Text>

                  <Text style={estilos.descripcion}>
                    {opcion.descripcion}
                  </Text>

                </Pressable>

              ))}

              <Text style={estilos.etiqueta}>
                Descripción de la evidencia
              </Text>

              <TextInput
                style={estilos.campo}
                placeholder="Describe lo ocurrido durante el servicio..."
                placeholderTextColor="#6B7280"
                multiline
                textAlignVertical="top"
                value={texto}
                onChangeText={setTexto}
                maxLength={500}
                editable={!guardando}
              />

              <Text style={estilos.contador}>
                {texto.length}/500 caracteres
              </Text>

              <SelectorFotos
                fotos={fotos}
                onCambiar={setFotos}
                onError={setError}
                deshabilitado={guardando}
              />

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

                  (guardando || viajes.length === 0) &&
                    estilos.deshabilitado
                ]}
                onPress={guardar}
                disabled={
                  guardando || viajes.length === 0
                }
              >

                <Text style={estilos.textoBoton}>
                  {guardando
                    ? "Guardando..."
                    : "Guardar evidencia"}
                </Text>

              </Pressable>

            </>

          )}

        </View>

        <View style={estilos.tarjeta}>

          <Text style={estilos.tituloTarjeta}>
            Evidencias registradas
          </Text>

          {evidencias.length === 0 ? (

            <Text style={estilos.descripcion}>
              No tienes evidencias registradas.
            </Text>

          ) : (

            evidencias.map(evidencia => (

              <View
                key={evidencia.idLimpieza}
                style={estilos.registro}
              >

                <Text style={estilos.tipoEvidencia}>
                  {evidencia.tipo === "ruta"
                    ? "Ruta del viaje"
                    : "Limpieza de la unidad"}
                </Text>

                <Text style={estilos.nombre}>
                  Viaje del {fechaConDia(evidencia.fechaViaje)}
                </Text>

                <Text style={estilos.descripcion}>
                  {evidencia.destino}
                </Text>

                <Text style={estilos.fecha}>
                  Registrada el {fechaCorta(evidencia.fecha)}
                </Text>

                <Text style={estilos.textoEvidencia}>
                  {evidencia.texto}
                </Text>

                <GaleriaFotos fotos={evidencia.fotos} />

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
    fontSize: 20,
    fontWeight: "900",
    color: "#22C55E",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F1F",
    paddingBottom: 14,
  },

  etiqueta: {
    color: "#E5E5E5",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 10,
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

  nombre: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },

  descripcion: {
    color: "#A3A3A3",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
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
    color: "#FFFFFF",
    lineHeight: 22,
  },

  contador: {
    color: "#7A7A7A",
    textAlign: "right",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 18,
    fontWeight: "600",
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
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 0.2,
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
    lineHeight: 19,
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
    lineHeight: 19,
    marginBottom: 14,
  },

  registro: {
    backgroundColor: "#0C0C0C",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#202020",
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
    paddingHorizontal: 15,
    paddingVertical: 16,
    marginBottom: 12,
  },

  tipoEvidencia: {
    color: "#86EFAC",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },

  fecha: {
    color: "#7A7A7A",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },

  textoEvidencia: {
    color: "#E5E5E5",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },

  actualizar: {
    textAlign: "center",
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 20,
    paddingVertical: 8,
  },

});