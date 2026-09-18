import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useRouter } from "expo-router";

import { colores } from "@/constantes/colores";

// Propiedades del componente
interface PropiedadesInicio {
  titulo: string;
  descripcion: string;
  funciones: string[];
}

export default function InicioRol({
  titulo,
  descripcion,
  funciones,
}: PropiedadesInicio) {

  const router = useRouter();

  const volver = () => {
    router.replace("/activacion");
  };

  return (
    <SafeAreaView style={estilos.pantalla}>

      <ScrollView
        contentContainerStyle={estilos.contenido}
      >

        {/* Encabezado*/}

        <View style={estilos.encabezado}>

          <Text style={estilos.logo}>
            EnRuta
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

        {funciones.map((funcion, indice) => (

          <View
            key={indice}
            style={estilos.tarjeta}
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

              <Text style={estilos.estado}>
                Vista pendiente de desarrollo
              </Text>

            </View>

          </View>

        ))}

        <Pressable
          style={estilos.botonVolver}
          onPress={volver}
        >

          <Text style={estilos.textoBoton}>
            Volver a activación
          </Text>

        </Pressable>

        <Text style={estilos.aviso}>
          Versión de demostración sin conexión a la API.
        </Text>

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
    paddingHorizontal: 25,
    paddingVertical: 30,
  },

  logo: {
    color: colores.blanco,
    fontSize: 28,
    fontWeight: "800",
  },

  subtitulo: {
    color: "#CBD5E1",
    fontSize: 13,
    marginTop: 4,
  },

  bienvenida: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
  },

  saludo: {
    color: colores.textoSecundario,
    fontSize: 16,
  },

  titulo: {
    color: colores.titulo,
    fontSize: 26,
    fontWeight: "800",
    marginTop: 5,
  },

  descripcion: {
    color: colores.textoSecundario,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },

  tituloSeccion: {
    color: colores.titulo,
    fontSize: 19,
    fontWeight: "700",
    marginHorizontal: 24,
    marginTop: 14,
    marginBottom: 16,
  },

  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: 15,
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  numero: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  textoNumero: {
    color: colores.primario,
    fontSize: 18,
    fontWeight: "800",
  },

  informacion: {
    flex: 1,
  },

  nombreFuncion: {
    color: colores.titulo,
    fontSize: 15,
    fontWeight: "700",
  },

  estado: {
    color: colores.textoSecundario,
    fontSize: 12,
    marginTop: 5,
  },

  botonVolver: {
    backgroundColor: colores.primario,
    borderRadius: 12,
    marginHorizontal: 24,
    marginTop: 22,
    padding: 17,
    alignItems: "center",
  },

  textoBoton: {
    color: colores.blanco,
    fontSize: 15,
    fontWeight: "700",
  },

  aviso: {
    color: colores.textoSecundario,
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
    marginHorizontal: 24,
  },

});