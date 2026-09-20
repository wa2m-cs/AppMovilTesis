import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { colores } from "@/constantes/colores";

import {
  consultarTransportista,
  type InicioTransportistaRespuesta,
} from "@/servicios/transportista.servicio";

export default function HistorialTransportista() {

  const router = useRouter();
  const [datos, setDatos] =
    useState<InicioTransportistaRespuesta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargar() {
    setCargando(true);
    setError("");

    try {
      const respuesta = await consultarTransportista();
      setDatos(respuesta);

    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo consultar la información."
      );

    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  return (

    <SafeAreaView style={estilos.pantalla}>

      <ScrollView contentContainerStyle={estilos.contenido}>

        <View style={estilos.encabezado}>

          <Pressable
            onPress={() => router.replace("/transportista")}
          >

            <Text style={estilos.volver}>
              ← Volver
            </Text>

          </Pressable>

          <Text style={estilos.titulo}>
            Mis viajes
          </Text>

          <Text style={estilos.subtitulo}>
            Consulta tus asignaciones y recorridos registrados.
          </Text>

        </View>

        {cargando ? (

          <ActivityIndicator
            size="large"
            style={estilos.cargando}
          />

        ) : (

          <>

            {error ? (

              <Text style={estilos.error}>
                {error}
              </Text>

            ) : null}

            {datos ? (

              <>

                {/* Datos propios del empleado */}

                <View style={estilos.tarjeta}>

                  <Text style={estilos.tituloSeccion}>
                    Transportista
                  </Text>

                  <Text style={estilos.nombre}>
                    {datos.empleado.nombre}
                  </Text>

                  <Text style={estilos.descripcion}>
                    Código: {datos.empleado.codigoEmpleado}
                  </Text>

                </View>

                {/* Estos son los viajes extra en los que ha sigo designado */}

                <View style={estilos.tarjeta}>

                  <Text style={estilos.tituloSeccion}>
                    Viajes extra asignados
                  </Text>

                  {datos.viajesExtra.length === 0 ? (

                    <Text style={estilos.descripcion}>
                      No tienes viajes extra asignados.
                    </Text>

                  ) : (

                    datos.viajesExtra.map(viaje => (

                      <View
                        key={viaje.idViajeExtra}
                        style={estilos.registro}
                      >

                        <Text style={estilos.nombre}>
                          Viaje #{viaje.idViajeExtra}
                        </Text>

                        <Text style={estilos.descripcion}>
                          Tipo: {viaje.tipo ?? "No especificado"}
                        </Text>

                        <Text style={estilos.descripcion}>
                          Camión: #{viaje.idCamion}
                        </Text>

                        <Text style={estilos.descripcion}>
                          Cantidad: {viaje.cantidad ?? "No registrada"}
                        </Text>

                      </View>

                    ))

                  )}

                </View>

                {/* Estás son las rutas asignadas */}

                <View style={estilos.tarjeta}>

                  <Text style={estilos.tituloSeccion}>
                    Mis rutas
                  </Text>

                  {datos.rutas.length === 0 ? (

                    <Text style={estilos.descripcion}>
                      No tienes rutas asignadas.
                    </Text>

                  ) : (

                    datos.rutas.map(ruta => (

                      <View
                        key={ruta.idRutaEmpleado}
                        style={estilos.registro}
                      >

                        <Text style={estilos.nombre}>
                          {ruta.destino}
                        </Text>

                        <Text style={estilos.descripcion}>
                          Ruta #{ruta.idRutaTrabajo}
                        </Text>

                        <Text style={estilos.descripcion}>
                          Tipo: {ruta.tipo ?? "No especificado"}
                        </Text>

                      </View>

                    ))

                  )}

                </View>

                {/* Aquí van los camiones que él ha conducido, puede ser actual o anteriores */}

                <View style={estilos.tarjeta}>

                  <Text style={estilos.tituloSeccion}>
                    Mis camiones
                  </Text>

                  {datos.camiones.length === 0 ? (

                    <Text style={estilos.descripcion}>
                      No tienes camiones asignados.
                    </Text>

                  ) : (

                    datos.camiones.map(camion => (

                      <View
                        key={camion.idCamionConductor}
                        style={estilos.registro}
                      >

                        <Text style={estilos.nombre}>
                          {camion.nombre ?? "Camión"}
                        </Text>

                        <Text style={estilos.descripcion}>
                          Placa: {camion.placa}
                        </Text>

                        <Text style={estilos.descripcion}>
                          Estado: {camion.estado ?? "No registrado"}
                        </Text>

                        <Text style={estilos.descripcion}>
                          Fecha de asignación: {camion.fecha.slice(0, 10)}
                        </Text>

                      </View>

                    ))

                  )}

                </View>

              </>

            ) : null}

          </>

        )}

        <Pressable
          style={estilos.boton}
          onPress={cargar}
          disabled={cargando}
        >

          <Text style={estilos.textoBoton}>
            Actualizar información
          </Text>

        </Pressable>

      </ScrollView>

    </SafeAreaView>

  );
}

const estilos = StyleSheet.create({

  pantalla: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  contenido: {
    paddingBottom: 35,
  },

  encabezado: {
    backgroundColor: colores.fondo,
    padding: 25,
  },

  volver: {
    color: colores.blanco,
    marginBottom: 20,
  },

  titulo: {
    color: colores.blanco,
    fontSize: 28,
    fontWeight: "800",
  },

  subtitulo: {
    color: "#CBD5E1",
    marginTop: 8,
  },

  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: 16,
    padding: 20,
    margin: 18,
    marginBottom: 0,
  },

  tituloSeccion: {
    color: colores.titulo,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
  },

  nombre: {
    color: colores.titulo,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },

  descripcion: {
    color: colores.textoSecundario,
    fontSize: 14,
    marginBottom: 6,
  },

  registro: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 12,
  },

  boton: {
    backgroundColor: colores.primario,
    margin: 18,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  textoBoton: {
    color: colores.blanco,
    fontWeight: "700",
  },

  cargando: {
    marginTop: 35,
  },

  error: {
    color: "#DC2626",
    margin: 20,
  },

});