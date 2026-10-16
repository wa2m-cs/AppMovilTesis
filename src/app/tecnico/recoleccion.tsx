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
import SelectorFotos, { type FotoSeleccionada } from "@/componentes/evidencias/SelectorFotos";
import SelectorViaje from "@/componentes/viajes/SelectorViaje";
import { subirFotosEvidencia } from "@/servicios/evidencias.servicio";
import {
  conceptoVisible,
  consultarMateriales,
  consultarRegistrosTecnico,
  registrarRecoleccion,
  type Material,
  type RegistroViaje,
} from "@/servicios/recoleccion.servicio";
import { consultarMisViajes, viajesDeHoy, type Viaje } from "@/servicios/viajes.servicio";
import { estaEnJornada } from "@/servicios/horarios.servicio";
import { fechaConDia, fechaIso } from "@/utilidades/textoFechado";

interface FilaCarga {
  idPrecioLugar: number | null;
  toneladas: string;
}

interface FilaGasto {
  concepto: string | null;
  monto: string;
  descripcion: string;
}

function leerNumero(valor: string): number | null {
  const limpio = valor.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(limpio)) return null;
  const numero = Number(limpio);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

function usd(valor: number): string {
  return `$${valor.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Recoleccion() {
  const router = useRouter();

  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [enJornada, setEnJornada] = useState(true);
  const [hoy, setHoy] = useState(fechaIso(new Date()));
  const [viaje, setViaje] = useState<number | null>(null);

  const [materiales, setMateriales] = useState<Material[]>([]);
  const [conceptos, setConceptos] = useState<string[]>([]);
  const [cargandoMateriales, setCargandoMateriales] = useState(false);

  const [cargas, setCargas] = useState<FilaCarga[]>([{ idPrecioLugar: null, toneladas: "" }]);
  const [gastos, setGastos] = useState<FilaGasto[]>([]);
  const [observacion, setObservacion] = useState("");
  const [fotos, setFotos] = useState<FotoSeleccionada[]>([]);

  const [registros, setRegistros] = useState<RegistroViaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarDatos() {
    setCargando(true);
    try {
      const [misViajes, lista] = await Promise.all([consultarMisViajes(), consultarRegistrosTecnico()]);
      setHoy(misViajes.hoy);
      const jornada = await estaEnJornada(misViajes.hoy);
      setEnJornada(jornada);
      setViajes(jornada ? viajesDeHoy(misViajes.viajes, misViajes.hoy) : []);
      setRegistros(lista);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la información.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargarDatos();
  }, []);

  async function elegirViaje(idRutaTrabajo: number) {
    setViaje(idRutaTrabajo);
    setMensaje("");
    setCargandoMateriales(true);
    try {
      const catalogo = await consultarMateriales(idRutaTrabajo);
      setMateriales(catalogo.materiales);
      setConceptos(catalogo.conceptosGasto);
      setCargas([{ idPrecioLugar: catalogo.materiales[0]?.idPrecioLugar ?? null, toneladas: "" }]);
      setError("");
    } catch (e) {
      setMateriales([]);
      setError(e instanceof Error ? e.message : "No se pudieron cargar los materiales.");
    } finally {
      setCargandoMateriales(false);
    }
  }

  function cambiarCarga(indice: number, cambio: Partial<FilaCarga>) {
    setCargas(cargas.map((c, i) => (i === indice ? { ...c, ...cambio } : c)));
  }

  function cambiarGasto(indice: number, cambio: Partial<FilaGasto>) {
    setGastos(gastos.map((g, i) => (i === indice ? { ...g, ...cambio } : g)));
  }

  const precioDe = (id: number | null) => materiales.find(m => m.idPrecioLugar === id)?.precio ?? 0;

  const cargasValidas = cargas
    .map(c => ({ idPrecioLugar: c.idPrecioLugar, toneladas: leerNumero(c.toneladas) }))
    .filter((c): c is { idPrecioLugar: number; toneladas: number } => c.idPrecioLugar !== null && c.toneladas !== null);
  const totalToneladas = cargasValidas.reduce((total, c) => total + c.toneladas, 0);
  const totalCobro = cargasValidas.reduce((total, c) => total + c.toneladas * precioDe(c.idPrecioLugar), 0);
  const totalGastos = gastos.reduce((total, g) => total + (leerNumero(g.monto) ?? 0), 0);

  async function guardar() {
    if (guardando) return;
    setMensaje("");

    if (viaje === null) return setError("Selecciona el viaje.");

    const cargasEscritas = cargas.filter(c => c.toneladas.trim() !== "");
    if (cargasEscritas.some(c => c.idPrecioLugar === null || leerNumero(c.toneladas) === null || (leerNumero(c.toneladas) ?? 0) > 45)) {
      return setError("Revisa las cargas: elige el material y escribe toneladas entre 0.01 y 45.");
    }
    if (gastos.some(g => g.concepto === null || leerNumero(g.monto) === null)) {
      return setError("Revisa los gastos: elige el concepto y escribe un monto válido.");
    }
    if (cargasEscritas.length === 0 && gastos.length === 0 && !observacion.trim()) {
      return setError("Registra al menos una carga, un gasto o una observación.");
    }

    setGuardando(true);
    setError("");
    try {
      const resultado = await registrarRecoleccion({
        idRutaTrabajo: viaje,
        observacion: observacion.trim(),
        cargas: cargasEscritas.map(c => ({
          idPrecioLugar: c.idPrecioLugar as number,
          toneladas: leerNumero(c.toneladas) as number,
        })),
        gastos: gastos.map(g => ({
          concepto: g.concepto as string,
          monto: leerNumero(g.monto) as number,
          descripcion: g.descripcion.trim() || undefined,
        })),
      });

      const fallidas = await subirFotosEvidencia(resultado.idLimpieza, fotos.map(f => f.base64));

      setCargas([{ idPrecioLugar: materiales[0]?.idPrecioLugar ?? null, toneladas: "" }]);
      setGastos([]);
      setObservacion("");
      setFotos([]);

      await cargarDatos();

      if (fallidas > 0) {
        setError(`Se guardó, pero ${fallidas} foto(s) no se pudieron subir. Revisa tu conexión.`);
      } else {
        setMensaje(
          `${resultado.mensaje} ${resultado.toneladas} t · ${usd(resultado.totalCobrado)} · gastos ${usd(resultado.totalGastos)}`
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar la recolección.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <View style={estilos.encabezado}>
          <Pressable onPress={() => router.replace("/tecnico")}>
            <Text style={estilos.volver}>← Volver</Text>
          </Pressable>
          <Text style={estilos.titulo}>Recolección</Text>
          <Text style={estilos.subtitulo}>
            Registra las toneladas que se movieron y los gastos de cada viaje.
          </Text>
        </View>

        {cargando ? (
          <ActivityIndicator size="large" style={estilos.carga} />
        ) : (
          <View style={estilos.tarjeta}>
            <Text style={estilos.tituloTarjeta}>Nueva recolección</Text>

            <Text style={estilos.etiqueta}>Selecciona el viaje</Text>
            {!enJornada ? (
              <Text style={estilos.aviso}>
                Marca tu entrada en Horarios para registrar evidencias. Solo se muestran los viajes de hoy.
              </Text>
            ) : null}

            <SelectorViaje
              viajes={viajes}
              hoy={hoy}
              seleccionado={viaje}
              onSeleccionar={elegirViaje}
              deshabilitado={guardando}
            />

            {viaje !== null ? (
              cargandoMateriales ? (
                <ActivityIndicator size="small" style={estilos.carga} />
              ) : (
                <>
                  <Text style={estilos.seccion}>Carga movida</Text>
                  {materiales.length === 0 ? (
                    <Text style={estilos.descripcion}>
                      Este viaje no tiene contrato con precios, así que no se pueden registrar toneladas.
                    </Text>
                  ) : (
                    <>
                      {cargas.map((carga, indice) => {
                        const toneladas = leerNumero(carga.toneladas) ?? 0;
                        return (
                          <View key={indice} style={estilos.fila}>
                            <Text style={estilos.etiquetaPequena}>Material</Text>
                            <View style={estilos.chips}>
                              {materiales.map(m => (
                                <Pressable
                                  key={m.idPrecioLugar}
                                  onPress={() => cambiarCarga(indice, { idPrecioLugar: m.idPrecioLugar })}
                                  style={[estilos.chip, carga.idPrecioLugar === m.idPrecioLugar && estilos.chipActivo]}
                                >
                                  <Text style={estilos.textoChip}>
                                    {m.tipo} · {usd(m.precio)}/t
                                  </Text>
                                </Pressable>
                              ))}
                            </View>
                            <View style={estilos.linea}>
                              <TextInput
                                style={[estilos.campo, estilos.campoCorto]}
                                value={carga.toneladas}
                                onChangeText={texto => cambiarCarga(indice, { toneladas: texto })}
                                placeholder="Toneladas"
                                placeholderTextColor="#6B7280"
                                keyboardType="decimal-pad"
                                editable={!guardando}
                              />
                              <Text style={estilos.subtotal}>
                                = {usd(toneladas * precioDe(carga.idPrecioLugar))}
                              </Text>
                            </View>
                            {cargas.length > 1 ? (
                              <Pressable onPress={() => setCargas(cargas.filter((_, i) => i !== indice))}>
                                <Text style={estilos.quitar}>Quitar carga</Text>
                              </Pressable>
                            ) : null}
                          </View>
                        );
                      })}
                      <Pressable
                        onPress={() =>
                          setCargas([...cargas, { idPrecioLugar: materiales[0]?.idPrecioLugar ?? null, toneladas: "" }])
                        }
                        disabled={cargas.length >= 10}
                      >
                        <Text style={estilos.agregar}>+ Otro material</Text>
                      </Pressable>
                    </>
                  )}

                  <Text style={estilos.seccion}>Gastos del viaje</Text>
                  {gastos.length === 0 ? (
                    <Text style={estilos.descripcion}>Sin gastos registrados en este viaje.</Text>
                  ) : null}
                  {gastos.map((gasto, indice) => (
                    <View key={indice} style={estilos.fila}>
                      <View style={estilos.chips}>
                        {conceptos.map(c => (
                          <Pressable
                            key={c}
                            onPress={() => cambiarGasto(indice, { concepto: c })}
                            style={[estilos.chip, gasto.concepto === c && estilos.chipActivo]}
                          >
                            <Text style={estilos.textoChip}>{conceptoVisible(c)}</Text>
                          </Pressable>
                        ))}
                      </View>
                      <TextInput
                        style={estilos.campo}
                        value={gasto.monto}
                        onChangeText={texto => cambiarGasto(indice, { monto: texto })}
                        placeholder="Monto ($)"
                        placeholderTextColor="#6B7280"
                        keyboardType="decimal-pad"
                        editable={!guardando}
                      />
                      <TextInput
                        style={[estilos.campo, estilos.espacioArriba]}
                        value={gasto.descripcion}
                        onChangeText={texto => cambiarGasto(indice, { descripcion: texto })}
                        placeholder="Detalle (opcional)"
                        placeholderTextColor="#6B7280"
                        maxLength={250}
                        editable={!guardando}
                      />
                      <Pressable onPress={() => setGastos(gastos.filter((_, i) => i !== indice))}>
                        <Text style={estilos.quitar}>Quitar gasto</Text>
                      </Pressable>
                    </View>
                  ))}
                  <Pressable
                    onPress={() => setGastos([...gastos, { concepto: null, monto: "", descripcion: "" }])}
                    disabled={gastos.length >= 15}
                  >
                    <Text style={estilos.agregar}>+ Agregar gasto</Text>
                  </Pressable>

                  <View style={estilos.resumen}>
                    <Text style={estilos.datoResumen}>Toneladas: {totalToneladas.toFixed(2)} t</Text>
                    <Text style={estilos.datoResumen}>Se cobra: {usd(totalCobro)}</Text>
                    <Text style={estilos.datoResumen}>Gastos: {usd(totalGastos)}</Text>
                  </View>

                  <Text style={estilos.seccion}>Observaciones</Text>
                  <TextInput
                    style={[estilos.campo, estilos.campoLargo]}
                    multiline
                    textAlignVertical="top"
                    placeholder="Describe el trabajo realizado (opcional)"
                    placeholderTextColor="#6B7280"
                    value={observacion}
                    onChangeText={setObservacion}
                    maxLength={1000}
                    editable={!guardando}
                  />

                  <View style={estilos.espacioArriba}>
                    <SelectorFotos fotos={fotos} onCambiar={setFotos} onError={setError} deshabilitado={guardando} />
                  </View>
                </>
              )
            ) : null}

            {error ? <Text style={estilos.error}>{error}</Text> : null}
            {mensaje ? <Text style={estilos.exito}>{mensaje}</Text> : null}

            <Pressable
              style={[estilos.boton, (guardando || viaje === null) && estilos.deshabilitado]}
              disabled={guardando || viaje === null}
              onPress={guardar}
            >
              <Text style={estilos.textoBoton}>{guardando ? "Guardando..." : "Registrar recolección"}</Text>
            </Pressable>
          </View>
        )}

        <View style={estilos.tarjeta}>
          <Text style={estilos.tituloTarjeta}>Historial por viaje</Text>
          {registros.length === 0 ? (
            <Text style={estilos.descripcion}>No hay recolecciones registradas.</Text>
          ) : (
            registros.map(registro => {
              const toneladas = registro.cargas.reduce((t, c) => t + c.toneladas, 0);
              const cobro = registro.cargas.reduce((t, c) => t + c.monto, 0);
              const gastado = registro.gastos.reduce((t, g) => t + g.monto, 0);
              return (
                <View key={registro.idRutaTrabajo} style={estilos.registro}>
                  <Text style={estilos.nombre}>Viaje del {fechaConDia(registro.fecha)}</Text>
                  <Text style={estilos.descripcion}>
                    {registro.destino}
                    {registro.cliente ? ` · ${registro.cliente}` : ""}
                  </Text>
                  {registro.cargas.map((c, i) => (
                    <Text key={`c-${i}`} style={estilos.dato}>
                      {c.material}: {c.toneladas} t × {usd(c.precio)} = {usd(c.monto)}
                    </Text>
                  ))}
                  {registro.gastos.map((g, i) => (
                    <Text key={`g-${i}`} style={estilos.datoGasto}>
                      {conceptoVisible(g.concepto)}: {usd(g.monto)}
                      {g.descripcion ? ` (${g.descripcion})` : ""}
                    </Text>
                  ))}
                  <Text style={estilos.totales}>
                    {toneladas.toFixed(2)} t · cobro {usd(cobro)} · gastos {usd(gastado)}
                  </Text>
                  {registro.observaciones.map(o => (
                    <View key={o.idLimpieza}>
                      {o.observacion ? <Text style={estilos.descripcion}>{o.observacion}</Text> : null}
                      <GaleriaFotos fotos={o.fotos} />
                    </View>
                  ))}
                </View>
              );
            })
          )}
          <Pressable onPress={cargarDatos} disabled={cargando || guardando}>
            <Text style={estilos.actualizar}>Actualizar información</Text>
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
  carga: { marginVertical: 20 },
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
  etiqueta: { color: "#E5E5E5", fontSize: 14, fontWeight: "800", marginTop: 12, marginBottom: 10 },
  etiquetaPequena: { color: "#A3A3A3", fontSize: 12, fontWeight: "700", marginBottom: 8 },
  seccion: {
    color: "#22C55E",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 20,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "#1F1F1F",
    paddingTop: 16,
  },
  fila: {
    backgroundColor: "#0C0C0C",
    borderWidth: 1,
    borderColor: "#232323",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  linea: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  chip: {
    borderWidth: 1.5,
    borderColor: "#232323",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipActivo: { borderColor: "#22C55E", backgroundColor: "#0E1A12" },
  textoChip: { color: "#E5E5E5", fontSize: 13, fontWeight: "700" },
  campo: {
    backgroundColor: "#0A0A0A",
    borderWidth: 1.5,
    borderColor: "#232323",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: "#FFFFFF",
  },
  campoCorto: { flex: 1 },
  campoLargo: { minHeight: 110 },
  espacioArriba: { marginTop: 10 },
  subtotal: { color: "#86EFAC", fontSize: 15, fontWeight: "800", minWidth: 90, textAlign: "right" },
  quitar: { color: "#FCA5A5", fontSize: 13, fontWeight: "700", marginTop: 10 },
  agregar: { color: "#22C55E", fontSize: 14, fontWeight: "800", paddingVertical: 6 },
  resumen: {
    backgroundColor: "#0E1A12",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#166534",
    padding: 14,
    marginTop: 16,
  },
  datoResumen: { color: "#BBF7D0", fontSize: 14, fontWeight: "800", marginVertical: 2 },
  descripcion: { color: "#A3A3A3", fontSize: 13, lineHeight: 19, marginTop: 4 },
  nombre: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", textTransform: "capitalize" },
  dato: { color: "#CFCFCF", fontSize: 13, marginTop: 5 },
  datoGasto: { color: "#FCD34D", fontSize: 13, marginTop: 5 },
  totales: { color: "#86EFAC", fontSize: 13, fontWeight: "800", marginTop: 8 },
  registro: {
    backgroundColor: "#0C0C0C",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#202020",
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
    padding: 14,
    marginTop: 10,
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
