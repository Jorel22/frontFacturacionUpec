/**
 * Tipos de datos sincronizados con el contrato OpenAPI de FacturaEC (api/openapi.yaml)
 */

export type TarifaIva = 0 | 5 | 15;

export type EstadoFactura = "CREADA" | "PENDIENTE" | "AUTORIZADA" | "RECHAZADA";

export interface Emisor {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccionMatriz: string;
  correo: string;
}

export interface RegistroEmisorRequest extends Emisor {
  clave: string;
}

export interface AuthTokenResponse {
  token: string;
  tokenType: string;
  emisor: Emisor;
}

export interface Cliente {
  id: number;
  rucCedula: string;
  razonSocial: string;
  correo: string;
  direccion?: string;
  telefono?: string;
}

export interface ClienteNuevo {
  rucCedula: string;
  razonSocial: string;
  correo: string;
  direccion?: string;
  telefono?: string;
}

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  precioUnitario: number;
  tarifaIva: TarifaIva;
}

export interface ProductoNuevo {
  codigo: string;
  nombre: string;
  precioUnitario: number;
  tarifaIva: TarifaIva;
}

export interface DetalleFactura {
  productoId: number;
  codigo: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  tarifaIva: TarifaIva;
  subtotal: number;
  valorIva: number;
  total: number;
}

export interface DetalleFacturaNuevo {
  productoId: number;
  cantidad: number;
}

export interface FacturaNueva {
  clienteId: number;
  detalles: DetalleFacturaNuevo[];
  simular_rechazo?: boolean;
}

export interface Factura {
  id: number;
  secuencial: string;
  claveAcceso: string;
  fechaEmision: string;
  estado: EstadoFactura;
  cliente: Cliente;
  detalles: DetalleFactura[];
  subtotalSinImpuestos: number;
  totalIva: number;
  total: number;
  intentosEnvio: number;
}

export interface ResultadoEnvioSri {
  facturaId: number;
  estado: EstadoFactura;
  mensaje: string;
  intentosEnEsteEnvio: number;
  intentosTotales: number;
  numeroAutorizacion?: string;
}
