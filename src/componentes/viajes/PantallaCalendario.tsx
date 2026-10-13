import { useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { consultarMisViajes, type Viaje } from "@/servicios/viajes.servicio";
import {
  MESES_LARGOS,
  fechaConDia,
  fechaIso,
  leerFechaIso,
} from "@/utilidades/textoFechado";
import { tipoVisible } from "@/utilidades/tiposEmpleado";

interface Propiedades {
  rutaVolver: Href;
}

const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];

export default function PantallaCalendario({ rutaVolver }: Propiedades) {
  const router = useRouter();

  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [hoy, setHoy] = useState(fechaIso(new Date()));
  const [mes, setMes] = useState(() => {
    const ahora = new Date();
    return new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  });
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(fechaIso(new Date()));
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargar() {
    setCargando(true);
    try {
      const datos = await consultarMisViajes();
      setViajes(datos.viajes);
      setHoy(datos.hoy);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar tus viajes.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  const porDia = useMemo(() => {
    const mapa = new Map<string, Viaje[]>();
    for (const viaje of viajes) {
      if (!viaje.fecha) continue;
      mapa.set(viaje.fecha, [...(mapa.get(viaje.fecha) ?? []), viaje]);
    }
    return mapa;
  }, [viajes]);

  const celdas = useMemo(() => {
    const primerDia = (mes.getDay() + 6) % 7;
    const diasMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    const lista: (string | null)[] = Array.from({ length: primerDia }, () => null);
    for (let dia = 1; dia <= diasMes; dia++) {
      lista.push(fechaIso(new Date(mes.getFullYear(), mes.getMonth(), dia)));
    }
    while (lista.length % 7 !== 0) lista.push(null);
    return lista;
  }, [mes]);

  const proximos = viajes.filter(v => v.fecha && v.fecha >= hoy).slice(0, 5);
  const delDia = porDia.get(diaSeleccionado) ?? [];
  const sinFecha = viajes.filter(v => !v.fecha);
  const delMes = viajes.filter(v => {
    const f = leerFechaIso(v.fecha);
    return f !== null && f.getFullYear() === mes.getFullYear() && f.getMonth() === mes.getMonth();
  }).length;

  function cambiarMes(delta: number) {
    setMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1));
  }

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.encabezado}>
          <Pressable onPress={() => router.replace(rutaVolver)}>
            <Text style={estilos.volver}>← Volver</Text>
          </Pressable>
          <Text style={estilos.titulo}>Calendario de viajes</Text>
          <Text style={estilos.subtitulo}>
            Los viajes que te asignó el administrador, día por día.
          </Text>
        </View>

        {cargando ? (
          <ActivityIndicator size="large" style={estilos.carga} />
        ) : (
          <>
            {error ? <Text style={estilos.error}>{error}</Text> : null}

            <View style={estilos.tarjeta}>
              <View style={estilos.navegacion}>
                <Pressable onPress={() => cambiarMes(-1)} style={estilos.flecha}>
                  <Text style={estilos.textoFlecha}>‹</Text>
                </Pressable>
                <View style={estilos.centro}>
                  <Text style={estilos.mes}>
                    {MESES_LARGOS[mes.getMonth()]} {mes.getFullYear()}
                  </Text>
                  <Text style={estilos.resumenMes}>{delMes} viaje(s) este mes</Text>
                </View>
                <Pressable onPress={() => cambiarMes(1)} style={estilos.flecha}>
                  <Text style={estilos.textoFlecha}>›</Text>
                </Pressable>
              </View>

              <View style={estilos.semana}>
                {DIAS_SEMANA.map((dia, i) => (
                  <Text key={`${dia}-${i}`} style={estilos.diaSemana}>{dia}</Text>
                ))}
              </View>

              <View style={estilos.grilla}>
                {celdas.map((fecha, i) => {
                  if (!fecha) return <View key={`vacio-${i}`} style={estilos.celda} />;
                  const cantidad = porDia.get(fecha)?.length ?? 0;
                  const seleccionado = fecha === diaSeleccionado;
                  const esHoy = fecha === hoy;
                  return (
                    <Pressable
                      key={fecha}
                      style={[
                        estilos.celda,
                        esHoy && estilos.celdaHoy,
                        seleccionado && estilos.celdaSeleccionada,
                      ]}
                      onPress={() => setDiaSeleccionado(fecha)}
                    >
                      <Text style={[estilos.numeroDia, cantidad > 0 && estilos.numeroConViaje]}>
                        {Number(fecha.slice(8, 10))}
                      </Text>
                      {cantidad > 0 ? (
                        <View style={estilos.punto}>
                          {cantidad > 1 ? <Text style={estilos.textoPunto}>{cantidad}</Text> : null}
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={estilos.tarjeta}>
              <Text style={estilos.tituloTarjeta}>{fechaConDia(diaSeleccionado)}</Text>
              {delDia.length === 0 ? (
                <Text style={estilos.descripcion}>No tienes viajes este día.</Text>
              ) : (
                delDia.map(viaje => <TarjetaViaje key={viaje.idRutaTrabajo} viaje={viaje} />)
              )}
            </View>

            <View style={estilos.tarjeta}>
              <Text style={estilos.tituloTarjeta}>Próximos viajes</Text>
              {proximos.length === 0 ? (
                <Text style={estilos.descripcion}>No tienes viajes próximos.</Text>
              ) : (
                proximos.map(viaje => (
                  <Pressable
                    key={viaje.idRutaTrabajo}
                    onPress={() => {
                      const f = leerFechaIso(viaje.fecha);
                      if (f) {
                        setMes(new Date(f.getFullYear(), f.getMonth(), 1));
                        setDiaSeleccionado(viaje.fecha as string);
                      }
                    }}
                  >
                    <TarjetaViaje viaje={viaje} mostrarFecha />
                  </Pressable>
                ))
              )}
            </View>

            {sinFecha.length > 0 ? (
              <View style={estilos.tarjeta}>
                <Text style={estilos.tituloTarjeta}>Sin fecha</Text>
                {sinFecha.map(viaje => <TarjetaViaje key={viaje.idRutaTrabajo} viaje={viaje} />)}
              </View>
            ) : null}

            <Pressable onPress={cargar}>
              <Text style={estilos.actualizar}>Actualizar</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TarjetaViaje({ viaje, mostrarFecha = false }: { viaje: Viaje; mostrarFecha?: boolean }) {
  return (
    <View style={estilos.viaje}>
      {mostrarFecha ? <Text style={estilos.fechaViaje}>{fechaConDia(viaje.fecha)}</Text> : null}
      <Text style={estilos.destino}>{viaje.destino}</Text>
      {viaje.cliente ? <Text style={estilos.dato}>Cliente: {viaje.cliente}</Text> : null}
      {viaje.tipo ? <Text style={estilos.dato}>Servicio: {viaje.tipo}</Text> : null}
      <Text style={estilos.dato}>Camión: {viaje.camion ?? "Por definir"}</Text>
      <Text style={estilos.dato}>
        Equipo: {viaje.personal.map(p => `${p.nombre} (${tipoVisible(p.tipo)})`).join(", ") || "—"}
      </Text>
      <Text style={[estilos.dato, viaje.evidencias > 0 && estilos.conEvidencia]}>
        {viaje.evidencias > 0 ? `✓ ${viaje.evidencias} evidencia(s) registradas` : "Sin evidencias todavía"}
      </Text>
    </View>
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
  error: {
    color: "#FCA5A5",
    backgroundColor: "#2A0E0E",
    borderWidth: 1,
    borderColor: "#7F1D1D",
    borderRadius: 12,
    padding: 12,
    margin: 16,
    fontSize: 13,
  },
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
  navegacion: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  flecha: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  textoFlecha: { color: "#22C55E", fontSize: 30, fontWeight: "700" },
  centro: { flex: 1, alignItems: "center" },
  mes: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  resumenMes: { color: "#A3A3A3", fontSize: 12, marginTop: 2 },
  semana: { flexDirection: "row", marginBottom: 6 },
  diaSemana: { flex: 1, textAlign: "center", color: "#7A7A7A", fontSize: 12, fontWeight: "800" },
  grilla: { flexDirection: "row", flexWrap: "wrap" },
  celda: {
    width: "14.2857%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  celdaHoy: { borderWidth: 1.5, borderColor: "#22C55E" },
  celdaSeleccionada: { backgroundColor: "#14532D" },
  numeroDia: { color: "#A3A3A3", fontSize: 14, fontWeight: "600" },
  numeroConViaje: { color: "#FFFFFF", fontWeight: "900" },
  punto: {
    minWidth: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginTop: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  textoPunto: { color: "#051108", fontSize: 7, fontWeight: "900" },
  tituloTarjeta: {
    fontSize: 18,
    fontWeight: "900",
    color: "#22C55E",
    marginBottom: 14,
    textTransform: "capitalize",
  },
  descripcion: { color: "#A3A3A3", fontSize: 13, lineHeight: 20 },
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
  fechaViaje: { color: "#86EFAC", fontSize: 12, fontWeight: "800", marginBottom: 4, textTransform: "capitalize" },
  destino: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  dato: { color: "#CFCFCF", fontSize: 13, marginTop: 5, lineHeight: 19 },
  conEvidencia: { color: "#86EFAC", fontWeight: "700" },
  actualizar: {
    textAlign: "center",
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 20,
    paddingVertical: 8,
  },
});
