import { solicitar } from "@/servicios/api";

export interface Material {
  idPrecioLugar: number;
  tipo: string;
  lugar: string;
  precio: number;
}

export interface CatalogoRecoleccion {
  conceptosGasto: string[];
  materiales: Material[];
}

export interface CargaNueva {
  idPrecioLugar: number;
  toneladas: number;
}

export interface GastoNuevo {
  concepto: string;
  monto: number;
  descripcion?: string;
}

export interface NuevaRecoleccion {
  idRutaTrabajo: number;
  observacion: string;
  cargas: CargaNueva[];
  gastos: GastoNuevo[];
}

export interface RecoleccionGuardada {
  idLimpieza: number;
  idRutaTrabajo: number;
  toneladas: number;
  totalCobrado: number;
  totalGastos: number;
  mensaje: string;
}

export interface RegistroViaje {
  idRutaTrabajo: number;
  fecha: string | null;
  destino: string;
  cliente: string | null;
  cargas: { material: string; toneladas: number; precio: number; monto: number }[];
  gastos: { concepto: string; monto: number; descripcion: string | null }[];
  observaciones: { idLimpieza: number; fecha: string; observacion: string | null; fotos: number[] }[];
}

export function conceptoVisible(concepto: string): string {
  return concepto === "Alimentacion" ? "Alimentación" : concepto;
}

export async function consultarMateriales(idRutaTrabajo: number): Promise<CatalogoRecoleccion> {
  return solicitar<CatalogoRecoleccion>(
    `/api/movil/tecnico/viajes/${idRutaTrabajo}/materiales`,
    "GET",
    undefined,
    true
  );
}

export async function registrarRecoleccion(datos: NuevaRecoleccion): Promise<RecoleccionGuardada> {
  return solicitar<RecoleccionGuardada>("/api/movil/tecnico/recoleccion", "POST", datos, true);
}

export async function consultarRegistrosTecnico(): Promise<RegistroViaje[]> {
  return solicitar<RegistroViaje[]>("/api/movil/tecnico/registros", "GET", undefined, true);
}
