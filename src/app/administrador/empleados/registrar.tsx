import { useRouter } from "expo-router";
import { useState } from "react";

import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { estilosAdmin as estilos } from "@/constantes/estilosAdmin";

import {
    registrarEmpleadoAdmin,
} from "@/servicios/admin.servicio";

const tipos = [
  "Motorista",
  "Tecnico",
  "Ayudante",
  "Mecanico",
  "Coordinador",
];

export default function RegistrarEmpleado() {

  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [dui, setDui] = useState("");
  const [telefono, setTelefono] = useState("");
  const [sueldo, setSueldo] = useState("");
  const [fechaIngreso, setFechaIngreso] =
    useState(new Date().toISOString().slice(0, 10));

  const [codigoAf, setCodigoAf] = useState("");
  const [tipo, setTipo] = useState("Motorista");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function guardar() {

    if (
      !nombre.trim() ||
      !dui.trim() ||
      !sueldo.trim()
    ) {
      setError("Completa los campos obligatorios.");
      return;
    }

    const sueldoNumero = Number(
      sueldo.replace(",", ".")
    );

    if (
      !Number.isFinite(sueldoNumero) ||
      sueldoNumero < 0
    ) {
      setError("El sueldo no es válido.");
      return;
    }

    setGuardando(true);
    setError("");
    setMensaje("");

    try {

      const respuesta =
        await registrarEmpleadoAdmin({
          nombre: nombre.trim(),
          dui: dui.trim(),
          telefono: telefono.trim(),
          sueldo: sueldoNumero,
          fechaIngreso,
          codigoAf: codigoAf.trim(),
          tipo,
        });

      setMensaje(
        `Empleado creado. Código de acceso: ${respuesta.codigoEmpleado}`
      );

      setNombre("");
      setDui("");
      setTelefono("");
      setSueldo("");
      setCodigoAf("");

    } catch (e) {

      setError(
        e instanceof Error
          ? e.message
          : "No se pudo registrar el empleado."
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
            Registrar empleado
          </Text>

          <Text style={estilos.subtitulo}>
            Crea una nueva cuenta para el personal.
          </Text>

        </View>

        <View style={estilos.tarjeta}>

          <Text style={estilos.tituloTarjeta}>
            Datos del empleado
          </Text>

          <Text style={estilos.etiqueta}>
            Nombre completo
          </Text>

          <TextInput
            style={estilos.campo}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre completo"
            placeholderTextColor="#6B7280"
          />

          <Text style={estilos.etiqueta}>
            DUI
          </Text>

          <TextInput
            style={estilos.campo}
            value={dui}
            onChangeText={setDui}
            placeholder="00000000-0"
            placeholderTextColor="#6B7280"
          />

          <Text style={estilos.etiqueta}>
            Teléfono
          </Text>

          <TextInput
            style={estilos.campo}
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            placeholder="Opcional"
            placeholderTextColor="#6B7280"
          />

          <Text style={estilos.etiqueta}>
            Sueldo
          </Text>

          <TextInput
            style={estilos.campo}
            value={sueldo}
            onChangeText={setSueldo}
            keyboardType="decimal-pad"
            placeholder="Ejemplo: 500"
            placeholderTextColor="#6B7280"
          />

          <Text style={estilos.etiqueta}>
            Fecha de ingreso
          </Text>

          <TextInput
            style={estilos.campo}
            value={fechaIngreso}
            onChangeText={setFechaIngreso}
            placeholder="AAAA-MM-DD"
            placeholderTextColor="#6B7280"
          />

          <Text style={estilos.etiqueta}>
            Código AF
          </Text>

          <TextInput
            style={estilos.campo}
            value={codigoAf}
            onChangeText={setCodigoAf}
            placeholder="Opcional"
            placeholderTextColor="#6B7280"
          />

          <Text style={estilos.etiqueta}>
            Tipo de empleado
          </Text>

          {tipos.map(opcion => (
            <Pressable
              key={opcion}
              style={[
                estilos.opcion,
                tipo === opcion &&
                  estilos.opcionSeleccionada
              ]}
              onPress={() => setTipo(opcion)}
            >
              <Text style={estilos.textoOpcion}>
                {tipo === opcion ? "✓ " : ""}
                {opcion}
              </Text>
            </Pressable>
          ))}

          <Text style={estilos.ayuda}>
            SACOR generará automáticamente el código
            de acceso del empleado.
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
              guardando && estilos.deshabilitado
            ]}
            disabled={guardando}
            onPress={guardar}
          >
            <Text style={estilos.textoBoton}>
              {guardando
                ? "Guardando..."
                : "Registrar empleado"}
            </Text>
          </Pressable>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}