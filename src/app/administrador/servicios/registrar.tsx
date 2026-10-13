import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { sinFecha } from "@/utilidades/textoFechado";

import { estilosAdmin as estilos } from "@/constantes/estilosAdmin";

import {
    consultarServiciosExternosAdmin,
    registrarServicioExternoAdmin,
    type ServicioExternoAdmin,
} from "@/servicios/admin.servicio";

export default function RegistrarServicioExterno() {

  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [pago, setPago] = useState("");
  const [direccion, setDireccion] = useState("");

  const [servicios, setServicios] =
    useState<ServicioExternoAdmin[]>([]);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargar() {
    try {
      setServicios(
        await consultarServiciosExternosAdmin()
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudieron cargar los servicios."
      );
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  async function guardar() {

    if (!nombre.trim()) {
      setError("Escribe el nombre del servicio.");
      return;
    }

    const pagoNumero =
      Number(pago.replace(",", "."));

    if (
      !Number.isFinite(pagoNumero) ||
      pagoNumero < 0
    ) {
      setError("El pago no es válido.");
      return;
    }

    setGuardando(true);
    setError("");
    setMensaje("");

    try {

      await registrarServicioExternoAdmin(
        nombre.trim(),
        pagoNumero,
        direccion.trim()
      );

      setNombre("");
      setPago("");
      setDireccion("");

      setMensaje(
        "Servicio externo registrado correctamente."
      );

      await cargar();

    } catch (e) {

      setError(
        e instanceof Error
          ? e.message
          : "No se pudo registrar el servicio."
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
            Servicios externos
          </Text>

          <Text style={estilos.subtitulo}>
            Registra servicios realizados fuera
            de las operaciones habituales.
          </Text>

        </View>

        <View style={estilos.tarjeta}>

          <Text style={estilos.tituloTarjeta}>
            Nuevo servicio externo
          </Text>

          <Text style={estilos.etiqueta}>
            Nombre
          </Text>

          <TextInput
            style={estilos.campo}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre del servicio"
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
            placeholder="Ejemplo: 150"
            placeholderTextColor="#6B7280"
          />

          <Text style={estilos.etiqueta}>
            Dirección
          </Text>

          <TextInput
            style={estilos.campo}
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Dirección del servicio"
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
                ? "Guardando..."
                : "Registrar servicio"}
            </Text>
          </Pressable>

        </View>

        <View style={estilos.tarjeta}>

          <Text style={estilos.tituloTarjeta}>
            Servicios registrados
          </Text>

          {servicios.length === 0 ? (

            <Text style={estilos.descripcion}>
              No tienes servicios externos registrados.
            </Text>

          ) : (

            servicios.map(servicio => (

              <View
                key={servicio.idServicioExt}
                style={estilos.registro}
              >

                <Text
                  style={estilos.nombreRegistro}
                >
                  {sinFecha(servicio.nombre)}
                </Text>

                <Text style={estilos.dato}>
                  Pago:
                  {" "}
                  ${servicio.cantidadPago.toFixed(2)}
                </Text>

                <Text style={estilos.dato}>
                  Dirección:
                  {" "}
                  {servicio.direccion ??
                    "No registrada"}
                </Text>

              </View>

            ))

          )}

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}