import { StyleSheet } from "react-native";

export const estilosAdmin = StyleSheet.create({

  pantalla: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  contenido: {
    flexGrow: 1,
    paddingBottom: 45,
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
  },

  subtitulo: {
    color: "#B5B5B5",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },

  tarjeta: {
    backgroundColor: "#111111",
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#232323",
  },

  tituloTarjeta: {
    color: "#22C55E",
    fontSize: 20,
    fontWeight: "900",
    paddingBottom: 14,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#232323",
  },

  etiqueta: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 14,
    marginBottom: 9,
  },

  campo: {
    backgroundColor: "#0C0C0C",
    borderWidth: 1.5,
    borderColor: "#232323",
    borderRadius: 13,
    paddingHorizontal: 15,
    minHeight: 52,
    color: "#FFFFFF",
    fontSize: 15,
  },

  opcion: {
    backgroundColor: "#0C0C0C",
    borderWidth: 1.5,
    borderColor: "#232323",
    borderRadius: 13,
    padding: 14,
    marginBottom: 9,
  },

  opcionSeleccionada: {
    borderColor: "#22C55E",
    backgroundColor: "#0E1A12",
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
  },

  textoOpcion: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },

  descripcion: {
    color: "#A3A3A3",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
  },

  ayuda: {
    color: "#737373",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 10,
  },

  boton: {
    backgroundColor: "#22C55E",
    borderRadius: 14,
    paddingVertical: 17,
    marginTop: 22,
    alignItems: "center",
  },

  textoBoton: {
    color: "#051108",
    fontSize: 15,
    fontWeight: "900",
  },

  botonSecundario: {
    borderWidth: 1,
    borderColor: "#22C55E",
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  textoBotonSecundario: {
    color: "#86EFAC",
    fontSize: 12,
    fontWeight: "800",
  },

  deshabilitado: {
    opacity: 0.45,
  },

  error: {
    color: "#FCA5A5",
    backgroundColor: "#2A0E0E",
    borderRadius: 11,
    padding: 12,
    marginTop: 15,
  },

  exito: {
    color: "#BBF7D0",
    backgroundColor: "#0F1F15",
    borderRadius: 11,
    padding: 12,
    marginTop: 15,
  },

  registro: {
    backgroundColor: "#0C0C0C",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#232323",
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
    padding: 15,
    marginBottom: 11,
  },

  nombreRegistro: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  dato: {
    color: "#A3A3A3",
    fontSize: 13,
    marginTop: 6,
  },

  filaBotones: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 13,
  },

  actualizar: {
    color: "#22C55E",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "800",
    paddingVertical: 12,
    marginTop: 15,
  },

  cargando: {
    marginTop: 35,
  },

});