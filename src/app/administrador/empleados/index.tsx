import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { estilosAdmin as estilos } from "@/constantes/estilosAdmin";

import {
    cambiarEstadoEmpleadoAdmin,
    consultarEmpleadosAdmin,
    type EmpleadoAdmin,
} from "@/servicios/admin.servicio";

export default function GestionarEmpleados() {

  const router = useRouter();

  const [empleados, setEmpleados] =
    useState<EmpleadoAdmin[]>([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargar() {

    setCargando(true);

    try {
      setEmpleados(
        await consultarEmpleadosAdmin()
      );

      setError("");

    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudieron cargar los empleados."
      );

    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  async function cambiarEstado(
    empleado: EmpleadoAdmin,
    estado: string
  ) {
    try {

      await cambiarEstadoEmpleadoAdmin(
        empleado.idEmpleado,
        estado
      );

      await cargar();

    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo cambiar el estado."
      );
    }
  }

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView
        contentContainerStyle={estilos.contenido}
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
            Gestionar empleados
          </Text>

          <Text style={estilos.subtitulo}>
            Consulta el personal y administra su estado.
          </Text>

        </View>

        {cargando ? (
          <ActivityIndicator
            color="#22C55E"
            size="large"
            style={estilos.cargando}
          />
        ) : (
          <View style={estilos.tarjeta}>

            <Text style={estilos.tituloTarjeta}>
              Personal registrado
            </Text>

            {empleados.map(empleado => (

              <View
                key={empleado.idEmpleado}
                style={estilos.registro}
              >

                <Text style={estilos.nombreRegistro}>
                  {empleado.nombre}
                </Text>

                <Text style={estilos.dato}>
                  Código: {empleado.codigoEmpleado}
                </Text>

                <Text style={estilos.dato}>
                  Tipo: {empleado.tipo}
                </Text>

                <Text style={estilos.dato}>
                  DUI: {empleado.dui}
                </Text>

                <Text style={estilos.dato}>
                  Estado: {empleado.estado}
                </Text>

                <Text style={estilos.dato}>
                  Sueldo: ${empleado.sueldo.toFixed(2)}
                </Text>

                <View style={estilos.filaBotones}>

                  {[
                    "Activo",
                    "Inactivo",
                    "Suspendido"
                  ].map(estado => (

                    <Pressable
                      key={estado}
                      style={estilos.botonSecundario}
                      onPress={() =>
                        cambiarEstado(
                          empleado,
                          estado
                        )
                      }
                    >
                      <Text
                        style={
                          estilos.textoBotonSecundario
                        }
                      >
                        {estado}
                      </Text>
                    </Pressable>

                  ))}

                </View>

              </View>

            ))}

            <Pressable onPress={cargar}>
              <Text style={estilos.actualizar}>
                Actualizar empleados
              </Text>
            </Pressable>

          </View>
        )}

        {error ? (
          <Text style={[
            estilos.error,
            {
              marginHorizontal: 16
            }
          ]}>
            {error}
          </Text>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
}