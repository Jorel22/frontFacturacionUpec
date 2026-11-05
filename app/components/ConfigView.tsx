"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Emisor } from "../types/api";

interface ConfigViewProps {
  emisor: Emisor;
  onActualizarEmisor: (emisor: Emisor) => void;
  apiStatus: "conectado" | "desconectado" | "verificando";
}

export function ConfigView({
  emisor,
  onActualizarEmisor,
  apiStatus,
}: ConfigViewProps) {
  const [formData, setFormData] = useState<Emisor>(emisor);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onActualizarEmisor(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Parámetros del Emisor y Conectividad SRI
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Datos fiscales para la generación del XML v2.1.0 y la clave de acceso de 49 dígitos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-mono font-medium flex items-center gap-1.5 ${
              apiStatus === "conectado"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus === "conectado" ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {apiStatus === "conectado" ? "FastAPI Online" : "Modo Offline"}
          </span>
        </div>
      </div>

      {/* Tarjeta de Logotipo Corporativo */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          1. Identidad Visual & Logotipo Oficial
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
            <Image
              src="/HORIZONTAL COLOR.png"
              alt="FacturaEC Logo"
              width={160}
              height={40}
              style={{ width: "auto", height: "auto" }}
              className="h-10 object-contain"
            />
          </div>
          <div className="text-xs space-y-1">
            <div className="font-semibold text-slate-800">Logotipo Activo: FacturaEC</div>
            <p className="text-slate-500 text-[11px]">
              Este logotipo se imprime automáticamente en la cabecera de las facturas RIDE oficiales y en el menú del sistema.
            </p>
            <div className="text-[10px] text-emerald-600 font-mono font-medium flex items-center gap-1 pt-1">
              <span>✓ Formatos disponibles: Horizontal, Vertical, Icono y Monocromático</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de Datos Tributarios */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-xl p-6 space-y-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          2. Datos Tributarios del Emisor
        </h3>

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-medium">
            ✓ Parámetros actualizados con éxito.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">RUC del Emisor (13 dígitos) *</label>
            <input
              type="text"
              required
              maxLength={13}
              value={formData.ruc}
              onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
              className="w-full font-mono border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Razón Social *</label>
            <input
              type="text"
              required
              value={formData.razonSocial}
              onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Nombre Comercial</label>
            <input
              type="text"
              value={formData.nombreComercial || ""}
              onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Correo Electrónico Contable *</label>
            <input
              type="email"
              required
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-700 font-medium mb-1">Dirección Matriz *</label>
            <input
              type="text"
              required
              value={formData.direccionMatriz}
              onChange={(e) => setFormData({ ...formData, direccionMatriz: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Sección técnica SRI & Microservicio */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            3. Integración con Microservicios (FastAPI & Supabase Edge Function)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-semibold text-slate-800 block text-[11px]">Backend Principal</span>
              <span className="font-mono text-slate-500 text-[10px]">http://localhost:8000</span>
              <span className="text-[10px] text-emerald-600 block mt-1">✓ FastAPI + SQLite (facturaec.db)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-semibold text-slate-800 block text-[11px]">Gateway SRI (Edge Function)</span>
              <span className="font-mono text-slate-500 text-[10px]">/functions/v1/sri-gateway</span>
              <span className="text-[10px] text-blue-600 block mt-1">✓ Deno/Supabase (Módulo 11 + E2)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
