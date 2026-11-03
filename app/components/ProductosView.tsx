"use client";

import React, { useState } from "react";
import { Producto, TarifaIva } from "../types/api";

interface ProductosViewProps {
  productos: Producto[];
  onAgregarProducto: (producto: Producto) => void;
}

export function ProductosView({ productos, onAgregarProducto }: ProductosViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [tarifaIva, setTarifaIva] = useState<TarifaIva>(15);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo || !nombre || !precioUnitario) return;

    const nuevo: Producto = {
      id: Date.now(),
      codigo: codigo.toUpperCase(),
      nombre,
      precioUnitario: parseFloat(precioUnitario),
      tarifaIva,
    };

    onAgregarProducto(nuevo);
    setShowModal(false);
    setCodigo("");
    setNombre("");
    setPrecioUnitario("");
    setTarifaIva(15);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded p-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Catálogo de Productos y Servicios</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tarifas autorizadas por el SRI: 0%, 5% (materiales) y 15% (general)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
        >
          + Nuevo Ítem
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="py-2.5 px-4 font-mono">Código</th>
              <th className="py-2.5 px-4">Descripción del Ítem</th>
              <th className="py-2.5 px-4 text-right">Precio Unitario</th>
              <th className="py-2.5 px-4 text-center">Tarifa de IVA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {productos.map((p, idx) => (
              <tr key={`producto-${p.id}-${p.codigo}-${idx}`} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-semibold text-slate-900">{p.codigo}</td>
                <td className="py-3 px-4 font-medium">{p.nombre}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-900 font-medium">
                  ${p.precioUnitario.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      p.tarifaIva === 15
                        ? "text-blue-800 bg-blue-50 border border-blue-200"
                        : p.tarifaIva === 5
                        ? "text-purple-800 bg-purple-50 border border-purple-200"
                        : "text-slate-700 bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {p.tarifaIva}% IVA
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded max-w-md w-full p-6 space-y-4 shadow-xl"
          >
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Registrar Producto / Servicio</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Código Principal *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. SRV-01"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Precio Unitario ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={precioUnitario}
                    onChange={(e) => setPrecioUnitario(e.target.value)}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 font-mono text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Descripción / Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder="Detalle claro del bien o servicio"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Tarifa de IVA Aplicable *</label>
                <select
                  value={tarifaIva}
                  onChange={(e) => setTarifaIva(Number(e.target.value) as TarifaIva)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-white text-slate-900"
                >
                  <option value={15}>15% — Tarifa General Vigente</option>
                  <option value={5}>5% — Materiales de Construcción</option>
                  <option value={0}>0% — Bienes y Servicios Exentos</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded"
              >
                Guardar Ítem
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
