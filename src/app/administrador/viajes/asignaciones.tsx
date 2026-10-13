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

import {
  consultarCatalogosViajeAdmin,
  type CamionViaje,
  type EmpleadoViaje,
} from "@/servicios/admin.servicio";
import {
  consultarContratosAdmin,
  consultarViajesExtraAdmin,
  crearViajeExtraContrato,
  type ContratoAdmin,
  type ViajeExtraAdmin,
} from "@/servicios/viajes.servicio";
import { fechaConDia, fechaIso, leerFechaIso } from "@/utilidades/textoFechado";
import { tipoVisible } from "@/utilidades/tiposEmpleado";

function sumarDias(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fechaIso(fecha);
}

function leerPrecio(valor: string): number | null | undefined {
  const limpio = valor.trim().replace(",", ".");
  if (!limpio) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(limpio)) return undefined;
  return Number(limpio);
}

export default function ViajesExtra() {
  const router = useRouter();

  const [contratos, setContratos] = useState<ContratoAdmin[]>([]);
  const [empleados, setEmpleados] = useState<EmpleadoViaje[]>([]);
  const [camiones, setCamiones] = useState<CamionViaje[]>([]);
  const [extras, setExtras] = useState<ViajeExtraAdmin[]>([]);

  const [contrato, setContrato] = useState<number | null>(null);
  const [fecha, setFecha] = useState(sumarDias(0));
  const [camion, setCamion] = useState<number | null>(null);
  const [personal, setPersonal] = useState<number[]>([]);
  const [motivo, setMotivo] = useState("");
  const [precio, setPrecio] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargar() {
    setCargando(true);
    try {
      const [listaContratos, catalogos, listaExtras] = await Promise.all([
        consultarContratosAdmin(),
        consultarCatalogosViajeAdmin(),
        consultarViajesExtraAdmin(),
      ]);
      setContratos(listaContratos);
      setEmpleados(catalogos.empleados);
      setCamiones(catalogos.camiones);
      setExtras(listaExtras);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la información.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  function alternar(id: number) {
    setPersonal(personal.includes(id) ? personal.filter(p => p !== id) : [...personal, id]);
  }

  async function guardar() {
    if (guardando) return;
    setMensaje("");

    if (contrato === null) return setError("Selecciona el contrato.");
    if (!leerFechaIso(fecha)) return setError("Escribe la fecha como AAAA-MM-DD.");
    if (camion === null) return setError("Selecciona el camión.");
    if (personal.length === 0) return setError("Selecciona al menos una persona.");
    if (motivo.trim().length < 3) return setError("Escribe el motivo del viaje extra.");
    const precioNumero = leerPrecio(precio);
    if (precioNumero === undefined) return setError("El precio debe ser un número con máximo dos decimales.");

    setGuardando(true);
    setError("");
    try {
      const resultado = await crearViajeExtraContrato(contrato, {
        fecha,
        idCamion: camion,
        idEmpleados: personal,
        motivo: motivo.trim(),
        precio: precioNumero,
      });
      setMensaje(resultado.mensaje);
      setMotivo("");
      setPrecio("");
      setPersonal([]);
      setExtras(await consultarViajesExtraAdmin());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el viaje extra.");
    } finally {
      setGuardando(false);
    }
  }

  const contratoActual = contratos.find(c => c.idServicioContrato === contrato);

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <View style={estilos.encabezado}>
          <Pressable onPress={() => router.replace("/administrador")}>
            <Text style={estilos.volver}>← Volver</Text>
          </Pressable>
          <Text style={estilos.titulo}>Viajes extra</Text>
          <Text style={estilos.subtitulo}>
            Un viaje imprevisto de un contrato. Aparece en el calendario del personal y se cobra aparte.
          </Text>
        </View>

        {cargando ? (
          <ActivityIndicator size="large" style={estilos.carga} />
        ) : (
          <>
            <View style={estilos.tarjeta}>
              <Text style={estilos.tituloTarjeta}>Nuevo viaje extra</Text>

              <Text style={estilos.etiqueta}>Contrato</Text>
              {contratos.length === 0 ? (
                <Text style={estilos.descripcion}>
                  No hay contratos. Se crean en la app de escritorio al aprobar una cotización.
                </Text>
              ) : (
                contratos.map(c => (
                  <Pressable
                    key={c.idServicioContrato}
                    onPress={() => setContrato(c.idServicioContrato)}
                    disabled={guardando}
                    style={[estilos.opcion, contrato === c.idServicioContrato && estilos.opcionSeleccionada]}
                  >
                    <Text style={estilos.nombre}>
                      {contrato === c.idServicioContrato ? "✓ " : ""}
                      {c.cliente}
                    </Text>
                    <Text style={estilos.descripcion}>
                      {c.servicio ?? "Servicio"} · {c.lugar}
                    </Text>
                  </Pressable>
                ))
              )}

              <Text style={estilos.etiqueta}>Fecha del viaje</Text>
              <View style={estilos.chips}>
                {[
                  ["Hoy", sumarDias(0)],
                  ["Mañana", sumarDias(1)],
                  ["Pasado mañana", sumarDias(2)],
                ].map(([texto, valor]) => (
                  <Pressable
                    key={texto}
                    onPress={() => setFecha(valor)}
                    style={[estilos.chip, fecha === valor && estilos.chipActivo]}
                  >
                    <Text style={estilos.textoChip}>{texto}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                style={estilos.campo}
                value={fecha}
                onChangeText={setFecha}
                placeholder="AAAA-MM-DD"
                placeholderTextColor="#6B7280"
                maxLength={10}
                editable={!guardando}
              />
              <Text style={estilos.ayuda}>{fechaConDia(fecha)}</Text>

              <Text style={estilos.etiqueta}>Camión</Text>
              {camiones.length === 0 ? (
                <Text style={estilos.descripcion}>No hay camiones registrados.</Text>
              ) : (
                <View style={estilos.chips}>
                  {camiones.map(c => (
                    <Pressable
                      key={c.idCamion}
                      onPress={() => setCamion(c.idCamion)}
                      style={[estilos.chip, camion === c.idCamion && estilos.chipActivo]}
                    >
                      <Text style={estilos.textoChip}>{c.nombre ?? c.placa}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <Text style={estilos.etiqueta}>Personal</Text>
              {empleados.map(e => {
                const activo = personal.includes(e.idEmpleado);
                return (
                  <Pressable
                    key={e.idEmpleado}
                    onPress={() => alternar(e.idEmpleado)}
                    disabled={guardando}
                    style={[estilos.opcion, activo && estilos.opcionSeleccionada]}
                  >
                    <Text style={estilos.nombre}>
                      {activo ? "✓ " : ""}
                      {e.nombre}
                    </Text>
                    <Text style={estilos.descripcion}>
                      {tipoVisible(e.tipo)} · {e.codigoEmpleado}
                    </Text>
                  </Pressable>
                );
              })}

              <Text style={estilos.etiqueta}>Motivo</Text>
              <TextInput
                style={estilos.campo}
                value={motivo}
                onChangeText={setMotivo}
                placeholder="Ejemplo: Material adicional en obra"
                placeholderTextColor="#6B7280"
                maxLength={40}
                editable={!guardando}
              />

              <Text style={estilos.etiqueta}>Precio del viaje extra (opcional)</Text>
              <TextInput
                style={estilos.campo}
                value={precio}
                onChangeText={setPrecio}
                placeholder="Ejemplo: 45.00"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
                editable={!guardando}
              />

              {error ? <Text style={estilos.error}>{error}</Text> : null}
              {mensaje ? <Text style={estilos.exito}>{mensaje}</Text> : null}

              <Pressable
                style={[estilos.boton, (guardando || !contratoActual) && estilos.deshabilitado]}
                onPress={guardar}
                disabled={guardando || contratos.length === 0}
              >
                <Text style={estilos.textoBoton}>
                  {guardando ? "Guardando..." : "Crear viaje extra"}
                </Text>
              </Pressable>
            </View>

            <View style={estilos.tarjeta}>
              <Text style={estilos.tituloTarjeta}>Viajes extra registrados</Text>
              {extras.length === 0 ? (
                <Text style={estilos.descripcion}>Todavía no hay viajes extra.</Text>
              ) : (
                extras.map(extra => (
                  <View key={extra.idViajeExtra} style={estilos.registro}>
                    <Text style={estilos.nombre}>{fechaConDia(extra.viaje.fecha)}</Text>
                    <Text style={estilos.descripcion}>
                      {extra.viaje.cliente ?? "Cliente"} · {extra.viaje.destino}
                    </Text>
                    <Text style={estilos.dato}>{extra.viaje.tipo}</Text>
                    <Text style={estilos.dato}>
                      Personal: {extra.viaje.personal.map(p => p.nombre).join(", ") || "—"}
                    </Text>
                    <Text style={estilos.dato}>Camión: {extra.viaje.camion ?? "—"}</Text>
                    {extra.precio !== null ? (
                      <Text style={estilos.dato}>Precio: ${Number(extra.precio).toFixed(2)}</Text>
                    ) : null}
                  </View>
                ))
              )}
              <Pressable onPress={cargar}>
                <Text style={estilos.actualizar}>Actualizar</Text>
              </Pressable>
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
  titulo: { color: "#FFFFFF", fontSize: 29, fontWeight: "900", letterSpacing: -0.5 },
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
  tituloTarjeta: { fontSize: 19, fontWeight: "900", color: "#22C55E", marginBottom: 8 },
  etiqueta: { color: "#E5E5E5", fontSize: 14, fontWeight: "800", marginTop: 16, marginBottom: 10 },
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
  ayuda: { color: "#86EFAC", fontSize: 12, marginTop: 6, textTransform: "capitalize" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  chip: {
    borderWidth: 1.5,
    borderColor: "#232323",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActivo: { borderColor: "#22C55E", backgroundColor: "#0E1A12" },
  textoChip: { color: "#E5E5E5", fontSize: 13, fontWeight: "700" },
  campo: {
    backgroundColor: "#0C0C0C",
    borderWidth: 1.5,
    borderColor: "#232323",
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 15,
    color: "#FFFFFF",
  },
  boton: {
    backgroundColor: "#22C55E",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 18,
  },
  deshabilitado: { opacity: 0.45 },
  textoBoton: { color: "#051108", fontWeight: "900", fontSize: 15 },
  registro: {
    backgroundColor: "#0C0C0C",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#202020",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    padding: 14,
    marginTop: 10,
  },
  actualizar: {
    textAlign: "center",
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 18,
    paddingVertical: 8,
  },
  error: {
    color: "#FCA5A5",
    backgroundColor: "#2A0E0E",
    borderWidth: 1,
    borderColor: "#7F1D1D",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    fontSize: 13,
  },
  exito: {
    color: "#BBF7D0",
    backgroundColor: "#0F1F15",
    borderWidth: 1,
    borderColor: "#166534",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    fontSize: 13,
  },
});
