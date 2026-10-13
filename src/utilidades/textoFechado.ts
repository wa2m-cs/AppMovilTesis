const PATRON = /^\s*\[(\d{4})-(\d{2})(?:-(\d{2}))?\]\s*/;

export function sinFecha(texto: string | null | undefined): string {
  return (texto ?? "").replace(PATRON, "").trim();
}

export function fechaCorta(valor: string | null | undefined): string {
  if (!valor) return "";

  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);

  if (!coincidencia) return valor;

  const [, anio, mes, dia] = coincidencia;

  return `${dia}/${mes}/${anio}`;
}

const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export const MESES_LARGOS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function leerFechaIso(valor: string | null | undefined): Date | null {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor ?? "");
  if (!coincidencia) return null;
  return new Date(Number(coincidencia[1]), Number(coincidencia[2]) - 1, Number(coincidencia[3]));
}

export function fechaIso(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function fechaConDia(valor: string | null | undefined): string {
  const fecha = leerFechaIso(valor);
  if (!fecha) return "Sin fecha";
  return `${DIAS[fecha.getDay()]} ${fecha.getDate()} ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
}
