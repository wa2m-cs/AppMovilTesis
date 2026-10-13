import { Image, StyleSheet, View } from "react-native";

import { fuenteFoto } from "@/servicios/evidencias.servicio";

interface Propiedades {
  fotos: number[];
}

export default function GaleriaFotos({ fotos }: Propiedades) {
  if (fotos.length === 0) return null;

  return (
    <View style={estilos.fila}>
      {fotos.map(idFoto => (
        <Image
          key={idFoto}
          source={fuenteFoto(idFoto)}
          style={estilos.foto}
          resizeMode="cover"
        />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  foto: {
    width: 92,
    height: 92,
    borderRadius: 12,
    backgroundColor: "#0C0C0C",
    borderWidth: 1,
    borderColor: "#232323",
  },
});
