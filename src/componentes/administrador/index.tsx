import type { Href } from "expo-router";

import InicioRol from "@/componentes/inicio/InicioRol";

export default function InicioAdministrador() {

  const funciones = [
    "Contratos y viajes",
    "Registrar empleados",
    "Gestionar empleados",
    "Viajes extra",
    "Registrar servicios externos",
  ];

  return (
    <InicioRol
      titulo="Administrador técnico"
      descripcion="Asigna el personal de cada viaje de los contratos, registra empleados de campo y servicios externos."
      funciones={funciones}
      rutas={[
        "/administrador/contratos" as Href,
        "/administrador/empleados/registrar",
        "/administrador/empleados",
        "/administrador/viajes/asignaciones",
        "/administrador/servicios/registrar",
      ]}
    />
  );
}