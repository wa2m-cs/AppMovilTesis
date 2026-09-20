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
    backgroundColor: "#0A0A0A",
  },

  contenido: {
    paddingBottom: 42,
    flexGrow: 1,
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
    letterSpacing: -0.5,
  },

  subtitulo: {
    color: "#B5B5B5",
    fontSize: 14,
    marginTop: 10,
    lineHeight: 21,
  },

  tarjeta: {
    backgroundColor: "#111111",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 22,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#1F1F1F",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },

  tituloSeccion: {
    color: "#22C55E",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F1F",
  },

  nombre: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },

  descripcion: {
    color: "#A3A3A3",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 6,
  },

  registro: {
    backgroundColor: "#0C0C0C",
    borderWidth: 1,
    borderColor: "#202020",
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 16,
    marginBottom: 12,
  },

  boton: {
    backgroundColor: "#22C55E",
    marginHorizontal: 16,
    marginTop: 22,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22C55E",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  textoBoton: {
    color: "#051108",
    fontSize: 15,
    fontWeight: "900",
  },

  cargando: {
    marginTop: 35,
  },

  error: {
    color: "#FCA5A5",
    backgroundColor: "#2A0E0E",
    borderWidth: 1,
    borderColor: "#7F1D1D",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 20,
    overflow: "hidden",
  },

});