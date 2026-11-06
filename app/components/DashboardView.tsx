"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Factura } from "../types/api";


function toMoney(val: any): string {
  const num = typeof val === "number" ? val : parseFloat(String(val || 0));
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

function toDateSafe(val: any): string {
  if (!val) return "-";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

interface DashboardViewProps {
  facturas: Factura[];
  onEnviarSri: (facturaId: number) => void;
  onCrearFacturaClick: () => void;
  searchTerm?: string;
}

export function DashboardView({
  facturas,
  onEnviarSri,
  onCrearFacturaClick,
  searchTerm = "",
}: DashboardViewProps) {
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [filterState, setFilterState] = useState<string>("TODOS");

  const facturasList = facturas || [];
  const totalFacturado = facturasList.reduce((acc, f) => acc + (Number(f?.total) || 0), 0);
  const totalIva = facturasList.reduce((acc, f) => acc + (Number(f?.totalIva) || 0), 0);
  const autorizadas = facturasList.filter((f) => f?.estado === "AUTORIZADA").length;
  const pendientes = facturasList.filter((f) => f?.estado === "PENDIENTE").length;
  const borradores = facturasList.filter((f) => f?.estado === "CREADA").length;
  const rechazadas = facturasList.filter((f) => f?.estado === "RECHAZADA").length;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const facturasFiltradas = facturasList.filter((f) => {
    if (!f) return false;
    const matchFilter = filterState === "TODOS" || f.estado === filterState;
    if (!matchFilter) return false;
    if (!searchTerm || !searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      (f.secuencial || "").toLowerCase().includes(q) ||
      (f.claveAcceso || "").toLowerCase().includes(q) ||
      (f.cliente?.razonSocial || "").toLowerCase().includes(q) ||
      (f.cliente?.rucCedula || "").toLowerCase().includes(q)
    );
  });

  const handleDescargarXml = (factura: Factura) => {
    const fecha = new Date(factura.fechaEmision);
    const fechaStr = `${String(fecha.getDate()).padStart(2, "0")}/${String(fecha.getMonth() + 1).padStart(2, "0")}/${fecha.getFullYear()}`;
    const secuencialLimpio = factura.secuencial.replace(/-/g, "").slice(-9);

    const detallesXml = (factura.detalles || [])
      .map(
        (d) => `
    <detalle>
      <codigoPrincipal>${d?.codigo || "PRD"}</codigoPrincipal>
      <descripcion>${d?.nombre || "Producto"}</descripcion>
      <cantidad>${d?.cantidad ?? 1}</cantidad>
      <precioUnitario>${toMoney(d?.precioUnitario)}</precioUnitario>
      <descuento>0.00</descuento>
      <precioTotalSinImpuesto>${toMoney(d?.subtotal)}</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>${d?.tarifaIva === 15 ? "4" : d?.tarifaIva === 5 ? "5" : "0"}</codigoPorcentaje>
          <tarifa>${d?.tarifaIva ?? 15}.00</tarifa>
          <baseImponible>${toMoney(d?.subtotal)}</baseImponible>
          <valor>${toMoney(d?.valorIva)}</valor>
        </impuesto>
      </impuestos>
    </detalle>`
      )
      .join("");

    const rucCedula = factura.cliente?.rucCedula || "9999999999999";
    const razonSocial = factura.cliente?.razonSocial || "Consumidor Final";
    const correo = factura.cliente?.correo || "consumidor@final.ec";
    const direccion = factura.cliente?.direccion || "N/A";
    const subtotalStr = toMoney(factura.subtotalSinImpuestos);
    const ivaStr = toMoney(factura.totalIva);
    const totalStr = toMoney(factura.total);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="2.1.0">
  <infoTributaria>
    <ambiente>1</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>SOLUCIONES ANDINAS S.A.S.</razonSocial>
    <ruc>1792952327001</ruc>
    <claveAcceso>${factura.claveAcceso || ""}</claveAcceso>
    <codDoc>01</codDoc>
    <estab>001</estab>
    <ptoEmi>001</ptoEmi>
    <secuencial>${secuencialLimpio}</secuencial>
    <dirMatriz>Av. Amazonas N24-196 y Luis Cordero, Quito, Ecuador</dirMatriz>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>${fechaStr}</fechaEmision>
    <dirEstablecimiento>Av. Amazonas N24-196 y Luis Cordero, Quito, Ecuador</dirEstablecimiento>
    <tipoIdentificacionComprador>${rucCedula.length === 13 ? "04" : "05"}</tipoIdentificacionComprador>
    <razonSocialComprador>${razonSocial}</razonSocialComprador>
    <identificacionComprador>${rucCedula}</identificacionComprador>
    <totalSinImpuestos>${subtotalStr}</totalSinImpuestos>
    <totalDescuento>0.00</totalDescuento>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>4</codigoPorcentaje>
        <baseImponible>${subtotalStr}</baseImponible>
        <valor>${ivaStr}</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <propina>0.00</propina>
    <importeTotal>${totalStr}</importeTotal>
    <moneda>DOLAR</moneda>
  </infoFactura>
  <detalles>${detallesXml}
  </detalles>
  <infoAdicional>
    <campoAdicional nombre="Email">${correo}</campoAdicional>
    <campoAdicional nombre="Direccion">${direccion}</campoAdicional>
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
    const logoUrl = `${window.location.origin}/HORIZONTAL COLOR.png`;

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>RIDE Factura ${factura.secuencial}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; color: #0f172a; padding: 25px; margin: 0; background: #fff; }
    .print-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
    .btn-print { padding: 8px 18px; font-size: 12px; font-weight: 600; cursor: pointer; background: #004b87; color: white; border: none; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,75,135,0.2); }
    .grid-2 { display: grid; grid-template-columns: 1.1fr 1fr; gap: 15px; margin-bottom: 15px; }
    .box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #fdfdfe; }
    .title-emisor { font-size: 15px; font-weight: bold; color: #004b87; margin-top: 8px; }
    .mono { font-family: monospace; font-size: 11px; word-break: break-all; }
    .barcode-container { background: #0f172a; color: white; padding: 6px; text-align: center; border-radius: 4px; margin-top: 6px; }
    .barcode-lines { height: 32px; background: repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px, #000 4px, #000 6px, #fff 6px, #fff 7px); margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
    th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; color: #334155; }
    .right { text-align: right; }
    .center { text-align: center; }
    .totales-table { width: 340px; margin-left: auto; margin-top: 15px; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; }
    .badge-ok { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .badge-pend { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    @media print { .print-bar { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="print-bar">
    <div style="font-weight: 600; color: #64748b;">Representación Impresa del Documento Electrónico (RIDE SRI Ecuador)</div>
    <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
  </div>

  <div class="grid-2">
    <!-- Columna Izquierda: Datos del Emisor -->
    <div class="box">
      <img src="${logoUrl}" alt="FacturaEC" style="height: 68px; max-width: 280px; width: auto; object-fit: contain; display: block; margin-bottom: 10px;">
      <div class="title-emisor">SOLUCIONES ANDINAS S.A.S.</div>
      <div style="color: #64748b; font-weight: 500; margin-top: 2px;">FacturaEC Cloud</div>
      <div style="margin-top: 10px; line-height: 1.5;">
        <div><strong>Dirección Matriz:</strong> Av. Amazonas N24-196 y Luis Cordero, Quito</div>
        <div><strong>Dirección Sucursal:</strong> Av. Amazonas N24-196, Quito</div>
        <div><strong>Obligado a Llevar Contabilidad:</strong> SÍ</div>
        <div><strong>Agente de Retención:</strong> Resolución No. NAC-DNCRASC20-00000001</div>
      </div>
    </div>

    <!-- Columna Derecha: Datos Tributarios SRI -->
    <div class="box">
      <div style="font-size: 13px; font-weight: bold; color: #004b87;">R.U.C.: 1792952327001</div>
      <div style="font-size: 16px; font-weight: 800; margin: 4px 0;">FACTURA</div>
      <div class="mono" style="font-size: 13px; font-weight: bold;">No. ${factura.secuencial}</div>
      <div style="margin: 6px 0;">
        <span class="badge ${factura.estado === "AUTORIZADA" ? "badge-ok" : "badge-pend"}">
          ${factura.estado === "AUTORIZADA" ? "✓ AUTORIZADO POR EL SRI" : "⏳ PENDIENTE / EN CONTINGENCIA"}
        </span>
      </div>
      <div style="margin-top: 8px; font-size: 10px; line-height: 1.4;">
        <div><strong>NÚMERO DE AUTORIZACIÓN:</strong></div>
        <div class="mono" style="font-size: 10px;">${factura.claveAcceso}</div>
        <div style="margin-top: 4px;"><strong>FECHA Y HORA DE AUTORIZACIÓN:</strong> ${new Date(factura.fechaEmision).toLocaleString("es-EC")}</div>
        <div><strong>AMBIENTE:</strong> PRUEBAS (01)</div>
        <div><strong>EMISIÓN:</strong> NORMAL (01)</div>
      </div>
      <div class="barcode-container">
        <div class="barcode-lines"></div>
        <div class="mono" style="font-size: 9px; letter-spacing: 0.5px;">CLAVE DE ACCESO: ${factura.claveAcceso}</div>
      </div>
    </div>
  </div>

  <!-- Datos del Comprador -->
  <div class="box" style="margin-bottom: 15px;">
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
      <div><strong>Razón Social / Nombres y Apellidos:</strong> ${factura.cliente?.razonSocial || "Consumidor Final"}</div>
      <div><strong>Identificación (RUC/Cédula):</strong> ${factura.cliente?.rucCedula || "9999999999999"}</div>
    </div>
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px; margin-top: 6px;">
      <div><strong>Dirección Comprador:</strong> ${factura.cliente?.direccion || "N/A"}</div>
      <div><strong>Fecha de Emisión:</strong> ${fecha}</div>
    </div>
    <div style="margin-top: 6px;"><strong>Correo Notificación Electrónica:</strong> ${factura.cliente?.correo || "consumidor@final.ec"}</div>
  </div>

  <!-- Tabla de Detalles -->
  <table>
    <thead>
      <tr>
        <th style="width: 100px;">Cod. Principal</th>
        <th>Descripción</th>
        <th class="center" style="width: 50px;">Cant.</th>
        <th class="right" style="width: 80px;">P. Unitario</th>
        <th class="right" style="width: 60px;">Descuento</th>
        <th class="center" style="width: 60px;">IVA</th>
        <th class="right" style="width: 90px;">Precio Total</th>
      </tr>
    </thead>
    <tbody>
      ${(factura.detalles || [])
        .map(
          (d) => `
        <tr>
          <td class="mono">${d?.codigo || "PRD"}</td>
          <td>${d?.nombre || "Producto"}</td>
          <td class="center">${d?.cantidad ?? 1}</td>
          <td class="right mono">$${toMoney(d?.precioUnitario)}</td>
          <td class="right mono">$0.00</td>
          <td class="center mono">${d?.tarifaIva ?? 15}%</td>
          <td class="right mono font-semibold">$${toMoney(d?.total)}</td>
        </tr>`
        )
        .join("")}
    </tbody>
  </table>

  <!-- Información Adicional y Totales -->
  <div style="display: grid; grid-template-columns: 1fr 340px; gap: 15px; margin-top: 10px;">
    <div class="box">
      <div style="font-weight: bold; margin-bottom: 6px; color: #004b87;">INFORMACIÓN ADICIONAL</div>
      <div style="font-size: 10px; line-height: 1.5;">
        <div><strong>Email:</strong> ${factura.cliente.correo}</div>
        <div><strong>Teléfono:</strong> ${factura.cliente.telefono || "N/A"}</div>
        <div><strong>Forma de Pago:</strong> 20 - OTROS CON UTILIZACIÓN DEL SISTEMA FINANCIERO ($${factura.total.toFixed(2)})</div>
        <div><strong>Plazo:</strong> 0 días</div>
      </div>
    </div>

    <div class="totales-table">
      <table>
        <tr><td>SUBTOTAL 15%</td><td class="right mono">$${(factura.detalles.filter(d => d.tarifaIva === 15).reduce((s,d) => s + d.subtotal, 0)).toFixed(2)}</td></tr>
        <tr><td>SUBTOTAL 5%</td><td class="right mono">$${(factura.detalles.filter(d => d.tarifaIva === 5).reduce((s,d) => s + d.subtotal, 0)).toFixed(2)}</td></tr>
        <tr><td>SUBTOTAL 0%</td><td class="right mono">$${(factura.detalles.filter(d => d.tarifaIva === 0).reduce((s,d) => s + d.subtotal, 0)).toFixed(2)}</td></tr>
        <tr><td>SUBTOTAL SIN IMPUESTOS</td><td class="right mono">$${factura.subtotalSinImpuestos.toFixed(2)}</td></tr>
        <tr><td>TOTAL DESCUENTO</td><td class="right mono">$0.00</td></tr>
        <tr><td>IVA 15%</td><td class="right mono">$${factura.totalIva.toFixed(2)}</td></tr>
        <tr style="font-weight: bold; background: #f1f5f9; font-size: 12px; color: #004b87;">
          <td>VALOR TOTAL</td>
          <td class="right mono">$${factura.total.toFixed(2)} USD</td>
        </tr>
      </table>
    </div>
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
            PENDIENTE (E2)
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
      {/* KPI Cards Estilo Fintech con Tendencias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Facturación */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            <span>Facturación del Mes</span>
            <span className="text-emerald-700 font-semibold font-mono text-[10px] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
              +15.2%
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
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs hover:border-slate-300 transition-all">
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

        {/* Card 3: Pendientes / Contingencia */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            <span>Contingencia (E2)</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-amber-700 mt-2">
            {pendientes}
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Comprobantes en cola SRI
          </div>
        </div>

        {/* Card 4: Recaudación IVA */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            <span>IVA Recaudado</span>
            <span className="text-[10px] text-blue-700 font-mono font-medium bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">
              15% / 5%
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-2">
            ${totalIva.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Crédito tributario generado
          </div>
        </div>
      </div>

      {/* Gráfico Visual de Ventas y Rendimiento */}
      <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Evolución de Emisión & Recaudación
            </h3>
            <p className="text-[11px] text-slate-500">
              Volumen de facturación electrónica y cumplimiento de impuestos SRI
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-600"></span>
              <span className="text-slate-600 text-[11px]">Subtotal Ventas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
              <span className="text-slate-600 text-[11px]">IVA 15%</span>
            </div>
          </div>
        </div>

        {/* Mock Chart Visual Bars */}
        <div className="mt-4 grid grid-cols-7 gap-3 items-end h-32 pt-4 px-2">
          {[
            { dia: "Lun", total: 45, iva: 6.75 },
            { dia: "Mar", total: 80, iva: 12.0 },
            { dia: "Mié", total: 110, iva: 16.5 },
            { dia: "Jue", total: 70, iva: 10.5 },
            { dia: "Vie", total: 138, iva: 18.0 },
            { dia: "Sáb", total: 35, iva: 5.25 },
            { dia: "Dom", total: 20, iva: 3.0 },
          ].map((bar, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full max-w-[36px] flex flex-col justify-end bg-slate-100 rounded-t-lg overflow-hidden h-24">
                <div
                  style={{ height: `${(bar.iva / 25) * 100}%` }}
                  className="w-full bg-amber-400"
                  title={`IVA: $${bar.iva.toFixed(2)}`}
                />
                <div
                  style={{ height: `${(bar.total / 150) * 100}%` }}
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                  title={`Total: $${bar.total.toFixed(2)}`}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500">{bar.dia}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        {/* Table Filter Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
              Comprobantes Electrónicos
            </h2>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {facturasFiltradas.length}
            </span>
            {searchTerm && (
              <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-medium">
                Filtrado por: "{searchTerm}"
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Filtros de estado */}
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-[11px] font-medium">
              {(["TODOS", "AUTORIZADA", "PENDIENTE", "CREADA", "RECHAZADA"] as const).map((est) => (
                <button
                  key={est}
                  onClick={() => setFilterState(est)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    filterState === est
                      ? "bg-white text-slate-900 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {est === "TODOS"
                    ? `Todos (${facturas.length})`
                    : est === "CREADA"
                    ? `Borradores (${borradores})`
                    : est === "PENDIENTE"
                    ? `Contingencia (${pendientes})`
                    : est === "RECHAZADA"
                    ? `Rechazadas (${rechazadas})`
                    : `Autorizadas (${autorizadas})`}
                </button>
              ))}
            </div>

            <button
              onClick={onCrearFacturaClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-all cursor-pointer"
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
                <th className="py-3 px-4">Fecha Emisión</th>
                <th className="py-3 px-4">Cliente / Adquirente</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">IVA</th>
                <th className="py-3 px-4 text-right">Total (USD)</th>
                <th className="py-3 px-4 text-center">Estado SRI</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {facturasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontraron comprobantes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                facturasFiltradas.map((f, idx) => (
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
                      {f.secuencial || `FAC-${f.id}`}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {toDateSafe(f.fechaEmision)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 truncate max-w-[200px]">
                        {f.cliente?.razonSocial || "Consumidor Final"}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {f.cliente?.rucCedula || "9999999999999"}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      ${toMoney(f.subtotalSinImpuestos)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      ${toMoney(f.totalIva)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${toMoney(f.total)}
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
                        className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        Ver Detalle →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Lateral de Previsualización */}
      {selectedFactura && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex justify-end transition-opacity">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                  <Image
                    src="/ICON.png"
                    alt="FacturaEC"
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                    Comprobante Electrónico SRI
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    Factura {selectedFactura.secuencial}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedFactura(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Clave de Acceso Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                  <span>CLAVE DE ACCESO (49 DÍGITOS - MÓDULO 11)</span>
                  <button
                    onClick={() => copyToClipboard(selectedFactura.claveAcceso)}
                    className="text-blue-600 hover:text-blue-700 text-[11px] font-mono font-medium cursor-pointer"
                  >
                    {copiedKey ? "✓ Copiada" : "Copiar"}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-slate-800 break-all bg-white p-2.5 rounded-lg border border-slate-200 shadow-inner">
                  {selectedFactura.claveAcceso}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Estado: {getStatusBadge(selectedFactura.estado)}</span>
                  <span>Intentos: {selectedFactura.intentosEnvio}</span>
                </div>
              </div>

              {/* Cliente Info */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-2">
                <div className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                  Datos del Adquirente
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Razón Social:</span>
                    <span className="font-medium text-slate-800">{selectedFactura.cliente?.razonSocial || "Consumidor Final"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">RUC / Cédula:</span>
                    <span className="font-mono font-medium text-slate-800">{selectedFactura.cliente?.rucCedula || "9999999999999"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Correo para RIDE:</span>
                    <span className="text-slate-700">{selectedFactura.cliente?.correo || "consumidor@final.ec"}</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                  Detalle de Ítems
                </div>
                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                  {(selectedFactura.detalles || []).length === 0 ? (
                    <div className="p-4 text-center text-slate-400 italic">Sin ítems detallados</div>
                  ) : (
                    (selectedFactura.detalles || []).map((d, i) => (
                      <div key={i} className="p-3 flex items-center justify-between text-[11px]">
                        <div>
                          <div className="font-medium text-slate-800">{d?.nombre || `Ítem #${i + 1}`}</div>
                          <div className="text-slate-400 font-mono text-[10px]">
                            {d?.codigo || "PRD"} · {d?.cantidad ?? 1} x ${toMoney(d?.precioUnitario)} (IVA {d?.tarifaIva ?? 15}%)
                          </div>
                        </div>
                        <div className="font-mono font-bold text-slate-900">
                          ${toMoney(d?.total)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Totales Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Sin Impuestos:</span>
                  <span>${toMoney(selectedFactura.subtotalSinImpuestos)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total IVA:</span>
                  <span>${toMoney(selectedFactura.totalIva)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-2 text-sm">
                  <span>TOTAL A PAGAR:</span>
                  <span>${toMoney(selectedFactura.total)} USD</span>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-2">
              <button
                onClick={() => handleDescargarXml(selectedFactura)}
                className="flex-1 py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-medium transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Descargar XML</span>
              </button>
              <button
                onClick={() => handleDescargarRidePdf(selectedFactura)}
                className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-medium transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Ver / Imprimir RIDE</span>
              </button>
              {selectedFactura.estado !== "AUTORIZADA" && (
                <button
                  onClick={() => onEnviarSri(selectedFactura.id)}
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Reintentar SRI</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
