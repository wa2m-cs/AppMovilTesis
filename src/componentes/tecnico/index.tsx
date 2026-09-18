import InicioRol from "@/componentes/inicio/InicioRol";

export default function InicioTecnico() {

  const funciones = [
    "Marcar horarios",
    "Registrar recolección de basura",
    "Registrar evidencia de recolección",
  ];

  return (
    <InicioRol
      titulo="Técnico"
      descripcion="Consulta y registra las actividades técnicas que te corresponden."
      funciones={funciones}
    />
  );

}