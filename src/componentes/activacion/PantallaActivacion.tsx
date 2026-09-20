import { useState } from "react";

import { useRouter } from "expo-router";

import {iniciarSesion,cerrarSesion} from "@/servicios/api";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { colores } from "@/constantes/colores";

export default function PantallaActivacion() {

  // Estado del campo de código
  const [codigo, setCodigo] = useState("");
  //Estado del error para validar el código de activación
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  const router = useRouter();

  const codigoValidoParaEnviar = codigo.trim().length > 0;

  const ingresar = async () => {

    if (procesando) return;

    const codigoIngresado =
      codigo.trim().toUpperCase();

    if (!codigoIngresado) {
      setError("Introduce tu código de acceso.");
      return;
    }

    setProcesando(true);
    setError("");

    try {

      const empleado = await iniciarSesion(
        codigoIngresado
      );

      switch (empleado.rol) {

        case "transportista":
          router.replace("/transportista");
          break;

        case "tecnico":
          router.replace("/tecnico");
          break;

        case "administrador":

          await cerrarSesion();

          setError(
            "El módulo administrador todavía no está disponible."
          );

          break;

        default:
          setError("Tu rol no tiene acceso a la aplicación.");
      }

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión."
      );

    } finally {

      setProcesando(false);

    }
  };

  return (
    <SafeAreaView style={estilos.pantalla}>

      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={estilos.contenedorTeclado}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >

        <ScrollView
          contentContainerStyle={estilos.contenido}
          keyboardShouldPersistTaps="handled"
        >

          <View style={estilos.contenedor}>

            {/* Logotipo de la aplicación */}

            <View style={estilos.logo}>
              <Text style={estilos.textoLogo}>
                E
              </Text>
            </View>

            {/* nombre de la aplicación */}

            <Text style={estilos.nombreAplicacion}>
              EnRuta
            </Text>

            <Text style={estilos.subtituloAplicacion}>
              Portal de empleados
            </Text>

            {/* Tarjeta de activación */}

            <View style={estilos.tarjeta}>

              <Text style={estilos.titulo}>
                Inicia sesión
              </Text>

              <Text style={estilos.descripcion}>
                Introduce el código que te ha
                proporcionado el administrador
                para acceder a la aplicación.
              </Text>

              <Text style={estilos.etiqueta}>
                Código de acceso
              </Text>

              <TextInput
                style={estilos.campo}
                placeholder="Ingresa tu código"
                placeholderTextColor={colores.gris}
                value={codigo}
                onChangeText={(texto) => {
                  setCodigo(texto.toUpperCase());
                  setError("");
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                spellCheck={false}
                maxLength={30}
                returnKeyType="done"
                accessibilityLabel="Código de acceso"
              />
              {error ? (
                <Text style={estilos.error}>
                  {error}
                </Text>
              ) : null}

              <Text style={estilos.ayuda}>
                ¿No tienes un código? Solicítalo
                a tu administrador.
              </Text>

              <Pressable
                style={({ pressed }) => [
                  estilos.boton,

                  !codigoValidoParaEnviar &&
                    estilos.botonDeshabilitado,

                  pressed &&
                    codigoValidoParaEnviar &&
                    estilos.botonPresionado,
                ]}
                disabled={!codigoValidoParaEnviar || procesando}
                onPress={ingresar}
                accessibilityRole="button"
                accessibilityState={{
                  disabled: !codigoValidoParaEnviar,
                }}
              >

                <Text style={estilos.textoBoton}>
                 {procesando ? "Ingresando..." : "Ingresar"}
                </Text>

              </Pressable>

            </View>

            {/* Pie de página */}

            <Text style={estilos.pie}>
              Acceso exclusivo para personal autorizado
            </Text>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({

  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },

  contenedorTeclado: {
    flex: 1,
  },

  contenido: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },

  contenedor: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    alignItems: "center",
  },

  logo: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: colores.primario,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  textoLogo: {
    color: colores.blanco,
    fontSize: 38,
    fontWeight: "800",
  },

  nombreAplicacion: {
    color: colores.blanco,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1,
  },

  subtituloAplicacion: {
    color: "#B8C7DD",
    fontSize: 15,
    marginTop: 5,
    marginBottom: 35,
  },

  tarjeta: {
    width: "100%",
    backgroundColor: colores.tarjeta,
    borderRadius: 24,
    padding: 26,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },

  titulo: {
    color: colores.titulo,
    fontSize: 25,
    fontWeight: "800",
    marginBottom: 12,
  },

  descripcion: {
    color: colores.textoSecundario,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 28,
  },

  etiqueta: {
    color: colores.titulo,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },

  campo: {
    width: "100%",
    height: 55,
    backgroundColor: colores.fondoCampo,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colores.titulo,
    letterSpacing: 1,
  },

  ayuda: {
    color: colores.textoSecundario,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    marginBottom: 27,
  },

  boton: {
    width: "100%",
    height: 54,
    backgroundColor: colores.primario,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  botonDeshabilitado: {
    opacity: 0.5,
  },

  botonPresionado: {
    backgroundColor: colores.primarioPresionado,
  },

  textoBoton: {
    color: colores.blanco,
    fontSize: 16,
    fontWeight: "700",
  },

  pie: {
    color: "#94A8C4",
    fontSize: 12,
    textAlign: "center",
    marginTop: 30,
  },
  error: {
  color: "#DC2626",
  fontSize: 13,
  marginBottom: 12,
},

});