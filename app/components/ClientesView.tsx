"use client";

import React, { useState } from "react";
import { Cliente } from "../types/api";

interface ClientesViewProps {
  clientes: Cliente[];
  onAgregarCliente: (cliente: Cliente) => void;
}

export function ClientesView({ clientes, onAgregarCliente }: ClientesViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [rucCedula, setRucCedula] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

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
      <div className="bg-white border border-slate-200 rounded p-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Directorio de Clientes</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aislados por emisor conforme al escenario de calidad E1
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
        >
          + Nuevo Cliente
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="py-2.5 px-4">RUC / Cédula</th>
              <th className="py-2.5 px-4">Razón Social / Nombre</th>
              <th className="py-2.5 px-4">Correo Notificación</th>
              <th className="py-2.5 px-4">Dirección</th>
              <th className="py-2.5 px-4">Teléfono</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {clientes.map((c, idx) => (
              <tr key={`cliente-${c.id}-${c.rucCedula}-${idx}`} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-medium text-slate-900">{c.rucCedula}</td>
                <td className="py-3 px-4 font-medium">{c.razonSocial}</td>
                <td className="py-3 px-4 text-slate-600">{c.correo}</td>
                <td className="py-3 px-4 text-slate-500">{c.direccion || "—"}</td>
                <td className="py-3 px-4 font-mono text-slate-500">{c.telefono || "—"}</td>
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
              <h3 className="text-sm font-bold text-slate-900">Registrar Cliente</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">RUC o Cédula *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 1792952327001 o 1003481920"
                  value={rucCedula}
                  onChange={(e) => setRucCedula(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Razón Social *</label>
                <input
                  type="text"
                  required
                  placeholder="Nombre de la empresa o persona natural"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="cliente@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="0991234567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Dirección</label>
                  <input
                    type="text"
                    placeholder="Ciudad o calle"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5"
                  />
                </div>
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
                Guardar Cliente
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
