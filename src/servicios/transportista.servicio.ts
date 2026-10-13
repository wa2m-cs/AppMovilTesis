import { solicitar } from "@/servicios/api";

export interface RutaTransportista {
  idRutaEmpleado: number;
  idRutaTrabajo: number;
  destino: string;
  tipo: string | null;
}

export interface CamionTransportista {
  idCamionConductor: number;
  fecha: string;
  idCamion: number;
  placa: string;
  nombre: string | null;
  estado: string | null;
}

export interface ViajeExtraTransportista {
  idViajeExtra: number;
  idCamion: number;
  tipo: string | null;
  cantidad: number | null;
}

export interface InicioTransportistaRespuesta {
  empleado: {
    idEmpleado: number;
    codigoEmpleado: string;
    nombre: string;
    rol: string;
    tipo: string;
  };

  rutas: RutaTransportista[];

  horarios: {
    idHorarioTrabajo: number;
    fecha: string;
    entrada: string;
    salida: string | null;
  }[];

  camiones: CamionTransportista[];

  viajesExtra: ViajeExtraTransportista[];

  limpiezas: {
    idLimpieza: number;
    idServicioContrato: number;
    fecha: string;
    observacion: string | null;
    etapa: string | null;
  }[];
}

export async function consultarTransportista():
  Promise<InicioTransportistaRespuesta> {

  return solicitar<InicioTransportistaRespuesta>(
    "/api/movil/transportista/inicio",
    "GET",
    undefined,
    true
  );
}
export interface ServicioParaEvidencia {
  idServicioContrato: number;
  idRutaTrabajo: number;
  destino: string;
  fecha: string | null;
}

export type TipoEvidencia = "limpieza" | "ruta";

export interface EvidenciaTransportista {
  idLimpieza: number;
  idRutaTrabajo: number;
  destino: string;
  fechaViaje: string | null;
  fecha: string;
  tipo: TipoEvidencia;
  texto: string;
  fotos: number[];
}

export async function consultarServiciosParaEvidencias():
  Promise<ServicioParaEvidencia[]> {

  return solicitar<ServicioParaEvidencia[]>(
    "/api/movil/transportista/servicios",
    "GET",
    undefined,
    true
  );
}

export async function consultarEvidenciasTransportista():
  Promise<EvidenciaTransportista[]> {

  return solicitar<EvidenciaTransportista[]>(
    "/api/movil/transportista/evidencias",
    "GET",
    undefined,
    true
  );
}

export async function guardarEvidenciaTransportista(
  idRutaTrabajo: number,
  tipo: TipoEvidencia,
  texto: string
): Promise<EvidenciaTransportista> {

  return solicitar<EvidenciaTransportista>(
    "/api/movil/transportista/evidencias",
    "POST",
    {
      idRutaTrabajo,
      tipo,
      texto
    },
    true
  );
}
export interface InformacionAdicionalTransportista {
  idLimpieza: number;
  idRutaTrabajo: number;
  destino: string;
  fechaViaje: string | null;
  fecha: string;
  kilometros: number;
  combustibleLitros: number;
  gastoUsd: number;
}

export interface DatosInformacionAdicional {
  idRutaTrabajo: number;
  kilometros: number;
  combustibleLitros: number;
  gastoUsd: number;
}

export async function consultarInformacionAdicional():
  Promise<InformacionAdicionalTransportista[]> {

  return solicitar<InformacionAdicionalTransportista[]>(
    "/api/movil/transportista/informacion-adicional",
    "GET",
    undefined,
    true
  );
}

export async function registrarInformacionAdicional(
  datos: DatosInformacionAdicional
): Promise<InformacionAdicionalTransportista> {

  return solicitar<InformacionAdicionalTransportista>(
    "/api/movil/transportista/informacion-adicional",
    "POST",
    datos,
    true
  );
}