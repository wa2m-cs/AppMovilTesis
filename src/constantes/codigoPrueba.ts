export type RolPrueba =
  | "transportista"
  | "tecnico"
  | "administrador";

export const CODIGOS_PRUEBA: Record<string, RolPrueba> = {
  "1111": "transportista",
  "2222": "tecnico",
  "3333": "administrador",
};