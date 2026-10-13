import { cabecerasSesion, solicitar, urlApi } from "@/servicios/api";

export const MAX_FOTOS_POR_EVIDENCIA = 3;

export interface FotoSubida {
  idFoto: number;
  idLimpieza: number;
  tipoContenido: string;
  tamanoBytes: number;
}

export async function subirFotoEvidencia(
  idLimpieza: number,
  contenidoBase64: string
): Promise<FotoSubida> {
  return solicitar<FotoSubida>(
    `/api/movil/evidencias/${idLimpieza}/fotos`,
    "POST",
    { contenidoBase64 },
    true
  );
}

export async function subirFotosEvidencia(
  idLimpieza: number,
  fotos: string[]
): Promise<number> {
  let fallidas = 0;

  for (const foto of fotos) {
    try {
      await subirFotoEvidencia(idLimpieza, foto);
    } catch {
      fallidas++;
    }
  }

  return fallidas;
}

export function fuenteFoto(idFoto: number) {
  return {
    uri: urlApi(`/api/movil/fotos/${idFoto}`),
    headers: cabecerasSesion(),
  };
}
