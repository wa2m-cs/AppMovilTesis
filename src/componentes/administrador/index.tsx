import InicioRol from "@/componentes/inicio/InicioRol";

export default function InicioAdministrador() {

  const funciones = [
    "Registrar empleados",
    "Gestionar empleados",
    "Crear y asignar viajes",
    "Registrar servicios externos",
  ];

  return (
    <InicioRol
      titulo="Admin"
      descripcion="Administra empleados, viajes y servicios externos de SACOR."
      funciones={funciones}
      rutas={[
        "/administrador/empleados/registrar",
        "/administrador/empleados",
        "/administrador/viajes/asignaciones",
        "/administrador/servicios/registrar",
      ]}
    />
  );
}