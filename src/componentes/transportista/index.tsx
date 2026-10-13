import type { Href } from "expo-router";

import InicioRol from "@/componentes/inicio/InicioRol";

export default function InicioTransportista() {

  const funciones = [
    "Calendario de viajes",
    "Marcar horarios",
    "Registrar información adicional",
    "Registrar evidencias",
    "Consultar historial de viajes",
  ];

  return (
    <InicioRol
      titulo="Transportista"
      descripcion="Consulta tus viajes y registra las actividades de tus recorridos."
      funciones={funciones}
      rutas={[
        "/transportista/calendario" as Href,
        "/transportista/horarios",
        "/transportista/informacion-adicional",
        "/transportista/evidencias",
        "/transportista/historial",
      ]}
    />
  );
}