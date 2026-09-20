import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useRouter, type Href } from "expo-router";

import { colores } from "@/constantes/colores";

import { cerrarSesion } from "@/servicios/api";

// Propiedades del componente
interface PropiedadesInicio {
  titulo: string;
  descripcion: string;
  funciones: string[];
  rutas?: Href[];
}

export default function InicioRol({
  titulo,
  descripcion,
  funciones,
  rutas = [],
}: PropiedadesInicio) {

  const router = useRouter();

  const volver = async () => {
    try {
      await cerrarSesion();
    } catch (error) {
      console.warn("No se pudo cerrar la sesión, intente de nuevo.");
    } finally {
      router.replace("/activacion");
    }

  };

  return (
    <SafeAreaView style={estilos.pantalla}>

      <ScrollView
        contentContainerStyle={estilos.contenido}
      >

        {/* Encabezado*/}

        <View style={estilos.encabezado}>

          <Text style={estilos.logo}>
            SACOR
          </Text>

          <Text style={estilos.subtitulo}>
            Portal de empleados
          </Text>

        </View>

        {/* Información de cada empleado, ya sea admin, transportista o técnico */}

        <View style={estilos.bienvenida}>

          <Text style={estilos.saludo}>
            ¡Bienvenido!
          </Text>

          <Text style={estilos.titulo}>
            {titulo}
          </Text>

          <Text style={estilos.descripcion}>
            {descripcion}
          </Text>

        </View>

        <Text style={estilos.tituloSeccion}>
          Mis funciones
        </Text>

        {funciones.map((funcion, indice) => {

          const ruta = rutas[indice];

          return (

            <Pressable
              key={indice}
              style={({ pressed }) => [
                estilos.tarjeta,
                pressed && ruta && {
                  opacity: 0.7
                }
              ]}
              disabled={!ruta}
              onPress={() => {
                if (ruta) {
                  router.push(ruta);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={funcion}
            >

              <View style={estilos.numero}>
                <Text style={estilos.textoNumero}>
                  {indice + 1}
                </Text>
              </View>

              <View style={estilos.informacion}>

                <Text style={estilos.nombreFuncion}>
                  {funcion}
                </Text>

                {ruta ? (

                  <Text style={estilos.estado}>
                    Abrir →
                  </Text>

                ) : null}

              </View>

            </Pressable>

          );

        })}

        <Pressable
          style={estilos.botonVolver}
          onPress={volver}
        >

          <Text style={estilos.textoBoton}>
            Cerrar sesión
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
    paddingBottom: 40,
    flexGrow: 1,
  },

  encabezado: {
    backgroundColor: "#050505",
    paddingHorizontal: 26,
    paddingTop: 38,
    paddingBottom: 34,
    borderBottomWidth: 2,
    borderBottomColor: "#22C55E",
  },

  logo: {
    color: "#22C55E",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 2,
  },

  subtitulo: {
    color: "#A3A3A3",
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 0.4,
  },

  bienvenida: {
    backgroundColor: "#111111",
    borderRadius: 20,
    marginHorizontal: 18,
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#1F1F1F",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  saludo: {
    color: "#A3A3A3",
    fontSize: 14,
    fontWeight: "500",
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 6,
    letterSpacing: -0.5,
  },

  descripcion: {
    color: "#CFCFCF",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },

  tituloSeccion: {
    color: "#22C55E",
    fontSize: 20,
    fontWeight: "800",
    marginHorizontal: 22,
    marginTop: 26,
    marginBottom: 16,
    letterSpacing: 0.2,
  },

  tarjeta: {
    backgroundColor: "#111111",
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#1F1F1F",
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },

  numero: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#0B1A11",
    borderWidth: 1,
    borderColor: "#1F6F43",
    alignItems: "center",
    justifyContent: "center",
  },

  textoNumero: {
    color: "#22C55E",
    fontSize: 19,
    fontWeight: "900",
  },

  informacion: {
    flex: 1,
    justifyContent: "center",
  },

  nombreFuncion: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },

  estado: {
    color: "#22C55E",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },

  botonVolver: {
    backgroundColor: "#22C55E",
    borderRadius: 14,
    marginHorizontal: 18,
    marginTop: 28,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22C55E",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  textoBoton: {
    color: "#051108",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  aviso: {
    color: "#8F8F8F",
    fontSize: 12,
    textAlign: "center",
    marginTop: 18,
    marginHorizontal: 22,
    lineHeight: 18,
  },

});