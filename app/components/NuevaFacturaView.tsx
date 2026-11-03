"use client";

import React, { useState } from "react";
import { Cliente, DetalleFactura, Factura, Producto, TarifaIva } from "../types/api";

interface NuevaFacturaViewProps {
  clientes: Cliente[];
  productos: Producto[];
  onGuardarFactura: (factura: Factura, enviarAlSri: boolean) => void;
  onCancelar: () => void;
}

interface ItemDraft {
  productoId: number;
  cantidad: number;
}

export function NuevaFacturaView({
  clientes,
  productos,
  onGuardarFactura,
  onCancelar,
}: NuevaFacturaViewProps) {
  const [selectedClienteId, setSelectedClienteId] = useState<number>(clientes[0]?.id || 1);
  const [items, setItems] = useState<ItemDraft[]>([
    { productoId: productos[0]?.id || 1, cantidad: 1 },
  ]);
  const [loading, setLoading] = useState(false);

  const clienteSeleccionado = clientes.find((c) => c.id === selectedClienteId) || clientes[0];

  const handleAddItem = () => {
    setItems((prev) => [...prev, { productoId: productos[0]?.id || 1, cantidad: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof ItemDraft, value: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Cálculos tributarios en tiempo real según la normativa del SRI
  const detallesCalculados: DetalleFactura[] = items.map((item) => {
    const prod = productos.find((p) => p.id === item.productoId) || productos[0];
    const subtotal = Number((prod.precioUnitario * item.cantidad).toFixed(2));
    const valorIva = Number(((subtotal * prod.tarifaIva) / 100).toFixed(2));
    const total = Number((subtotal + valorIva).toFixed(2));

    return {
      productoId: prod.id,
      codigo: prod.codigo,
      nombre: prod.nombre,
      cantidad: item.cantidad,
      precioUnitario: prod.precioUnitario,
      tarifaIva: prod.tarifaIva,
      subtotal,
      valorIva,
      total,
    };
  });

  const subtotal15 = detallesCalculados
    .filter((d) => d.tarifaIva === 15)
    .reduce((sum, d) => sum + d.subtotal, 0);

  const subtotal5 = detallesCalculados
    .filter((d) => d.tarifaIva === 5)
    .reduce((sum, d) => sum + d.subtotal, 0);

  const subtotal0 = detallesCalculados
    .filter((d) => d.tarifaIva === 0)
    .reduce((sum, d) => sum + d.subtotal, 0);

  const totalIva15 = Number(((subtotal15 * 15) / 100).toFixed(2));
  const totalIva5 = Number(((subtotal5 * 5) / 100).toFixed(2));
  const totalIva = Number((totalIva15 + totalIva5).toFixed(2));
  const subtotalSinImpuestos = Number((subtotal15 + subtotal5 + subtotal0).toFixed(2));
  const totalFactura = Number((subtotalSinImpuestos + totalIva).toFixed(2));

  const handleEmitir = (enviarAlSri: boolean) => {
    setLoading(true);
    // Simular o generar clave de acceso de 49 dígitos
    const timestamp = new Date().toISOString();
    const nuevaFactura: Factura = {
      id: Date.now(),
      secuencial: "001-001-000000045",
      claveAcceso: `021120260117929523270012001001000000045123456781${Math.floor(Math.random() * 9)}`,
      fechaEmision: timestamp,
      estado: enviarAlSri ? "AUTORIZADA" : "CREADA",
      cliente: clienteSeleccionado,
      detalles: detallesCalculados,
      subtotalSinImpuestos,
      totalIva,
      total: totalFactura,
      intentosEnvio: enviarAlSri ? 1 : 0,
    };

    setTimeout(() => {
      onGuardarFactura(nuevaFactura, enviarAlSri);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header del formulario */}
      <div className="bg-white border border-slate-200 rounded p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Nuevo Comprobante Tributario
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">
            Factura Electrónica No. 001-001-000000045
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Punto de emisión 001 · Establecimiento matriz 001
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-mono">FECHA EMISIÓN</span>
            <span className="text-xs font-mono font-medium text-slate-700">
              {new Date().toLocaleDateString("es-EC", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Sección 1: Datos del Adquirente / Cliente */}
      <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            1. Datos del Cliente / Adquirente
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">
              Seleccionar Cliente
            </label>
            <select
              value={selectedClienteId}
              onChange={(e) => setSelectedClienteId(Number(e.target.value))}
              className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-white text-slate-900 focus:outline-none focus:border-slate-400"
            >
              {clientes.map((c, idx) => (
                <option key={`opt-cliente-${c.id}-${idx}`} value={c.id}>
                  {c.razonSocial} ({c.rucCedula})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">
              RUC / Cédula
            </label>
            <input
              type="text"
              readOnly
              value={clienteSeleccionado.rucCedula}
              className="w-full text-xs font-mono border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 text-slate-700"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">
              Correo Electrónico (Notificación RIDE)
            </label>
            <input
              type="text"
              readOnly
              value={clienteSeleccionado.correo}
              className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Sección 2: Tabla de Ítems / Productos */}
      <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            2. Detalle de Productos y Servicios
          </h3>
          <button
            onClick={handleAddItem}
            className="text-xs font-medium text-blue-700 hover:text-blue-900 transition-colors"
          >
            + Agregar Línea
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2 px-3">Producto / Servicio</th>
                <th className="py-2 px-3 text-right w-24">Cantidad</th>
                <th className="py-2 px-3 text-right w-28">P. Unitario</th>
                <th className="py-2 px-3 text-center w-24">Tarifa IVA</th>
                <th className="py-2 px-3 text-right w-28">Subtotal</th>
                <th className="py-2 px-3 text-center w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, index) => {
                const prod = productos.find((p) => p.id === item.productoId) || productos[0];
                const subtotalLinea = Number((prod.precioUnitario * item.cantidad).toFixed(2));

                return (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3">
                      <select
                        value={item.productoId}
                        onChange={(e) =>
                          handleUpdateItem(index, "productoId", Number(e.target.value))
                        }
                        className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-900"
                      >
                        {productos.map((p, idx) => (
                          <option key={`opt-prod-${p.id}-${idx}`} value={p.id}>
                            {p.codigo} — {p.nombre} (${p.precioUnitario.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) =>
                          handleUpdateItem(index, "cantidad", Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-20 text-xs font-mono border border-slate-200 rounded px-2 py-1 text-right"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      ${prod.precioUnitario.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-slate-700 bg-slate-100 border border-slate-200">
                        {prod.tarifaIva}% IVA
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                      ${subtotalLinea.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {items.length > 1 && (
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-slate-400 hover:text-rose-600 font-bold text-sm"
                          title="Eliminar fila"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección 3: Liquidación de Impuestos y Acciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="bg-white border border-slate-200 rounded p-4 text-xs space-y-2 text-slate-600">
          <div className="font-semibold text-slate-900">Observaciones y Régimen</div>
          <p className="text-[11px] leading-relaxed">
            Comprobante emitido según la ficha técnica de comprobantes electrónicos offline del SRI.
            Tarifas aplicables: IVA 15% (general), IVA 5% (materiales de construcción) e IVA 0% (servicios exentos).
          </p>
          <div className="pt-2 text-[11px] text-slate-500 font-mono">
            Ambiente: Pruebas / Desarrollo · Tipo de emisión: Normal
          </div>
        </div>

        {/* Cuadro de Totales */}
        <div className="bg-white border border-slate-200 rounded p-5 space-y-2 text-xs font-mono">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal 15%:</span>
            <span>${subtotal15.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Subtotal 5%:</span>
            <span>${subtotal5.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Subtotal 0%:</span>
            <span>${subtotal0.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1.5">
            <span>Subtotal Sin Impuestos:</span>
            <span>${subtotalSinImpuestos.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>IVA 15%:</span>
            <span>${totalIva15.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>IVA 5%:</span>
            <span>${totalIva5.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-900 font-bold border-t-2 border-slate-900 pt-2 text-sm">
            <span>TOTAL FACTURA:</span>
            <span>${totalFactura.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Botones de acción inferiores */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          disabled={loading}
          onClick={onCancelar}
          className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors"
        >
          Cancelar
        </button>
        <button
          disabled={loading}
          onClick={() => handleEmitir(false)}
          className="px-4 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
        >
          Guardar como Borrador
        </button>
        <button
          disabled={loading}
          onClick={() => handleEmitir(true)}
          className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-sm flex items-center gap-2"
        >
          {loading ? "Procesando con SRI..." : "Emitir y Enviar al SRI"}
        </button>
      </div>
    </div>
  );
}
