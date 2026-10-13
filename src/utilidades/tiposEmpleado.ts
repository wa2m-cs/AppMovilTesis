const NOMBRES: Record<string, string> = {
  AdministradorOperativo: "Administrador operativo",
  AdministradorTecnico: "Administrador técnico",
  Tecnico: "Técnico",
  Motorista: "Motorista",
  Mecanico: "Mecánico",
};

export function tipoVisible(tipo: string | null | undefined): string {
  if (!tipo) return "";
  return NOMBRES[tipo] ?? tipo;
}
