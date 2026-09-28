import { solicitar } from "@/servicios/api";

export interface EmpleadoAdmin {
  idEmpleado: number;
  codigoEmpleado: string;
  nombre: string;
  dui: string;
  telefono: string | null;
  sueldo: number;
  fechaIngreso: string;
  codigoAf: string | null;
  estado: string;
  tipo: string;
}

export interface NuevoEmpleado {
  nombre: string;
  dui: string;
  telefono?: string;
  sueldo: number;
  fechaIngreso: string;
  codigoAf?: string;
  tipo: string;
}

export interface EmpleadoCreado {
  idEmpleado: number;
  codigoEmpleado: string;
  nombre: string;
  tipo: string;
  estado: string;
  mensaje: string;
}

export interface ClienteViaje {
  idCliente: number;
  nombre: string;
  tipo: string;
}

export interface CamionViaje {
  idCamion: number;
  placa: string;
  nombre: string | null;
  tipo: string | null;
  estado: string | null;
}

export interface EmpleadoViaje {
  idEmpleado: number;
  nombre: string;
  codigoEmpleado: string;
  tipo: string;
}

export interface CatalogosViaje {
  clientes: ClienteViaje[];
  camiones: CamionViaje[];
  empleados: EmpleadoViaje[];
}

export interface CrearViaje {
  idCliente: number;
  idCamion: number;
  tipo: string;
  precio: number | null;
  pagoMonto: number | null;
  cantidad: number;
  idEmpleados: number[];
}

export interface ViajeAdmin {
  idViajeExtra: number;
  idCliente: number;
  cliente: string;

  idCamion: number;
  camion: string;
  placa: string;

  tipo: string | null;
  precio: number | null;
  pagoMonto: number | null;
  cantidad: number | null;

  empleados: {
    idEmpleado: number;
    nombre: string;
    tipo: string;
  }[];
}

export interface ServicioExternoAdmin {
  idServicioExt: number;
  nombre: string;
  cantidadPago: number;
  direccion: string | null;
}

export async function consultarEmpleadosAdmin():
  Promise<EmpleadoAdmin[]> {

  return solicitar<EmpleadoAdmin[]>(
    "/api/movil/admin/empleados",
    "GET",
    undefined,
    true
  );
}

export async function registrarEmpleadoAdmin(
  empleado: NuevoEmpleado
): Promise<EmpleadoCreado> {

  return solicitar<EmpleadoCreado>(
    "/api/movil/admin/empleados",
    "POST",
    empleado,
    true
  );
}

export async function cambiarEstadoEmpleadoAdmin(
  idEmpleado: number,
  estado: string
): Promise<{ mensaje: string }> {

  return solicitar<{ mensaje: string }>(
    `/api/movil/admin/empleados/${idEmpleado}/estado`,
    "PATCH",
    { estado },
    true
  );
}

export async function consultarCatalogosViajeAdmin():
  Promise<CatalogosViaje> {

  return solicitar<CatalogosViaje>(
    "/api/movil/admin/viajes/catalogos",
    "GET",
    undefined,
    true
  );
}

export async function consultarViajesAdmin():
  Promise<ViajeAdmin[]> {

  return solicitar<ViajeAdmin[]>(
    "/api/movil/admin/viajes",
    "GET",
    undefined,
    true
  );
}

export async function crearViajeAdmin(
  viaje: CrearViaje
): Promise<{
  idViajeExtra: number;
  mensaje: string;
}> {

  return solicitar(
    "/api/movil/admin/viajes",
    "POST",
    viaje,
    true
  );
}

export async function consultarServiciosExternosAdmin():
  Promise<ServicioExternoAdmin[]> {

  return solicitar<ServicioExternoAdmin[]>(
    "/api/movil/admin/servicios-externos",
    "GET",
    undefined,
    true
  );
}

export async function registrarServicioExternoAdmin(
  nombre: string,
  cantidadPago: number,
  direccion: string
): Promise<ServicioExternoAdmin> {

  return solicitar<ServicioExternoAdmin>(
    "/api/movil/admin/servicios-externos",
    "POST",
    {
      nombre,
      cantidadPago,
      direccion
    },
    true
  );
}