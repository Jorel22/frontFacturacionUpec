"use client";

import React, { useState } from "react";
import { Cliente } from "../types/api";

interface ClientesViewProps {
  clientes: Cliente[];
  onAgregarCliente: (cliente: Cliente) => void;
  searchTerm?: string;
}

export function ClientesView({ clientes, onAgregarCliente, searchTerm = "" }: ClientesViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [rucCedula, setRucCedula] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  const clientesFiltrados = clientes.filter((c) => {
    if (!searchTerm || !searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      c.rucCedula.toLowerCase().includes(q) ||
      c.razonSocial.toLowerCase().includes(q) ||
      c.correo.toLowerCase().includes(q) ||
      (c.direccion && c.direccion.toLowerCase().includes(q))
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rucCedula || !razonSocial || !correo) return;

    const nuevo: Cliente = {
      id: Date.now(),
      rucCedula,
      razonSocial,
      correo,
      direccion,
      telefono,
    };

    onAgregarCliente(nuevo);
    setShowModal(false);
    setRucCedula("");
    setRazonSocial("");
    setCorreo("");
    setDireccion("");
    setTelefono("");
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Directorio de Clientes</h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {clientesFiltrados.length} clientes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Adquirentes registrados y aislados conforme al Escenario de Calidad E1
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <span>+ Nuevo Cliente</span>
        </button>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-medium">
              <th className="py-3 px-4">Identificación</th>
              <th className="py-3 px-4">Razón Social / Nombre</th>
              <th className="py-3 px-4">Correo Notificación</th>
              <th className="py-3 px-4">Dirección</th>
              <th className="py-3 px-4">Teléfono</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No se encontraron clientes que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              clientesFiltrados.map((c, idx) => (
                <tr key={`cliente-${c.id}-${c.rucCedula}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {c.rucCedula}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      {c.rucCedula.length === 13 ? "RUC" : "CÉDULA"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {c.razonSocial.charAt(0)}
                      </div>
                      <div className="font-semibold text-slate-900">{c.razonSocial}</div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{c.correo}</td>
                  <td className="py-3.5 px-4 text-slate-500">{c.direccion || "—"}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{c.telefono || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Nuevo Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Registrar Nuevo Cliente</h3>
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
                <label className="block text-slate-700 font-medium mb-1">RUC o Cédula *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 1792952327001 o 1003481920"
                  value={rucCedula}
                  onChange={(e) => setRucCedula(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Razón Social o Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nombre de la empresa o persona natural"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Correo Electrónico (Notificación RIDE) *</label>
                <input
                  type="email"
                  required
                  placeholder="cliente@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="0991234567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Dirección</label>
                  <input
                    type="text"
                    placeholder="Ciudad o calle principal"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                Guardar Cliente
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
