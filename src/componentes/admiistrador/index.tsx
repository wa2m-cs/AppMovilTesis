import InicioRol from "@/componentes/inicio/InicioRol";

export default function InicioAdministrador() {

  const funciones = [
    "Registrar empleados",
    "Gestionar empleados",
    "Asignar viajes",
    "Registrar servicios externos",
  ];

  return (
    <InicioRol
      titulo="Administrador ejecutivo"
      descripcion="Administra los empleados, las asignaciones de viajes y los servicios externos."
      funciones={funciones}
    />
  );

}