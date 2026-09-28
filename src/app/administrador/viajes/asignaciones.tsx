import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { estilosAdmin as estilos } from "@/constantes/estilosAdmin";

import {
    consultarCatalogosViajeAdmin,
    consultarViajesAdmin,
    crearViajeAdmin,
    type CatalogosViaje,
    type ViajeAdmin,
} from "@/servicios/admin.servicio";

function numeroOpcional(
  valor: string
): number | null {

  if (!valor.trim())
    return null;

  const numero =
    Number(valor.replace(",", "."));

  return Number.isFinite(numero)
    ? numero
    : null;
}

export default function AsignacionesViajes() {

  const router = useRouter();

  const [catalogos, setCatalogos] =
    useState<CatalogosViaje | null>(null);

  const [viajes, setViajes] =
    useState<ViajeAdmin[]>([]);

  const [idCliente, setIdCliente] =
    useState<number | null>(null);

  const [idCamion, setIdCamion] =
    useState<number | null>(null);

  const [empleados, setEmpleados] =
    useState<number[]>([]);

  const [tipo, setTipo] = useState("");
  const [precio, setPrecio] = useState("");
  const [pago, setPago] = useState("");
  const [cantidad, setCantidad] = useState("1");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargar() {

    setCargando(true);

    try {

      const [datosCatalogos, datosViajes] =
        await Promise.all([
          consultarCatalogosViajeAdmin(),
          consultarViajesAdmin(),
        ]);

      setCatalogos(datosCatalogos);
      setViajes(datosViajes);

      setError("");

    } catch (e) {

      setError(
        e instanceof Error
          ? e.message
          : "No se pudieron cargar los datos."
      );

    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  function alternarEmpleado(
    idEmpleado: number
  ) {

    setEmpleados(actuales =>
      actuales.includes(idEmpleado)
        ? actuales.filter(
            id => id !== idEmpleado
          )
        : [...actuales, idEmpleado]
    );
  }

  async function guardar() {

    if (
      idCliente === null ||
      idCamion === null ||
      empleados.length === 0 ||
      !tipo.trim()
    ) {
      setError(
        "Selecciona cliente, camión, empleados y tipo de viaje."
      );

      return;
    }

    const cantidadNumero =
      Number(cantidad);

    if (
      !Number.isInteger(cantidadNumero) ||
      cantidadNumero <= 0
    ) {
      setError("La cantidad no es válida.");
      return;
    }

    const precioNumero =
      numeroOpcional(precio);

    const pagoNumero =
      numeroOpcional(pago);

    setGuardando(true);
    setError("");
    setMensaje("");

    try {

      const respuesta =
        await crearViajeAdmin({
          idCliente,
          idCamion,
          tipo: tipo.trim(),
          precio: precioNumero,
          pagoMonto: pagoNumero,
          cantidad: cantidadNumero,
          idEmpleados: empleados,
        });

      setMensaje(respuesta.mensaje);

      setIdCliente(null);
      setIdCamion(null);
      setEmpleados([]);
      setTipo("");
      setPrecio("");
      setPago("");
      setCantidad("1");

      await cargar();

    } catch (e) {

      setError(
        e instanceof Error
          ? e.message
          : "No se pudo crear el viaje."
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
            onPress={() =>
              router.replace("/administrador")
            }
          >
            <Text style={estilos.volver}>
              ← Volver
            </Text>
          </Pressable>

          <Text style={estilos.titulo}>
            Crear y asignar viaje
          </Text>

          <Text style={estilos.subtitulo}>
            Crea el viaje extra y asigna el personal
            responsable.
          </Text>

        </View>

        {cargando ? (

          <ActivityIndicator
            size="large"
            color="#22C55E"
            style={estilos.cargando}
          />

        ) : catalogos ? (

          <>

            <View style={estilos.tarjeta}>

              <Text style={estilos.tituloTarjeta}>
                Nuevo viaje
              </Text>

              <Text style={estilos.etiqueta}>
                Cliente
              </Text>

              {catalogos.clientes.map(cliente => (

                <Pressable
                  key={cliente.idCliente}
                  style={[
                    estilos.opcion,
                    idCliente === cliente.idCliente &&
                      estilos.opcionSeleccionada
                  ]}
                  onPress={() =>
                    setIdCliente(
                      cliente.idCliente
                    )
                  }
                >
                  <Text style={estilos.textoOpcion}>
                    {idCliente === cliente.idCliente
                      ? "✓ "
                      : ""}

                    {cliente.nombre}
                  </Text>

                  <Text style={estilos.descripcion}>
                    {cliente.tipo}
                  </Text>
                </Pressable>

              ))}

              <Text style={estilos.etiqueta}>
                Camión
              </Text>

              {catalogos.camiones.map(camion => (

                <Pressable
                  key={camion.idCamion}
                  style={[
                    estilos.opcion,
                    idCamion === camion.idCamion &&
                      estilos.opcionSeleccionada
                  ]}
                  onPress={() =>
                    setIdCamion(camion.idCamion)
                  }
                >
                  <Text style={estilos.textoOpcion}>
                    {idCamion === camion.idCamion
                      ? "✓ "
                      : ""}

                    {camion.nombre ?? "Camión"}
                  </Text>

                  <Text style={estilos.descripcion}>
                    Placa: {camion.placa}
                  </Text>
                </Pressable>

              ))}

              <Text style={estilos.etiqueta}>
                Personal asignado
              </Text>

              {catalogos.empleados.map(
                empleado => {

                  const seleccionado =
                    empleados.includes(
                      empleado.idEmpleado
                    );

                  return (
                    <Pressable
                      key={empleado.idEmpleado}
                      style={[
                        estilos.opcion,
                        seleccionado &&
                          estilos.opcionSeleccionada
                      ]}
                      onPress={() =>
                        alternarEmpleado(
                          empleado.idEmpleado
                        )
                      }
                    >
                      <Text
                        style={estilos.textoOpcion}
                      >
                        {seleccionado
                          ? "✓ "
                          : ""}

                        {empleado.nombre}
                      </Text>

                      <Text
                        style={estilos.descripcion}
                      >
                        {empleado.tipo} ·
                        {" "}
                        {empleado.codigoEmpleado}
                      </Text>

                    </Pressable>
                  );
                }
              )}

              <Text style={estilos.etiqueta}>
                Tipo de viaje
              </Text>

              <TextInput
                style={estilos.campo}
                value={tipo}
                onChangeText={setTipo}
                placeholder="Ejemplo: Recolección especial"
                placeholderTextColor="#6B7280"
              />

              <Text style={estilos.etiqueta}>
                Precio
              </Text>

              <TextInput
                style={estilos.campo}
                value={precio}
                onChangeText={setPrecio}
                keyboardType="decimal-pad"
                placeholder="Opcional"
                placeholderTextColor="#6B7280"
              />

              <Text style={estilos.etiqueta}>
                Pago
              </Text>

              <TextInput
                style={estilos.campo}
                value={pago}
                onChangeText={setPago}
                keyboardType="decimal-pad"
                placeholder="Opcional"
                placeholderTextColor="#6B7280"
              />

              <Text style={estilos.etiqueta}>
                Cantidad
              </Text>

              <TextInput
                style={estilos.campo}
                value={cantidad}
                onChangeText={setCantidad}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor="#6B7280"
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
                  guardando &&
                    estilos.deshabilitado
                ]}
                disabled={guardando}
                onPress={guardar}
              >
                <Text style={estilos.textoBoton}>
                  {guardando
                    ? "Creando viaje..."
                    : "Crear y asignar viaje"}
                </Text>
              </Pressable>

            </View>

            <View style={estilos.tarjeta}>

              <Text style={estilos.tituloTarjeta}>
                Viajes creados
              </Text>

              {viajes.length === 0 ? (

                <Text style={estilos.descripcion}>
                  Todavía no has creado viajes.
                </Text>

              ) : (

                viajes.map(viaje => (

                  <View
                    key={viaje.idViajeExtra}
                    style={estilos.registro}
                  >
                    <Text
                      style={estilos.nombreRegistro}
                    >
                      Viaje #{viaje.idViajeExtra}
                    </Text>
                    <Text style={estilos.dato}>
                      Cliente: {viaje.cliente}
                    </Text>
                    <Text style={estilos.dato}>
                      Camión: {viaje.camion}
                      {" · "}
                      {viaje.placa}
                    </Text>
                    <Text style={estilos.dato}>
                      Tipo: {viaje.tipo}
                    </Text>
                    <Text style={estilos.dato}>
                      Cantidad: {viaje.cantidad}
                    </Text>
                    <Text style={estilos.dato}>
                      Asignados:
                      {" "}
                      {viaje.empleados.length === 0
                        ? "Ninguno"
                        : viaje.empleados
                            .map(e => e.nombre)
                            .join(", ")}
                    </Text>
                  </View>

                ))

              )}

            </View>
          </>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
}