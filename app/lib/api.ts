import {
  AuthTokenResponse,
  Cliente,
  DetalleFactura,
  Emisor,
  Factura,
  FacturaNueva,
  Producto,
  ResultadoEnvioSri,
} from "../types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

let cachedToken: string | null = null;

export function setAuthToken(token: string) {
  cachedToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("facturaec_token", token);
  }
}

export function getAuthToken(): string | null {
  if (!cachedToken && typeof window !== "undefined") {
    cachedToken = localStorage.getItem("facturaec_token");
  }
  return cachedToken;
}

export const MOCK_EMISOR: Emisor = {
  ruc: "1792952327001",
  razonSocial: "SOLUCIONES ANDINAS S.A.S.",
  nombreComercial: "FacturaEC Cloud",
  direccionMatriz: "Av. Amazonas N24-196 y Luis Cordero, Quito, Ecuador",
  correo: "facturacion@andinassoft.ec",
};

export const MOCK_CLIENTES: Cliente[] = [
  {
    id: 1,
    rucCedula: "1722849102001",
    razonSocial: "COMERCIAL LA MODERNA S.A.",
    correo: "contabilidad@lamoderna.ec",
    direccion: "Av. 10 de Agosto N34-11, Quito",
    telefono: "022549102",
  },
  {
    id: 2,
    rucCedula: "1003481920",
    razonSocial: "CARLOS ANDRES MORENO MORA",
    correo: "carlos.moreno@gmail.com",
    direccion: "Calle Bolívar 4-50, Tulcán",
    telefono: "0993819201",
  },
  {
    id: 3,
    rucCedula: "0401829103001",
    razonSocial: "DISTRIBUIDORA DEL CARCHI CIA. LTDA.",
    correo: "ventas@districarchi.ec",
    direccion: "Panamericana Norte Km 2, Tulcán",
    telefono: "062981023",
  },
];

export const MOCK_PRODUCTOS: Producto[] = [
  {
    id: 1,
    codigo: "SRV-SFT-01",
    nombre: "Suscripción Mensual SaaS FacturaEC",
    precioUnitario: 35.0,
    tarifaIva: 15,
  },
  {
    id: 2,
    codigo: "SRV-SPT-02",
    nombre: "Soporte Técnico y Mantenimiento Tributario",
    precioUnitario: 50.0,
    tarifaIva: 15,
  },
  {
    id: 3,
    codigo: "INS-FIR-03",
    nombre: "Asesoría en Firma Electrónica y Certificado",
    precioUnitario: 25.0,
    tarifaIva: 0,
  },
  {
    id: 4,
    codigo: "MAT-IMP-04",
    nombre: "Papel Químico Térmico para Impresión RIDE",
    precioUnitario: 12.5,
    tarifaIva: 5,
  },
];

export const MOCK_FACTURAS: Factura[] = [
  {
    id: 1,
    secuencial: "001-001-000000042",
    claveAcceso: "0211202601179295232700120010010000000421234567819",
    fechaEmision: "2026-11-02T14:30:00Z",
    estado: "AUTORIZADA",
    cliente: MOCK_CLIENTES[0],
    subtotalSinImpuestos: 120.0,
    totalIva: 18.0,
    total: 138.0,
    intentosEnvio: 1,
    detalles: [
      {
        productoId: 1,
        codigo: "SRV-SFT-01",
        nombre: "Suscripción Mensual SaaS FacturaEC",
        cantidad: 2,
        precioUnitario: 35.0,
        tarifaIva: 15,
        subtotal: 70.0,
        valorIva: 10.5,
        total: 80.5,
      },
      {
        productoId: 2,
        codigo: "SRV-SPT-02",
        nombre: "Soporte Técnico y Mantenimiento Tributario",
        cantidad: 1,
        precioUnitario: 50.0,
        tarifaIva: 15,
        subtotal: 50.0,
        valorIva: 7.5,
        total: 57.5,
      },
    ],
  },
];

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error: any = new Error(errorData.detail || errorData.mensaje || `Error HTTP ${res.status}`);
    error.status = res.status;
    error.codigo = errorData.codigo;
    throw error;
  }

  return res.json();
}

