"use client";

import React, { useState } from "react";
import { Factura } from "../types/api";

interface DashboardViewProps {
  facturas: Factura[];
  onEnviarSri: (facturaId: number) => void;
  onCrearFacturaClick: () => void;
}

export function DashboardView({
  facturas,
  onEnviarSri,
  onCrearFacturaClick,
}: DashboardViewProps) {
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [filterState, setFilterState] = useState<string>("TODOS");

  const totalFacturado = facturas.reduce((acc, f) => acc + f.total, 0);
  const totalIva = facturas.reduce((acc, f) => acc + f.totalIva, 0);
  const autorizadas = facturas.filter((f) => f.estado === "AUTORIZADA").length;
  const pendientes = facturas.filter((f) => f.estado === "PENDIENTE").length;
  const borradores = facturas.filter((f) => f.estado === "CREADA").length;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const facturasFiltradas = facturas.filter((f) => {
    if (filterState === "TODOS") return true;
    return f.estado === filterState;
  });

  const handleDescargarXml = (factura: Factura) => {
    const fecha = new Date(factura.fechaEmision);
    const fechaStr = `${String(fecha.getDate()).padStart(2, "0")}/${String(fecha.getMonth() + 1).padStart(2, "0")}/${fecha.getFullYear()}`;
    const secuencialLimpio = factura.secuencial.replace(/-/g, "").slice(-9);

    const detallesXml = factura.detalles
      .map(
        (d) => `
    <detalle>
      <codigoPrincipal>${d.codigo}</codigoPrincipal>
      <descripcion>${d.nombre}</descripcion>
      <cantidad>${d.cantidad}</cantidad>
      <precioUnitario>${d.precioUnitario.toFixed(2)}</precioUnitario>
      <descuento>0.00</descuento>
      <precioTotalSinImpuesto>${d.subtotal.toFixed(2)}</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>${d.tarifaIva === 15 ? "4" : d.tarifaIva === 5 ? "5" : "0"}</codigoPorcentaje>
          <tarifa>${d.tarifaIva}.00</tarifa>
          <baseImponible>${d.subtotal.toFixed(2)}</baseImponible>
          <valor>${d.valorIva.toFixed(2)}</valor>
        </impuesto>
      </impuestos>
    </detalle>`
      )
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="2.1.0">
  <infoTributaria>
    <ambiente>1</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>SOLUCIONES ANDINAS S.A.S.</razonSocial>
    <ruc>1792952327001</ruc>
    <claveAcceso>${factura.claveAcceso}</claveAcceso>
    <codDoc>01</codDoc>
    <estab>001</estab>
    <ptoEmi>001</ptoEmi>
    <secuencial>${secuencialLimpio}</secuencial>
    <dirMatriz>Av. Amazonas N24-196 y Luis Cordero, Quito, Ecuador</dirMatriz>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>${fechaStr}</fechaEmision>
    <dirEstablecimiento>Av. Amazonas N24-196 y Luis Cordero, Quito, Ecuador</dirEstablecimiento>
    <tipoIdentificacionComprador>${factura.cliente.rucCedula.length === 13 ? "04" : "05"}</tipoIdentificacionComprador>
    <razonSocialComprador>${factura.cliente.razonSocial}</razonSocialComprador>
    <identificacionComprador>${factura.cliente.rucCedula}</identificacionComprador>
    <totalSinImpuestos>${factura.subtotalSinImpuestos.toFixed(2)}</totalSinImpuestos>
    <totalDescuento>0.00</totalDescuento>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>4</codigoPorcentaje>
        <baseImponible>${factura.subtotalSinImpuestos.toFixed(2)}</baseImponible>
        <valor>${factura.totalIva.toFixed(2)}</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <propina>0.00</propina>
    <importeTotal>${factura.total.toFixed(2)}</importeTotal>
    <moneda>DOLAR</moneda>
  </infoFactura>
  <detalles>${detallesXml}
  </detalles>
  <infoAdicional>
    <campoAdicional nombre="Email">${factura.cliente.correo}</campoAdicional>
    <campoAdicional nombre="Direccion">${factura.cliente.direccion || "N/A"}</campoAdicional>
  </infoAdicional>
</factura>`;

    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Factura_${factura.secuencial}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDescargarRidePdf = (factura: Factura) => {
    const ventana = window.open("", "_blank");
    if (!ventana) return;

    const fecha = new Date(factura.fechaEmision).toLocaleDateString("es-EC");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>RIDE Factura ${factura.secuencial}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; color: #1e293b; padding: 25px; margin: 0; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 15px; }
    .box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; margin-bottom: 12px; }
    .title { font-size: 14px; font-weight: bold; margin-bottom: 4px; }
    .mono { font-family: monospace; font-size: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
    th, td { border: 1px solid #e2e8f0; padding: 6px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    .right { text-align: right; }
    .center { text-align: center; }
    .totales { width: 280px; margin-left: auto; margin-top: 12px; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; }
    .badge-ok { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    @media print { body { padding: 0; } button { display: none; } }
  </style>
</head>
<body>
  <div style="text-align: right; margin-bottom: 10px;">
    <button onclick="window.print()" style="padding: 6px 14px; font-size: 12px; font-weight: bold; cursor: pointer; background: #0f172a; color: white; border: none; border-radius: 4px;">Guardar como PDF / Imprimir</button>
  </div>
  <div class="header">
    <div>
      <div class="title">SOLUCIONES ANDINAS S.A.S.</div>
      <div style="color: #64748b;">FacturaEC Cloud</div>
      <div style="margin-top: 4px;">Matriz: Av. Amazonas N24-196 y Luis Cordero, Quito</div>
      <div>OBLIGADO A LLEVAR CONTABILIDAD: SÍ</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 12px; font-weight: bold;">R.U.C.: 1792952327001</div>
      <div style="font-size: 14px; font-weight: bold; margin-top: 2px;">FACTURA</div>
      <div class="mono" style="font-size: 12px; font-weight: bold;">No. ${factura.secuencial}</div>
      <div style="margin-top: 4px;">
        <span class="badge badge-ok">${factura.estado === "AUTORIZADA" ? "AUTORIZADO POR EL SRI" : "BORRADOR"}</span>
      </div>
    </div>
  </div>

  <div class="box">
    <div style="font-weight: bold; font-size: 10px; margin-bottom: 2px;">CLAVE DE ACCESO (MÓDULO 11):</div>
    <div class="mono" style="font-size: 11px; letter-spacing: 0.5px;">${factura.claveAcceso}</div>
  </div>

  <div class="box">
    <div style="display: flex; justify-content: space-between;">
      <div><strong>Razón Social / Nombres:</strong> ${factura.cliente.razonSocial}</div>
      <div><strong>Identificación:</strong> ${factura.cliente.rucCedula}</div>
    </div>
    <div style="display: flex; justify-content: space-between; margin-top: 4px;">
      <div><strong>Fecha Emisión:</strong> ${fecha}</div>
      <div><strong>Correo:</strong> ${factura.cliente.correo}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Código</th>
        <th>Descripción</th>
        <th class="center">Cant.</th>
        <th class="right">P. Unitario</th>
        <th class="center">IVA</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${factura.detalles
        .map(
          (d) => `
        <tr>
          <td class="mono">${d.codigo}</td>
          <td>${d.nombre}</td>
          <td class="center">${d.cantidad}</td>
          <td class="right mono">$${d.precioUnitario.toFixed(2)}</td>
          <td class="center mono">${d.tarifaIva}%</td>
          <td class="right mono font-semibold">$${d.total.toFixed(2)}</td>
        </tr>`
        )
        .join("")}
    </tbody>
  </table>

  <div class="totales">
    <table>
      <tr><td>SUBTOTAL SIN IMPUESTOS</td><td class="right mono">$${factura.subtotalSinImpuestos.toFixed(2)}</td></tr>
      <tr><td>TOTAL IVA</td><td class="right mono">$${factura.totalIva.toFixed(2)}</td></tr>
      <tr style="font-weight: bold; background: #f8fafc;"><td>VALOR TOTAL</td><td class="right mono">$${factura.total.toFixed(2)} USD</td></tr>
    </table>
  </div>
</body>
</html>`;

    ventana.document.write(html);
    ventana.document.close();
  };

  const getStatusBadge = (estado: Factura["estado"]) => {
    switch (estado) {
      case "AUTORIZADA":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            AUTORIZADA
          </span>
        );
      case "PENDIENTE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            PENDIENTE SRI
          </span>
        );
      case "CREADA":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            BORRADOR
          </span>
        );
      case "RECHAZADA":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            DEVUELTA SRI
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Estilo Fintech */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Facturación */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            <span>Facturación del Mes</span>
            <span className="text-emerald-700 font-semibold font-mono text-[10px] bg-emerald-50 px-1.5 py-0.2 rounded">
              USD
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-2">
            ${totalFacturado.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
            <span className="font-semibold text-slate-700">{facturas.length}</span> comprobantes emitidos
          </div>
        </div>

        {/* Card 2: Autorizadas */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            <span>Autorizadas SRI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-emerald-700 mt-2">
            {autorizadas}
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Validez tributaria confirmada
          </div>
        </div>

        {/* Card 3: Pendientes */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            <span>Pendientes / Cola</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-amber-700 mt-2">
            {pendientes}
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Por reintentar ante el SRI
          </div>
        </div>

        {/* Card 4: Recaudación IVA */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            <span>IVA Recaudado</span>
            <span className="text-[10px] text-slate-400 font-mono">15% / 5%</span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-2">
            ${totalIva.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Crédito tributario registrado
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden">
        {/* Table Filter Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
              Comprobantes Electrónicos
            </h2>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {facturasFiltradas.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filtros de estado */}
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-[11px] font-medium">
              {(["TODOS", "AUTORIZADA", "PENDIENTE", "CREADA"] as const).map((est) => (
                <button
                  key={est}
                  onClick={() => setFilterState(est)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    filterState === est
                      ? "bg-white text-slate-900 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {est === "TODOS" ? "Todos" : est === "CREADA" ? "Borradores" : est}
                </button>
              ))}
            </div>

            <button
              onClick={onCrearFacturaClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Nueva Factura</span>
            </button>
          </div>
        </div>

        {/* Tabla Interactiva */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-medium">
                <th className="py-3 px-4 font-mono">Secuencial</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Cliente / RUC</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">IVA</th>
                <th className="py-3 px-4 text-right">Total (USD)</th>
                <th className="py-3 px-4 text-center">Estado SRI</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {facturasFiltradas.map((f, idx) => (
                <tr
                  key={`factura-${f.id}-${f.secuencial}-${idx}`}
                  onClick={() => setSelectedFactura(f)}
                  className={`cursor-pointer transition-colors ${
                    selectedFactura?.id === f.id
                      ? "bg-blue-50/40"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {f.secuencial}
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(f.fechaEmision).toLocaleDateString("es-EC", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900 truncate max-w-[200px]">
                      {f.cliente.razonSocial}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">
                      {f.cliente.rucCedula}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    ${f.subtotalSinImpuestos.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">
                    ${f.totalIva.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ${f.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {getStatusBadge(f.estado)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFactura(f);
                      }}
                      className="text-slate-500 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-200/50 transition-colors"
                    >
                      Ver →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Lateral de Previsualización (Inspirado en la maqueta UI) */}
      {selectedFactura && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex justify-end transition-opacity">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-left overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Comprobante Electrónico SRI
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Factura {selectedFactura.secuencial}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedFactura.estado)}
                <button
                  onClick={() => setSelectedFactura(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Drawer Body Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Clave de Acceso SRI de 49 dígitos con Código de Barras */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                  <span>Clave de Acceso (Módulo 11)</span>
                  <button
                    onClick={() => copyToClipboard(selectedFactura.claveAcceso)}
                    className="text-blue-600 hover:underline font-mono text-[11px] font-semibold"
                  >
                    {copiedKey ? "✓ Copiada" : "Copiar"}
                  </button>
                </div>
                <div className="font-mono text-slate-800 text-[11px] break-all select-all font-semibold leading-relaxed">
                  {selectedFactura.claveAcceso}
                </div>

                {/* Código de barras simulado SVG */}
                <div className="pt-2 flex flex-col items-center">
                  <div className="h-9 w-full flex items-center justify-between px-2 opacity-75">
                    {[3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1, 4, 1, 3, 2, 4, 1, 2].map((w, i) => (
                      <span
                        key={i}
                        className="bg-slate-800 h-full inline-block"
                        style={{ width: `${w * 1.5}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 mt-1">
                    CÓDIGO DE BARRAS 128 (AUTORIZACIÓN SRI)
                  </span>
                </div>
              </div>

              {/* Datos del Cliente */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Receptor / Cliente
                </h4>
                <div className="p-3.5 bg-white border border-slate-200 rounded-lg text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Razón Social:</span>
                    <span className="font-semibold text-slate-900 text-right">
                      {selectedFactura.cliente.razonSocial}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Identificación:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {selectedFactura.cliente.rucCedula}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Correo Electrónico:</span>
                    <span className="text-slate-700">{selectedFactura.cliente.correo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dirección:</span>
                    <span className="text-slate-700 text-right">{selectedFactura.cliente.direccion || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Ítems Facturados */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Detalle de la Factura
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Ítem</th>
                        <th className="p-2.5 text-right">Cant.</th>
                        <th className="p-2.5 text-right">Precio</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {selectedFactura.detalles.map((d, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-sans font-medium text-slate-800">
                            {d.nombre}
                            <span className="block text-[10px] text-slate-400 font-mono">
                              {d.codigo} · IVA {d.tarifaIva}%
                            </span>
                          </td>
                          <td className="p-2.5 text-right">{d.cantidad}</td>
                          <td className="p-2.5 text-right">${d.precioUnitario.toFixed(2)}</td>
                          <td className="p-2.5 text-right font-semibold text-slate-900">
                            ${d.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resumen Fiscal */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal Sin Impuestos:</span>
                  <span>${selectedFactura.subtotalSinImpuestos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Total IVA:</span>
                  <span>${selectedFactura.totalIva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-300 pt-2 font-bold text-slate-900 text-sm">
                  <span>TOTAL FACTURA:</span>
                  <span>${selectedFactura.total.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-5 border-t border-slate-200 bg-white space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDescargarRidePdf(selectedFactura)}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Descargar RIDE</span>
                </button>
                <button
                  onClick={() => handleDescargarXml(selectedFactura)}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>Descargar XML</span>
                </button>
              </div>

              {selectedFactura.estado !== "AUTORIZADA" && (
                <button
                  onClick={() => {
                    onEnviarSri(selectedFactura.id);
                    setSelectedFactura(null);
                  }}
                  className="w-full px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs"
                >
                  Reenviar al SRI ahora
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
