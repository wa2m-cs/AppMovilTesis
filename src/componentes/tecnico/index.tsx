import type { Href } from "expo-router";

import InicioRol from "@/componentes/inicio/InicioRol";

export default function InicioTecnico() {

  const funciones = [
    "Calendario de viajes",
    "Marcar horarios",
    "Registrar recolección de basura",
  ];

  return (

    <InicioRol
      titulo="Técnico"
      descripcion="Consulta y registra las actividades técnicas que te corresponden."
      funciones={funciones}

      rutas={[
        "/tecnico/calendario" as Href,
        "/tecnico/horarios",
        "/tecnico/recoleccion",
      ]}
    />

  );
}