export const api = {
  async verificarSalud(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  async registrarEmisor(ruc: string, razonSocial: string, clave: string): Promise<string> {
    try {
      const res = await apiFetch<{ accessToken: string; tokenType: string; emisorId: number }>(
        "/api/v1/auth/registro",
        {
          method: "POST",
          body: JSON.stringify({ ruc, razonSocial, clave }),
        }
      );
      setAuthToken(res.accessToken);
      return res.accessToken;
    } catch (err: any) {
      if (err.message && err.message.includes("409")) {
        // RUC ya registrado, podemos autenticar con token previo
        return getAuthToken() || "";
      }
      throw err;
    }
  },

  async registrarCliente(cliente: {
    tipoIdentificacion: "RUC" | "CEDULA" | "PASAPORTE";
    identificacion: string;
    razonSocial: string;
    direccion?: string;
  }): Promise<Cliente> {
    const res = await apiFetch<any>("/api/v1/clientes", {
      method: "POST",
      body: JSON.stringify(cliente),
    });
    return {
      id: res.id,
      rucCedula: res.identificacion,
      razonSocial: res.razonSocial,
      correo: "contacto@" + res.identificacion.slice(0, 8) + ".ec",
      direccion: res.direccion,
    };
  },

  async registrarProducto(prod: {
    codigo: string;
    descripcion: string;
    precioUnitario: number;
    tarifaIva: 0 | 5 | 15;
  }): Promise<Producto> {
    const res = await apiFetch<any>("/api/v1/productos", {
      method: "POST",
      body: JSON.stringify({
        codigo: prod.codigo,
        descripcion: prod.descripcion,
        precioUnitario: prod.precioUnitario.toFixed(2),
        tarifaIva: prod.tarifaIva,
      }),
    });
    return {
      id: res.id,
      codigo: res.codigo,
      nombre: res.descripcion,
      precioUnitario: parseFloat(res.precioUnitario),
      tarifaIva: res.tarifaIva,
    };
  },

  async crearFactura(data: FacturaNueva): Promise<any> {
    return apiFetch<any>("/api/v1/facturas", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async enviarSri(facturaId: number): Promise<ResultadoEnvioSri> {
    const res = await apiFetch<any>(`/api/v1/facturas/${facturaId}/enviar-sri`, {
      method: "POST",
    });
    return {
      facturaId: res.facturaId || res.factura_id,
      estado: res.estado,
      mensaje: res.mensaje,
      intentosEnEsteEnvio: res.intentosEnEsteEnvio || res.intentos_en_este_envio || 1,
      intentosTotales: res.intentosTotales || 1,
      numeroAutorizacion: res.numeroAutorizacion || res.numero_autorizacion,
    };
  },

  // Inicialización guiada de datos iniciales en la base de datos de FastAPI
  async sembrarDatosEnBackend(): Promise<{ clientes: Cliente[]; productos: Producto[] }> {
    // 1. Registrar emisor si no tiene token
    await this.registrarEmisor("1792952327001", "SOLUCIONES ANDINAS S.A.S.", "clave12345");

    // 2. Sembrar clientes en la base de datos
    const c1 = await this.registrarCliente({
      tipoIdentificacion: "RUC",
      identificacion: "1722849102001",
      razonSocial: "COMERCIAL LA MODERNA S.A.",
      direccion: "Av. 10 de Agosto N34-11, Quito",
    });

    const c2 = await this.registrarCliente({
      tipoIdentificacion: "CEDULA",
      identificacion: "1003481920",
      razonSocial: "CARLOS ANDRES MORENO MORA",
      direccion: "Calle Bolívar 4-50, Tulcán",
    });

    // 3. Sembrar productos en la base de datos
    const p1 = await this.registrarProducto({
      codigo: "SRV-SFT-01",
      descripcion: "Suscripción Mensual SaaS FacturaEC",
      precioUnitario: 35.0,
      tarifaIva: 15,
    });

    const p2 = await this.registrarProducto({
      codigo: "SRV-SPT-02",
      descripcion: "Soporte Técnico Tributario",
      precioUnitario: 50.0,
      tarifaIva: 15,
    });

    const p3 = await this.registrarProducto({
      codigo: "INS-FIR-03",
      descripcion: "Asesoría en Firma Electrónica SRI",
      precioUnitario: 25.0,
      tarifaIva: 0,
    });

    return {
      clientes: [c1, c2],
      productos: [p1, p2, p3],
    };
  },
};
