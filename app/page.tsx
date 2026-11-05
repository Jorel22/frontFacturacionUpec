"use client";

import React, { useEffect, useState } from "react";
import { Shell } from "./components/Shell";
import { DashboardView } from "./components/DashboardView";
import { NuevaFacturaView } from "./components/NuevaFacturaView";
import { ClientesView } from "./components/ClientesView";
import { ProductosView } from "./components/ProductosView";
import { ConfigView } from "./components/ConfigView";
import { LoginView } from "./components/LoginView";
import {
  api,
  MOCK_CLIENTES,
  MOCK_EMISOR,
  MOCK_FACTURAS,
  MOCK_PRODUCTOS,
} from "./lib/api";
import { Cliente, Emisor, Factura, Producto } from "./types/api";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [tab, setTab] = useState<"facturas" | "nueva" | "clientes" | "productos" | "config">("facturas");
  const [emisor, setEmisor] = useState<Emisor>(MOCK_EMISOR);
  const [facturas, setFacturas] = useState<Factura[]>(MOCK_FACTURAS);
  const [clientes, setClientes] = useState<Cliente[]>(MOCK_CLIENTES);
  const [productos, setProductos] = useState<Producto[]>(MOCK_PRODUCTOS);
  const [apiStatus, setApiStatus] = useState<"conectado" | "desconectado" | "verificando">("verificando");
  const [syncLoading, setSyncLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [simularCaidaSri, setSimularCaidaSri] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Verificar estado del backend FastAPI en localhost:8000
  useEffect(() => {
    async function checkApi() {
      const ok = await api.verificarSalud();
      setApiStatus(ok ? "conectado" : "desconectado");
    }
    checkApi();
    const interval = setInterval(checkApi, 8000);
    return () => clearInterval(interval);
  }, []);

  // Verificar si hay sesión recordada
  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("facturaec_user_session");
      if (session) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("facturaec_user_session");
    }
    setIsAuthenticated(false);
    showNotification("Sesión finalizada exitosamente.");
  };

  // Sembrar datos de prueba en la base de datos de FastAPI (facturaec.db)
  const handleSembrarDatosApi = async () => {
    if (apiStatus !== "conectado") {
      showNotification("La API no está disponible en http://localhost:8000");
      return;
    }
    setSyncLoading(true);
    try {
      const res = await api.sembrarDatosEnBackend();
      setClientes(res.clientes);
      setProductos(res.productos);
      showNotification("¡Datos iniciales sembrados con éxito en la base de datos de FastAPI!");
    } catch (err: any) {
      showNotification(`Aviso: ${err.message || "Error al sembrar datos"}`);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleEnviarSri = async (facturaId: number) => {
    try {
      // Si el usuario activó la simulación de caída (Escenario E2)
      if (simularCaidaSri) {
        setFacturas((prev) =>
          prev.map((f) =>
            f.id === facturaId
              ? {
                  ...f,
                  estado: "PENDIENTE",
                  intentosEnvio: f.intentosEnvio + 1,
                }
              : f
          )
        );
        showNotification(
          `Factura #${facturaId}: SRI no responde (Escenario E2). Comprobante en contingencia.`
        );
        return;
      }

      if (apiStatus === "conectado") {
        const res = await api.enviarSri(facturaId);
        setFacturas((prev) =>
          prev.map((f) =>
            f.id === facturaId
              ? {
                  ...f,
                  estado: res.estado,
                  intentosEnvio: res.intentosTotales,
                }
              : f
          )
        );
        showNotification(`Factura #${facturaId}: ${res.mensaje}`);
      } else {
        // Simulación en modo demo local
        setFacturas((prev) =>
          prev.map((f) =>
            f.id === facturaId
              ? {
                  ...f,
                  estado: "AUTORIZADA",
                  intentosEnvio: f.intentosEnvio + 1,
                }
              : f
          )
        );
        showNotification(`Factura #${facturaId} autorizada por el SRI (Modo Simulación)`);
      }
    } catch (err: any) {
      showNotification(`Error al enviar al SRI: ${err.message}`);
    }
  };

  const handleGuardarFactura = async (nueva: Factura, enviarAlSri: boolean) => {
    if (simularCaidaSri && enviarAlSri) {
      const facturaContingencia: Factura = {
        ...nueva,
        estado: "PENDIENTE",
        intentosEnvio: 1,
      };
      setFacturas((prev) => [facturaContingencia, ...prev]);
      setTab("facturas");
      showNotification(
        `Factura ${nueva.secuencial} guardada en contingencia PENDIENTE (Escenario E2).`
      );
      return;
    }

    if (apiStatus === "conectado") {
      try {
        const datosEnvio = {
          clienteId: nueva.cliente.id,
          detalles: nueva.detalles.map((d) => ({
            productoId: d.productoId,
            cantidad: d.cantidad,
          })),
        };

        const resFactura = await api.crearFactura(datosEnvio);
        let estadoFinal = resFactura.estado;

        if (enviarAlSri) {
          const resSri = await api.enviarSri(resFactura.id);
          estadoFinal = resSri.estado;
        }

        const facturaFinal: Factura = {
          ...nueva,
          id: resFactura.id,
          secuencial: resFactura.numero || resFactura.secuencial || nueva.secuencial,
          claveAcceso: resFactura.claveAcceso || resFactura.clave_acceso || nueva.claveAcceso,
          estado: estadoFinal,
        };

        setFacturas((prev) => [facturaFinal, ...prev]);
        setTab("facturas");
        showNotification(
          enviarAlSri
            ? `Factura ${facturaFinal.secuencial} guardada en BD y autorizada por SRI.`
            : `Factura ${facturaFinal.secuencial} guardada como Borrador en BD.`
        );
        return;
      } catch (err: any) {
        showNotification(`Error en API: ${err.message}. Guardando en modo local.`);
      }
    }

    // Modo local / contingencia
    setFacturas((prev) => [nueva, ...prev]);
    setTab("facturas");
    showNotification(
      enviarAlSri
        ? `Factura ${nueva.secuencial} emitida y autorizada por SRI.`
        : `Factura ${nueva.secuencial} guardada en estado Borrador.`
    );
  };

  const handleAgregarCliente = async (cliente: Cliente) => {
    if (apiStatus === "conectado") {
      try {
        const creado = await api.registrarCliente({
          tipoIdentificacion: cliente.rucCedula.length === 13 ? "RUC" : "CEDULA",
          identificacion: cliente.rucCedula,
          razonSocial: cliente.razonSocial,
          direccion: cliente.direccion,
        });
        setClientes((prev) => [...prev, creado]);
        showNotification(`Cliente "${creado.razonSocial}" guardado en la base de datos de FastAPI.`);
        return;
      } catch (err: any) {
        showNotification(`Error en API al crear cliente: ${err.message}`);
      }
    }
    setClientes((prev) => [...prev, cliente]);
    showNotification(`Cliente "${cliente.razonSocial}" agregado exitosamente.`);
  };

  const handleAgregarProducto = async (prod: Producto) => {
    if (apiStatus === "conectado") {
      try {
        const creado = await api.registrarProducto({
          codigo: prod.codigo,
          descripcion: prod.nombre,
          precioUnitario: prod.precioUnitario,
          tarifaIva: prod.tarifaIva,
        });
        setProductos((prev) => [...prev, creado]);
        showNotification(`Producto "${creado.nombre}" guardado en la base de datos de FastAPI.`);
        return;
      } catch (err: any) {
        showNotification(`Error en API al crear producto: ${err.message}`);
      }
    }
    setProductos((prev) => [...prev, prod]);
    showNotification(`Producto "${prod.nombre}" agregado exitosamente.`);
  };

  // Si no está autenticado, renderizar la pantalla de Login
  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={() => setIsAuthenticated(true)}
        apiStatus={apiStatus}
      />
    );
  }

  return (
    <Shell
      emisor={emisor}
      currentTab={tab}
      onTabChange={setTab}
      apiStatus={apiStatus}
      onSincronizarApi={handleSembrarDatosApi}
      syncLoading={syncLoading}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      simularCaidaSri={simularCaidaSri}
      onToggleSimularCaida={() => {
        setSimularCaidaSri((prev) => !prev);
        showNotification(
          !simularCaidaSri
            ? "Escenario E2 activado: Caída y contingencia del SRI simulada."
            : "Escenario E2 desactivado: SRI operando con normalidad."
        );
      }}
      onLogout={handleLogout}
    >
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-slate-700 font-medium animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{notification}</span>
        </div>
      )}

      {tab === "facturas" && (
        <DashboardView
          facturas={facturas}
          onEnviarSri={handleEnviarSri}
          onCrearFacturaClick={() => setTab("nueva")}
          searchTerm={searchTerm}
        />
      )}

      {tab === "nueva" && (
        <NuevaFacturaView
          clientes={clientes}
          productos={productos}
          onGuardarFactura={handleGuardarFactura}
          onCancelar={() => setTab("facturas")}
          simularCaidaSri={simularCaidaSri}
        />
      )}

      {tab === "clientes" && (
        <ClientesView
          clientes={clientes}
          onAgregarCliente={handleAgregarCliente}
          searchTerm={searchTerm}
        />
      )}

      {tab === "productos" && (
        <ProductosView
          productos={productos}
          onAgregarProducto={handleAgregarProducto}
          searchTerm={searchTerm}
        />
      )}

      {tab === "config" && (
        <ConfigView
          emisor={emisor}
          onActualizarEmisor={(nuevo) => {
            setEmisor(nuevo);
            showNotification("Datos del emisor actualizados.");
          }}
          apiStatus={apiStatus}
        />
      )}
    </Shell>
  );
}
