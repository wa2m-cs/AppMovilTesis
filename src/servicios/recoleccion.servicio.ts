import { solicitar } from "@/servicios/api";

export interface ServicioTecnico {
  idServicioContrato: number;
  idRutaTrabajo: number;
  destino: string;
}

export interface Recoleccion {
  idLimpieza: number;
  idServicioContrato: number;
  fecha: string;
  observacion: string | null;
  etapa: string | null;
}

interface InicioTecnico {
  limpiezas: Recoleccion[];
}

export async function consultarServiciosTecnico():
  Promise<ServicioTecnico[]> {

  return solicitar<ServicioTecnico[]>(
    "/api/movil/tecnico/servicios",
    "GET",
    undefined,
    true
  );
}

export async function consultarRecolecciones():
  Promise<Recoleccion[]> {

  const resultado = await solicitar<InicioTecnico>(
    "/api/movil/tecnico/inicio",
    "GET",
    undefined,
    true
  );

  return resultado.limpiezas.filter(
    limpieza =>
      limpieza.etapa === "Recolección finalizada"
  );
}

export async function registrarRecoleccion(
  idServicioContrato: number,
  observacion: string
): Promise<Recoleccion> {

  return solicitar<Recoleccion>(
    "/api/movil/tecnico/recoleccion",
    "POST",
    {
      idServicioContrato,
      observacion
    },
    true
  );
}