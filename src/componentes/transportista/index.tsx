import InicioRol from "@/componentes/inicio/InicioRol";

export default function InicioTransportista() {

  const funciones = [
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
        "/transportista/horarios",
        "/transportista/informacion-adicional",
        "/transportista/evidencias",
        "/transportista/historial",
      ]}
    />
  );
}