import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  consultarCatalogosViajeAdmin,
  type CamionViaje,
  type EmpleadoViaje,
} from "@/servicios/admin.servicio";
import {
  asignarContrato,
  asignarViaje,
  consultarContratosAdmin,
  consultarViajesContrato,
  type ContratoAdmin,
  type Viaje,
} from "@/servicios/viajes.servicio";
import { fechaConDia, fechaIso } from "@/utilidades/textoFechado";
import { tipoVisible } from "@/utilidades/tiposEmpleado";

type Edicion = {
  objetivo: number | "todos";
  empleados: number[];
  camion: number | null;
};

export default function ContratosYViajes() {
  const router = useRouter();

  const [contratos, setContratos] = useState<ContratoAdmin[]>([]);
  const [contrato, setContrato] = useState<ContratoAdmin | null>(null);
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [empleados, setEmpleados] = useState<EmpleadoViaje[]>([]);
  const [camiones, setCamiones] = useState<CamionViaje[]>([]);
  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const hoy = fechaIso(new Date());

  async function cargarContratos() {
    setCargando(true);
    try {
      const [lista, catalogos] = await Promise.all([
        consultarContratosAdmin(),
        consultarCatalogosViajeAdmin(),
      ]);
      setContratos(lista);
      setEmpleados(catalogos.empleados);
      setCamiones(catalogos.camiones);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los contratos.");
    } finally {
      setCargando(false);
    }
  }

  async function abrirContrato(seleccionado: ContratoAdmin) {
    setContrato(seleccionado);
    setEdicion(null);
    setMensaje("");
    setCargando(true);
    try {
      setViajes(await consultarViajesContrato(seleccionado.idServicioContrato));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los viajes.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargarContratos();
  }, []);

  function editarViaje(viaje: Viaje) {
    setMensaje("");
    setError("");
    setEdicion({
      objetivo: viaje.idRutaTrabajo,
      empleados: viaje.personal.map(p => p.idEmpleado),
      camion: viaje.idCamion,
    });
  }

  function editarTodos() {
    setMensaje("");
    setError("");
    setEdicion({ objetivo: "todos", empleados: [], camion: null });
  }

  function alternarEmpleado(id: number) {
    if (!edicion) return;
    const ya = edicion.empleados.includes(id);
    setEdicion({
      ...edicion,
      empleados: ya ? edicion.empleados.filter(e => e !== id) : [...edicion.empleados, id],
    });
  }

  async function guardar() {
    if (!edicion || !contrato || guardando) return;
    setGuardando(true);
    setError("");
    try {
      if (edicion.objetivo === "todos") {
        const resultado = await asignarContrato(contrato.idServicioContrato, {
          idEmpleados: edicion.empleados,
          idCamion: edicion.camion,
          soloSinPersonal: true,
        });
        setMensaje(resultado.mensaje);
        setViajes(await consultarViajesContrato(contrato.idServicioContrato));
      } else {
        const resultado = await asignarViaje(edicion.objetivo, {
          idEmpleados: edicion.empleados,
          idCamion: edicion.camion,
        });
        setViajes(viajes.map(v => (v.idRutaTrabajo === resultado.viaje.idRutaTrabajo ? resultado.viaje : v)));
        setMensaje(resultado.mensaje);
      }
      setEdicion(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la asignación.");
    } finally {
      setGuardando(false);
    }
  }

  function volver() {
    if (contrato) {
      setContrato(null);
      setEdicion(null);
      setMensaje("");
      void cargarContratos();
      return;
    }
    router.replace("/administrador");
  }

  const editor = edicion ? (
    <View style={estilos.editor}>
      <Text style={estilos.etiqueta}>
        {edicion.objetivo === "todos"
          ? "Personal para todos los viajes que aún no tienen"
          : "Personal del viaje"}
      </Text>
      {empleados.length === 0 ? (
        <Text style={estilos.descripcion}>No hay motoristas ni técnicos activos.</Text>
      ) : (
        empleados.map(empleado => {
          const activo = edicion.empleados.includes(empleado.idEmpleado);
          return (
            <Pressable
              key={empleado.idEmpleado}
              onPress={() => alternarEmpleado(empleado.idEmpleado)}
              disabled={guardando}
              style={[estilos.opcion, activo && estilos.opcionSeleccionada]}
            >
              <Text style={estilos.nombre}>
                {activo ? "✓ " : ""}
                {empleado.nombre}
              </Text>
              <Text style={estilos.descripcion}>
                {tipoVisible(empleado.tipo)} · {empleado.codigoEmpleado}
              </Text>
            </Pressable>
          );
        })
      )}

      <Text style={estilos.etiqueta}>Camión</Text>
      <View style={estilos.chips}>
        <Pressable
          onPress={() => setEdicion({ ...edicion, camion: null })}
          style={[estilos.chip, edicion.camion === null && estilos.chipActivo]}
        >
          <Text style={estilos.textoChip}>Por definir</Text>
        </Pressable>
        {camiones.map(camion => (
          <Pressable
            key={camion.idCamion}
            onPress={() => setEdicion({ ...edicion, camion: camion.idCamion })}
            style={[estilos.chip, edicion.camion === camion.idCamion && estilos.chipActivo]}
          >
            <Text style={estilos.textoChip}>{camion.nombre ?? camion.placa}</Text>
          </Pressable>
        ))}
      </View>

      <View style={estilos.botones}>
        <Pressable
          style={[estilos.botonSecundario]}
          onPress={() => setEdicion(null)}
          disabled={guardando}
        >
          <Text style={estilos.textoSecundario}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[estilos.boton, guardando && estilos.deshabilitado]}
          onPress={guardar}
          disabled={guardando}
        >
          <Text style={estilos.textoBoton}>{guardando ? "Guardando..." : "Guardar"}</Text>
        </Pressable>
      </View>
    </View>
  ) : null;

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <View style={estilos.encabezado}>
          <Pressable onPress={volver}>
            <Text style={estilos.volver}>{contrato ? "← Contratos" : "← Volver"}</Text>
          </Pressable>
          <Text style={estilos.titulo}>{contrato ? contrato.cliente : "Contratos y viajes"}</Text>
          <Text style={estilos.subtitulo}>
            {contrato
              ? `${contrato.servicio ?? "Servicio"} · ${contrato.lugar}`
              : "Cada contrato tiene varios viajes. Asigna el personal y el camión de cada uno."}
          </Text>
        </View>

        {error ? <Text style={estilos.error}>{error}</Text> : null}
        {mensaje ? <Text style={estilos.exito}>{mensaje}</Text> : null}

        {cargando ? (
          <ActivityIndicator size="large" style={estilos.carga} />
        ) : !contrato ? (
          <View style={estilos.tarjeta}>
            <Text style={estilos.tituloTarjeta}>Contratos con viajes</Text>
            {contratos.length === 0 ? (
              <Text style={estilos.descripcion}>
                Todavía no hay contratos con viajes. Se crean en la app de escritorio al aprobar una cotización.
              </Text>
            ) : (
              contratos.map(c => (
                <Pressable key={c.idServicioContrato} style={estilos.opcion} onPress={() => abrirContrato(c)}>
                  <Text style={estilos.nombre}>{c.cliente}</Text>
                  <Text style={estilos.descripcion}>
                    {c.servicio ?? "Servicio"} · {c.lugar}
                    {c.idCotizacion ? ` · Cotización #${c.idCotizacion}` : ""}
                  </Text>
                  <View style={estilos.progreso}>
                    <View
                      style={[
                        estilos.barra,
                        { width: `${c.totalViajes === 0 ? 0 : Math.round((c.viajesConPersonal / c.totalViajes) * 100)}%` as `${number}%` },
                      ]}
                    />
                  </View>
                  <Text style={estilos.dato}>
                    {c.viajesConPersonal} de {c.totalViajes} viajes con personal
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        ) : (
          <>
            <View style={estilos.tarjeta}>
              <Text style={estilos.tituloTarjeta}>Asignación rápida</Text>
              <Text style={estilos.descripcion}>
                Pon el mismo personal en todos los viajes que aún no tienen a nadie. Después puedes cambiar cualquier viaje por separado.
              </Text>
              {edicion?.objetivo === "todos" ? (
                editor
              ) : (
                <Pressable style={[estilos.boton, estilos.espacio]} onPress={editarTodos}>
                  <Text style={estilos.textoBoton}>Asignar a viajes sin personal</Text>
                </Pressable>
              )}
            </View>

            <View style={estilos.tarjeta}>
              <Text style={estilos.tituloTarjeta}>Viajes ({viajes.length})</Text>
              {viajes.map((viaje, indice) => {
                const pasado = !!viaje.fecha && viaje.fecha < hoy;
                return (
                  <View
                    key={viaje.idRutaTrabajo}
                    style={[estilos.viaje, viaje.personal.length === 0 && estilos.viajeSinPersonal, pasado && estilos.viajePasado]}
                  >
                    <Text style={[estilos.numero, viaje.tipo?.startsWith("Viaje extra") && estilos.extra]}>
                      {viaje.tipo?.startsWith("Viaje extra") ? "Viaje extra" : `Viaje ${indice + 1}`}
                    </Text>
                    <Text style={estilos.nombre}>{fechaConDia(viaje.fecha)}</Text>
                    <Text style={estilos.descripcion}>{viaje.destino}</Text>
                    <Text style={estilos.dato}>
                      Personal: {viaje.personal.map(p => p.nombre).join(", ") || "Sin asignar"}
                    </Text>
                    <Text style={estilos.dato}>Camión: {viaje.camion ?? "Por definir"}</Text>
                    {viaje.evidencias > 0 ? (
                      <Text style={estilos.conEvidencia}>✓ {viaje.evidencias} evidencia(s)</Text>
                    ) : null}

                    {edicion?.objetivo === viaje.idRutaTrabajo ? (
                      editor
                    ) : (
                      <Pressable onPress={() => editarViaje(viaje)} disabled={guardando}>
                        <Text style={estilos.accion}>
                          {viaje.personal.length === 0 ? "Asignar personal" : "Cambiar personal"}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: "#0A0A0A" },
  contenido: { paddingBottom: 42, flexGrow: 1 },
  encabezado: {
    backgroundColor: "#050505",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#22C55E",
  },
  volver: { color: "#86EFAC", fontSize: 14, fontWeight: "700", marginBottom: 24 },
  titulo: { color: "#FFFFFF", fontSize: 27, fontWeight: "900", letterSpacing: -0.5 },
  subtitulo: { color: "#B5B5B5", fontSize: 14, marginTop: 10, lineHeight: 21 },
  carga: { marginTop: 40 },
  tarjeta: {
    backgroundColor: "#111111",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginHorizontal: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  tituloTarjeta: { fontSize: 19, fontWeight: "900", color: "#22C55E", marginBottom: 14 },
  etiqueta: { color: "#E5E5E5", fontSize: 14, fontWeight: "800", marginTop: 14, marginBottom: 10 },
  opcion: {
    backgroundColor: "#0C0C0C",
    borderWidth: 1.5,
    borderColor: "#232323",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,
  },
  opcionSeleccionada: {
    backgroundColor: "#0E1A12",
    borderColor: "#22C55E",
    borderLeftWidth: 5,
    borderLeftColor: "#22C55E",
  },
  nombre: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", textTransform: "capitalize" },
  descripcion: { color: "#A3A3A3", fontSize: 13, lineHeight: 19, marginTop: 4 },
  dato: { color: "#CFCFCF", fontSize: 13, marginTop: 5 },
  conEvidencia: { color: "#86EFAC", fontSize: 13, fontWeight: "700", marginTop: 5 },
  progreso: { height: 6, backgroundColor: "#1F1F1F", borderRadius: 3, marginTop: 10, overflow: "hidden" },
  barra: { height: 6, backgroundColor: "#22C55E" },
  viaje: {
    backgroundColor: "#0C0C0C",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#202020",
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
    padding: 14,
    marginBottom: 10,
  },
  viajeSinPersonal: { borderLeftColor: "#F59E0B" },
  viajePasado: { opacity: 0.6 },
  extra: { color: "#F59E0B" },
  numero: { color: "#7A7A7A", fontSize: 11, fontWeight: "800", textTransform: "uppercase", marginBottom: 4 },
  accion: { color: "#22C55E", fontSize: 14, fontWeight: "800", marginTop: 10 },
  editor: { marginTop: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderColor: "#232323",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActivo: { borderColor: "#22C55E", backgroundColor: "#0E1A12" },
  textoChip: { color: "#E5E5E5", fontSize: 13, fontWeight: "700" },
  botones: { flexDirection: "row", gap: 10, marginTop: 18 },
  boton: {
    flex: 1,
    backgroundColor: "#22C55E",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  espacio: { marginTop: 14 },
  botonSecundario: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#3F3F46",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  textoBoton: { color: "#051108", fontWeight: "900", fontSize: 15 },
  textoSecundario: { color: "#E5E5E5", fontWeight: "800", fontSize: 15 },
  deshabilitado: { opacity: 0.45 },
  error: {
    color: "#FCA5A5",
    backgroundColor: "#2A0E0E",
    borderWidth: 1,
    borderColor: "#7F1D1D",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    fontSize: 13,
  },
  exito: {
    color: "#BBF7D0",
    backgroundColor: "#0F1F15",
    borderWidth: 1,
    borderColor: "#166534",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    fontSize: 13,
  },
});
