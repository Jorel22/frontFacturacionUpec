"use client";

import React, { useState } from "react";
import { Producto, TarifaIva } from "../types/api";

interface ProductosViewProps {
  productos: Producto[];
  onAgregarProducto: (producto: Producto) => void;
  searchTerm?: string;
}

export function ProductosView({ productos, onAgregarProducto, searchTerm = "" }: ProductosViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [tarifaIva, setTarifaIva] = useState<TarifaIva>(15);

  const productosFiltrados = productos.filter((p) => {
    if (!searchTerm || !searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      p.codigo.toLowerCase().includes(q) ||
      p.nombre.toLowerCase().includes(q)
    );
  });

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
      {/* Header Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Catálogo de Bienes & Servicios</h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {productosFiltrados.length} ítems
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tarifas autorizadas por el SRI: 15% (General), 5% (Materiales) y 0% (Servicios exentos)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <span>+ Nuevo Producto</span>
        </button>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-medium">
              <th className="py-3 px-4 font-mono">Código Principal</th>
              <th className="py-3 px-4">Descripción del Ítem</th>
              <th className="py-3 px-4 text-right">Precio Unitario</th>
              <th className="py-3 px-4 text-center">Tarifa IVA</th>
              <th className="py-3 px-4 text-right">Precio con IVA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No se encontraron productos que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              productosFiltrados.map((p, idx) => {
                const conIva = p.precioUnitario * (1 + p.tarifaIva / 100);
                return (
                  <tr key={`producto-${p.id}-${p.codigo}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px]">
                        {p.codigo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{p.nombre}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-900 font-medium">
                      ${p.precioUnitario.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          p.tarifaIva === 15
                            ? "text-blue-700 bg-blue-50 border border-blue-200"
                            : p.tarifaIva === 5
                            ? "text-purple-700 bg-purple-50 border border-purple-200"
                            : "text-slate-600 bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {p.tarifaIva}% IVA
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ${conIva.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Nuevo Producto */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Registrar Producto / Servicio</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Código Principal (SKU) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. SRV-001 o MAT-02"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 font-mono uppercase text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Descripción del Ítem *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Consultoría de Software o Papel Químico"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Precio Unitario ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={precioUnitario}
                    onChange={(e) => setPrecioUnitario(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tarifa de IVA (SRI) *</label>
                  <select
                    value={tarifaIva}
                    onChange={(e) => setTarifaIva(Number(e.target.value) as TarifaIva)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={15}>15% (General)</option>
                    <option value={5}>5% (Materiales)</option>
                    <option value={0}>0% (Exento)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
              >
                Guardar Producto
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
