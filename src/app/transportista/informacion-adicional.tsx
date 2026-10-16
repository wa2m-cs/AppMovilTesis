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

import SelectorViaje from "@/componentes/viajes/SelectorViaje";
import { consultarMisViajes, viajesDeHoy, type Viaje } from "@/servicios/viajes.servicio";
import { estaEnJornada } from "@/servicios/horarios.servicio";
import { fechaConDia, fechaCorta, fechaIso, sinFecha } from "@/utilidades/textoFechado";

import {
    consultarInformacionAdicional,
    registrarInformacionAdicional,
    type InformacionAdicionalTransportista,
} from "@/servicios/transportista.servicio";

// Aceptar números con punto o coma y hasta dos decimales.
function convertirNumero(valor: string): number | null {
  const limpio = valor.trim();

  if (!limpio) return 0;

  if (!/^\d+(?:[.,]\d{1,2})?$/.test(limpio)) {
    return null;
  }

  const numero = Number(limpio.replace(",", "."));

  if (!Number.isFinite(numero) || numero > 1000000) {
    return null;
  }

  return numero;
}

export default function InformacionAdicional() {
  const router = useRouter();

  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [enJornada, setEnJornada] = useState(true);
  const [hoy, setHoy] = useState(fechaIso(new Date()));

  const [registros, setRegistros] =
    useState<InformacionAdicionalTransportista[]>([]);

  const [viajeSeleccionado, setViajeSeleccionado] =
    useState<number | null>(null);

  const [kilometros, setKilometros] = useState("");
  const [combustible, setCombustible] = useState("");
  const [gasto, setGasto] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarDatos() {
    setCargando(true);

    try {
      const [misViajes, listaRegistros] =
        await Promise.all([
          consultarMisViajes(),
          consultarInformacionAdicional(),
        ]);

      setHoy(misViajes.hoy);
      const jornada = await estaEnJornada(misViajes.hoy);
      setEnJornada(jornada);
      setViajes(jornada ? viajesDeHoy(misViajes.viajes, misViajes.hoy) : []);
      setRegistros(listaRegistros);
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

    const valorKm = convertirNumero(kilometros);
    const valorCombustible = convertirNumero(combustible);
    const valorGasto = convertirNumero(gasto);

    if (
      valorKm === null ||
      valorCombustible === null ||
      valorGasto === null
    ) {
      setError(
        "Introduce números válidos, sin valores negativos y con máximo dos decimales."
      );
      return;
    }

    if (
      valorKm === 0 &&
      valorCombustible === 0 &&
      valorGasto === 0
    ) {
      setError("Registra al menos un valor mayor que cero.");
      return;
    }

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      await registrarInformacionAdicional({
        idRutaTrabajo: viajeSeleccionado,
        kilometros: valorKm,
        combustibleLitros: valorCombustible,
        gastoUsd: valorGasto,
      });

      setViajeSeleccionado(null);
      setKilometros("");
      setCombustible("");
      setGasto("");

      setMensaje("Información guardada correctamente.");

      try {
        const actualizados = await consultarInformacionAdicional();
        setRegistros(actualizados);

      } catch {
        setError(
          "Se guardó la información, pero no se pudo actualizar la lista. Pulsa Actualizar."
        );
      }

    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo guardar la información."
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
            Información adicional
          </Text>

          <Text style={estilos.subtitulo}>
            Registra kilómetros, combustible y gastos de cada viaje.
          </Text>
        </View>

        <View style={estilos.tarjeta}>

          <Text style={estilos.tituloTarjeta}>
            Nuevo registro
          </Text>

          {cargando ? (
            <ActivityIndicator
              size="large"
              color="#22C55E"
            />
          ) : (
            <>

              <Text style={estilos.etiqueta}>
                Selecciona el viaje
              </Text>

              {!enJornada ? (
                <Text style={estilos.aviso}>
                  Marca tu entrada en Horarios para registrar evidencias. Solo se muestran los viajes de hoy.
                </Text>
              ) : null}

              <SelectorViaje
                viajes={viajes}
                hoy={hoy}
                seleccionado={viajeSeleccionado}
                onSeleccionar={setViajeSeleccionado}
                deshabilitado={guardando}
              />

              <Text style={estilos.etiqueta}>
                Kilómetros recorridos
              </Text>

              <TextInput
                style={estilos.campo}
                placeholder="Ejemplo: 125.5"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
                value={kilometros}
                onChangeText={setKilometros}
                maxLength={12}
                editable={!guardando}
              />

              <Text style={estilos.etiqueta}>
                Combustible utilizado (litros)
              </Text>

              <TextInput
                style={estilos.campo}
                placeholder="Ejemplo: 20"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
                value={combustible}
                onChangeText={setCombustible}
                maxLength={12}
                editable={!guardando}
              />

              <Text style={estilos.etiqueta}>
                Gasto realizado ($)
              </Text>

              <TextInput
                style={estilos.campo}
                placeholder="Ejemplo: 35.50"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
                value={gasto}
                onChangeText={setGasto}
                maxLength={12}
                editable={!guardando}
              />

              <Text style={estilos.ayuda}>
                Puedes dejar en blanco los campos que no apliquen.
                Se guardarán como cero.
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
                  (guardando || viajes.length === 0) &&
                    estilos.deshabilitado,
                ]}
                disabled={
                  guardando || viajes.length === 0
                }
                onPress={guardar}
              >
                <Text style={estilos.textoBoton}>
                  {guardando
                    ? "Guardando..."
                    : "Guardar información"}
                </Text>
              </Pressable>

            </>
          )}

        </View>

        <View style={estilos.tarjeta}>

          <Text style={estilos.tituloTarjeta}>
            Información registrada
          </Text>

          {registros.length === 0 ? (
            <Text style={estilos.descripcion}>
              Todavía no tienes registros operativos.
            </Text>
          ) : (
            registros.map((registro, indice) => (
              <View
                key={registro.idLimpieza ?? indice}
                style={estilos.registro}
              >
                <Text style={estilos.nombreRegistro}>
                  {fechaConDia(registro.fechaViaje)}
                </Text>

                <Text style={estilos.descripcion}>
                  {sinFecha(registro.destino)}
                </Text>

                <Text style={estilos.fecha}>
                  {fechaCorta(registro.fecha)}
                </Text>

                <Text style={estilos.dato}>
                  Kilómetros: {registro.kilometros} km
                </Text>

                <Text style={estilos.dato}>
                  Combustible: {registro.combustibleLitros} L
                </Text>

                <Text style={estilos.dato}>
                  Gasto: ${Number(registro.gastoUsd).toFixed(2)}
                </Text>
              </View>
            ))
          )}

          <Pressable
            disabled={cargando || guardando}
            onPress={cargarDatos}
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
  aviso: {
    color: "#FCD34D",
    backgroundColor: "#2A230A",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 19,
  },

  pantalla: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  contenido: {
    flexGrow: 1,
    paddingBottom: 42,
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
  },

  subtitulo: {
    color: "#B5B5B5",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },

  tarjeta: {
    backgroundColor: "#111111",
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#232323",
  },

  tituloTarjeta: {
    color: "#22C55E",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#232323",
  },

  etiqueta: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 15,
    marginBottom: 10,
  },

  descripcion: {
    color: "#A3A3A3",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 6,
  },

  opcion: {
    backgroundColor: "#0C0C0C",
    borderWidth: 1.5,
    borderColor: "#232323",
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
  },

  opcionSeleccionada: {
    backgroundColor: "#0E1A12",
    borderColor: "#22C55E",
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
  },

  textoOpcion: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  campo: {
    backgroundColor: "#0C0C0C",
    borderWidth: 1.5,
    borderColor: "#232323",
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 54,
    fontSize: 16,
    color: "#FFFFFF",
  },

  ayuda: {
    color: "#7A7A7A",
    fontSize: 12,
    lineHeight: 20,
    marginTop: 15,
    marginBottom: 22,
  },

  boton: {
    backgroundColor: "#22C55E",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
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
    borderRadius: 12,
    padding: 13,
    marginBottom: 14,
  },

  exito: {
    color: "#BBF7D0",
    backgroundColor: "#0F1F15",
    borderRadius: 12,
    padding: 13,
    marginBottom: 14,
  },

  registro: {
    backgroundColor: "#0C0C0C",
    borderWidth: 1,
    borderColor: "#232323",
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
    borderRadius: 14,
    padding: 16,
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
    marginTop: 8,
    marginBottom: 10,
  },

  dato: {
    color: "#E5E5E5",
    fontSize: 14,
    lineHeight: 24,
  },

  actualizar: {
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 20,
    paddingVertical: 8,
  },

});