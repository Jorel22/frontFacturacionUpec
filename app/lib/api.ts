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

export const MOCK_CLIENTES: Cliente[] = [];
export const MOCK_PRODUCTOS: Producto[] = [];
export const MOCK_FACTURAS: Factura[] = [];

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

  async listarClientes(): Promise<Cliente[]> {
    const list = await apiFetch<any[]>("/api/v1/clientes");
    return list.map((res) => ({
      id: res.id,
      rucCedula: res.identificacion,
      razonSocial: res.razonSocial || res.razon_social,
      correo: "contacto@" + (res.identificacion || "cliente").slice(0, 8) + ".ec",
      direccion: res.direccion || "",
    }));
  },

  async listarProductos(): Promise<Producto[]> {
    const list = await apiFetch<any[]>("/api/v1/productos");
    return list.map((res) => ({
      id: res.id,
      codigo: res.codigo,
      nombre: res.descripcion,
      precioUnitario: parseFloat(res.precioUnitario || res.precio_unitario || "0"),
      tarifaIva: res.tarifaIva ?? res.tarifa_iva ?? 15,
    }));
  },

  async listarFacturas(clientesList: Cliente[] = []): Promise<Factura[]> {
    const list = await apiFetch<any[]>("/api/v1/facturas");
    const clientesMap = new Map<number, Cliente>(clientesList.map((c) => [c.id, c]));

    return list.map((f) => {
      const clienteEncontrado = clientesMap.get(f.cliente_id || f.clienteId) || {
        id: f.cliente_id || f.clienteId || 0,
        rucCedula: "Consumidor Final",
        razonSocial: "Cliente #" + (f.cliente_id || f.clienteId || 0),
        correo: "",
        direccion: "",
      };

      const detalles: DetalleFactura[] = (f.detalles || []).map((d: any, idx: number) => ({
        productoId: d.producto_id || d.productoId || idx + 1,
        codigo: `PRD-${d.producto_id || d.productoId || idx + 1}`,
        nombre: d.descripcion || "Producto",
        cantidad: d.cantidad,
        precioUnitario: parseFloat(d.precio_unitario || d.precioUnitario || "0"),
        tarifaIva: d.tarifa_iva ?? d.tarifaIva ?? 15,
        subtotal: parseFloat(d.subtotal || "0"),
        valorIva: parseFloat(d.iva || "0"),
        total: parseFloat(d.subtotal || "0") + parseFloat(d.iva || "0"),
      }));

      return {
        id: f.id,
        secuencial: f.numero || `001-001-${String(f.secuencial || f.id).padStart(9, "0")}`,
        claveAcceso: f.clave_acceso || f.claveAcceso || "",
        fechaEmision: f.fecha_emision || f.fechaEmision || new Date().toISOString(),
        estado: f.estado,
        cliente: clienteEncontrado,
        subtotalSinImpuestos: parseFloat(f.subtotal || "0"),
        totalIva: parseFloat(f.iva || "0"),
        total: parseFloat(f.total || "0"),
        intentosEnvio: f.intentos_envio ?? f.intentosEnvio ?? 1,
        detalles,
      };
    });
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
