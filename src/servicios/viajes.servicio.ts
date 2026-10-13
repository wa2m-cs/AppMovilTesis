import { solicitar } from "@/servicios/api";

export interface PersonaViaje {
  idEmpleado: number;
  nombre: string;
  tipo: string;
}

export interface Viaje {
  idRutaTrabajo: number;
  fecha: string | null;
  destino: string;
  tipo: string | null;
  idServicioContrato: number | null;
  cliente: string | null;
  servicio: string | null;
  idCamion: number | null;
  camion: string | null;
  personal: PersonaViaje[];
  evidencias: number;
}

export interface MisViajes {
  hoy: string;
  viajes: Viaje[];
}

export interface ContratoAdmin {
  idServicioContrato: number;
  idCotizacion: number | null;
  cliente: string;
  telefono: string | null;
  servicio: string | null;
  lugar: string;
  fecha: string | null;
  observacion: string | null;
  totalViajes: number;
  viajesConPersonal: number;
}

export interface Asignacion {
  idEmpleados: number[];
  idCamion: number | null;
  soloSinPersonal?: boolean;
}

export async function consultarMisViajes(): Promise<MisViajes> {
  return solicitar<MisViajes>("/api/movil/viajes", "GET", undefined, true);
}

export async function consultarContratosAdmin(): Promise<ContratoAdmin[]> {
  return solicitar<ContratoAdmin[]>("/api/movil/admin/contratos", "GET", undefined, true);
}

export async function consultarViajesContrato(idContrato: number): Promise<Viaje[]> {
  return solicitar<Viaje[]>(
    `/api/movil/admin/contratos/${idContrato}/viajes`,
    "GET",
    undefined,
    true
  );
}

export async function asignarViaje(
  idRutaTrabajo: number,
  asignacion: Asignacion
): Promise<{ viaje: Viaje; mensaje: string }> {
  return solicitar(
    `/api/movil/admin/viajes/${idRutaTrabajo}/asignacion`,
    "PUT",
    asignacion,
    true
  );
}

export async function asignarContrato(
  idContrato: number,
  asignacion: Asignacion
): Promise<{ actualizados: number; mensaje: string }> {
  return solicitar(
    `/api/movil/admin/contratos/${idContrato}/asignar`,
    "POST",
    asignacion,
    true
  );
}

export function viajesHastaHoy(viajes: Viaje[], hoy: string): Viaje[] {
  return viajes
    .filter(viaje => !viaje.fecha || viaje.fecha <= hoy)
    .sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
}

export interface ViajeExtraAdmin {
  idViajeExtra: number;
  precio: number | null;
  viaje: Viaje;
}

export interface NuevoViajeExtra {
  fecha: string;
  idCamion: number;
  idEmpleados: number[];
  motivo: string;
  precio: number | null;
}

export async function consultarViajesExtraAdmin(): Promise<ViajeExtraAdmin[]> {
  return solicitar<ViajeExtraAdmin[]>("/api/movil/admin/viajes-extra", "GET", undefined, true);
}

export async function crearViajeExtraContrato(
  idContrato: number,
  datos: NuevoViajeExtra
): Promise<{ idViajeExtra: number; viaje: Viaje; mensaje: string }> {
  return solicitar(
    `/api/movil/admin/contratos/${idContrato}/viajes-extra`,
    "POST",
    datos,
    true
  );
}
