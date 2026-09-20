export type Rol =
  | "transportista"
  | "tecnico"
  | "administrador";

export interface EmpleadoMovil {
  idEmpleado: number;
  codigoEmpleado: string;
  nombre: string;
  rol: Rol;
  tipo: string;
}

interface RespuestaIngreso {
  token: string;
  expiraUtc: string;
  empleado: EmpleadoMovil;
}

export interface InicioMovil {
  empleado: EmpleadoMovil;
  rutas: unknown[];
  horarios: unknown[];
  limpiezas: unknown[];
  camiones?: unknown[];
  viajesExtra?: unknown[];
  pesajes?: unknown[];
}

let sesion: RespuestaIngreso | null = null;

function obtenerUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;

  if (!url) {
    throw new Error(
      "No se configuró EXPO_PUBLIC_API_URL."
    );
  }

  return url.replace(/\/$/, "");
}

export async function solicitar<T>(
  ruta: string,
  metodo: "GET" | "POST" | "PATCH" = "GET",
  cuerpo?: object,
  autenticado = false
): Promise<T> {

  if (autenticado && !sesion) {
    throw new Error("No hay una sesión activa.");
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (cuerpo) {
    headers["Content-Type"] = "application/json";
  }

  if (autenticado && sesion) {
    headers.Authorization = `Bearer ${sesion.token}`;
  }

  const respuesta = await fetch(
    `${obtenerUrl()}${ruta}`,
    {
      method: metodo,
      headers,
      ...(cuerpo
        ? { body: JSON.stringify(cuerpo) }
        : {}),
    }
  );

  if (!respuesta.ok) {

    let mensaje = `Error HTTP ${respuesta.status}`;

    try {
      const detalle = await respuesta.json();

      if (typeof detalle.mensaje === "string") {
        mensaje = detalle.mensaje;
      }

    } catch {
    }

    if (respuesta.status === 401 && autenticado) {
      sesion = null;
    }

    throw new Error(mensaje);
  }

  if (respuesta.status === 204) {
    return undefined as T;
  }

  return (await respuesta.json()) as T;
}

// Inicio de sesión mediante código de empleado, 4 digitos empleados y 6 digitos el admin
export async function iniciarSesion(
  codigo: string
): Promise<EmpleadoMovil> {

  const resultado = await solicitar<RespuestaIngreso>(
    "/api/movil/ingresar",
    "POST",
    {
      codigo: codigo.trim().toUpperCase(),
    }
  );

  sesion = resultado;

  return resultado.empleado;
}

// Saber qué rol inició sesión con el código
export function obtenerRol(): Rol | null {
  return sesion?.empleado.rol ?? null;
}

// Consultar información del empleado
export async function consultarInicio(
  rol: "transportista" | "tecnico"
): Promise<InicioMovil> {

  return solicitar<InicioMovil>(
    `/api/movil/${rol}/inicio`,
    "GET",
    undefined,
    true
  );
}

// Cerrar la sesión actual
export async function cerrarSesion(): Promise<void> {

  if (!sesion) {
    return;
  }

  try {

    await solicitar<void>(
      "/api/movil/salir",
      "POST",
      undefined,
      true
    );

  } finally {

    sesion = null;

  }
}