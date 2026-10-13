import * as ImagePicker from "expo-image-picker";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { MAX_FOTOS_POR_EVIDENCIA } from "@/servicios/evidencias.servicio";

export interface FotoSeleccionada {
  uri: string;
  base64: string;
}

interface Propiedades {
  fotos: FotoSeleccionada[];
  onCambiar: (fotos: FotoSeleccionada[]) => void;
  onError: (mensaje: string) => void;
  deshabilitado?: boolean;
}

const OPCIONES: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  quality: 0.4,
  base64: true,
  allowsEditing: false,
  exif: false,
};

export default function SelectorFotos({
  fotos,
  onCambiar,
  onError,
  deshabilitado = false,
}: Propiedades) {
  const lleno = fotos.length >= MAX_FOTOS_POR_EVIDENCIA;

  async function agregar(origen: "camara" | "galeria") {
    if (deshabilitado || lleno) return;

    try {
      const permiso =
        origen === "camara"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permiso.granted) {
        onError(
          origen === "camara"
            ? "Debes permitir el uso de la cámara para tomar la foto."
            : "Debes permitir el acceso a tus fotos para adjuntarlas."
        );
        return;
      }

      const resultado =
        origen === "camara"
          ? await ImagePicker.launchCameraAsync(OPCIONES)
          : await ImagePicker.launchImageLibraryAsync(OPCIONES);

      if (resultado.canceled) return;

      const nuevas = resultado.assets
        .filter(asset => !!asset.base64)
        .map(asset => ({ uri: asset.uri, base64: asset.base64 as string }));

      if (nuevas.length === 0) {
        onError("No se pudo leer la foto. Intenta con otra.");
        return;
      }

      onCambiar([...fotos, ...nuevas].slice(0, MAX_FOTOS_POR_EVIDENCIA));
    } catch {
      onError("No se pudo abrir la cámara o la galería.");
    }
  }

  function quitar(indice: number) {
    if (deshabilitado) return;
    onCambiar(fotos.filter((_, i) => i !== indice));
  }

  return (
    <View>
      <Text style={estilos.etiqueta}>
        Fotos ({fotos.length}/{MAX_FOTOS_POR_EVIDENCIA}, opcional)
      </Text>

      {fotos.length > 0 ? (
        <View style={estilos.fila}>
          {fotos.map((foto, indice) => (
            <Pressable
              key={`${foto.uri}-${indice}`}
              onPress={() => quitar(indice)}
              disabled={deshabilitado}
              accessibilityLabel="Quitar foto"
            >
              <Image source={{ uri: foto.uri }} style={estilos.miniatura} />
              <Text style={estilos.quitar}>Quitar</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={estilos.botones}>
        <Pressable
          style={[estilos.boton, (lleno || deshabilitado) && estilos.deshabilitado]}
          onPress={() => agregar("camara")}
          disabled={lleno || deshabilitado}
        >
          <Text style={estilos.textoBoton}>Tomar foto</Text>
        </Pressable>

        <Pressable
          style={[estilos.boton, (lleno || deshabilitado) && estilos.deshabilitado]}
          onPress={() => agregar("galeria")}
          disabled={lleno || deshabilitado}
        >
          <Text style={estilos.textoBoton}>Elegir de galería</Text>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  etiqueta: {
    color: "#E5E5E5",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
    marginBottom: 10,
  },
  fila: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  miniatura: {
    width: 86,
    height: 86,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#232323",
    backgroundColor: "#0C0C0C",
  },
  quitar: {
    color: "#FCA5A5",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
  botones: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  boton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#22C55E",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  deshabilitado: {
    opacity: 0.4,
  },
  textoBoton: {
    color: "#86EFAC",
    fontWeight: "800",
    fontSize: 14,
  },
});
