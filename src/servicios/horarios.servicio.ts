import { solicitar } from "@/servicios/api";

export interface Horario {
  idHorarioTrabajo: number;
  fecha: string;
  entrada: string;
  salida?: string | null;
}

export async function consultarHorarios(): Promise<Horario[]> {
  return solicitar<Horario[]>(
    "/api/movil/horarios",
    "GET",
    undefined,
    true
  );
}

export async function registrarEntrada(): Promise<Horario> {
  return solicitar<Horario>(
    "/api/movil/horarios/entrada",
    "POST",
    undefined,
    true
  );
}

export async function registrarSalida(
  idHorario: number
): Promise<void> {
  await solicitar(
    `/api/movil/horarios/${idHorario}/salida`,
    "PATCH",
    undefined,
    true
  );
}