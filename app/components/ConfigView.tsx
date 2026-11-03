"use client";

import React, { useState } from "react";
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
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white border border-slate-200 rounded p-5 space-y-1">
        <h2 className="text-sm font-semibold text-slate-900">
          Parámetros del Emisor y Conexión Tributaria
        </h2>
        <p className="text-xs text-slate-500">
          Datos de cabecera obligatorios para la generación de la clave de acceso de 49 dígitos
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">RUC del Emisor (13 dígitos) *</label>
            <input
              type="text"
              required
              maxLength={13}
              value={formData.ruc}
              onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
              className="w-full font-mono border border-slate-200 rounded px-2.5 py-1.5 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Razón Social *</label>
            <input
              type="text"
              required
              value={formData.razonSocial}
              onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
              className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Nombre Comercial</label>
            <input
              type="text"
              value={formData.nombreComercial || ""}
              onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
              className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Correo Electrónico Contable</label>
            <input
              type="email"
              required
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-slate-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-600 font-medium mb-1">Dirección Matriz</label>
            <input
              type="text"
              required
              value={formData.direccionMatriz}
              onChange={(e) => setFormData({ ...formData, direccionMatriz: e.target.value })}
              className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-slate-900"
            />
          </div>
        </div>

        {/* Sección técnica SRI */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Conexión con el Backend y Adaptador SRI
          </h3>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Servicio API FastAPI:</span>
              <span className="font-mono text-slate-900 font-semibold">http://localhost:8000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Estado de Comunicación:</span>
              <span
                className={`font-semibold ${
                  apiStatus === "conectado" ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {apiStatus === "conectado" ? "En Línea (Conectado)" : "Modo Local Autónomo"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Recepción / Autorización SRI:</span>
              <span className="text-slate-700 font-mono text-[11px]">
                SriGateway (Simulado / Adaptador externo)
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-sm"
          >
            {saved ? "¡Cambios Guardados!" : "Guardar Configuración"}
          </button>
        </div>
      </form>
    </div>
  );
}
