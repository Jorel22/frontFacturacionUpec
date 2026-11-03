"use client";

import React, { useState } from "react";
import { Emisor } from "../types/api";

interface ShellProps {
  emisor: Emisor;
  currentTab: "facturas" | "nueva" | "clientes" | "productos" | "config";
  onTabChange: (tab: "facturas" | "nueva" | "clientes" | "productos" | "config") => void;
  apiStatus: "conectado" | "desconectado" | "verificando";
  onSincronizarApi?: () => void;
  syncLoading?: boolean;
  children: React.ReactNode;
}

export function Shell({
  emisor,
  currentTab,
  onTabChange,
  apiStatus,
  onSincronizarApi,
  syncLoading = false,
  children,
}: ShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navItems = [
    {
      id: "facturas",
      label: "Comprobantes",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      count: 3,
    },
    {
      id: "clientes",
      label: "Clientes",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      count: 3,
    },
    {
      id: "productos",
      label: "Catálogo & Tarifas",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      count: 4,
    },
    {
      id: "config",
      label: "Configuración SRI",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col md:flex-row font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar Azul Marino Profundo (Navy) */}
      <aside className="w-full md:w-64 bg-[#0B1528] text-white flex flex-col flex-shrink-0 border-r border-slate-800/80">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-md shadow-blue-900/40">
              EC
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-white leading-none">
                  FacturaEC
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800/40 font-medium">
                  v0.3
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono tracking-tight block mt-0.5">
                SaaS Tributario
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>

        {/* Emisor Card con Avatar */}
        <div className="p-3 mx-3 my-3 rounded-lg bg-[#111F38] border border-blue-900/30">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-xs">
              {emisor.razonSocial.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-100 truncate leading-snug">
                {emisor.razonSocial}
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-tight">
                RUC: {emisor.ruc}
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Servicio SRI:</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  apiStatus === "conectado"
                    ? "bg-emerald-400 ring-2 ring-emerald-400/20"
                    : apiStatus === "verificando"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-slate-500"
                }`}
              />
              <span className="font-mono text-[10px] text-slate-200 font-medium">
                {apiStatus === "conectado" ? "En Línea" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation - Solo Comprobantes, Clientes, Catálogo y Configuración */}
        <nav className={`px-2 flex-1 space-y-1 ${mobileMenuOpen ? "block" : "hidden md:block"}`}>
          {navItems.map((item) => {
            const isActive = currentTab === item.id || (item.id === "facturas" && currentTab === "nueva");
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? "text-white" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {"count" in item && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? "bg-blue-700 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info tributaria */}
        <div className="p-3.5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1 bg-[#091122]">
          <div className="flex justify-between items-center">
            <span>Ambiente SRI:</span>
            <span className="font-mono text-slate-200 text-[10px] font-semibold">PRUEBAS (01)</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Esquema XSD:</span>
            <span className="font-mono text-slate-300 text-[10px]">Factura v2.1.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por secuencial, RUC, cliente o clave de acceso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-sans"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Botón opcional para inicializar/sembrar la base de datos de FastAPI */}
            {onSincronizarApi && (
              <button
                disabled={syncLoading}
                onClick={onSincronizarApi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
                title="Registra el emisor y carga los clientes y productos en la base de datos de FastAPI"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{syncLoading ? "Sembrando datos..." : "Sembrar Datos en API"}</span>
              </button>
            )}

            {currentTab === "nueva" && (
              <button
                onClick={() => onTabChange("facturas")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                ← Volver a Comprobantes
              </button>
            )}
          </div>
        </header>

        {/* Content Container */}
        <div className="p-6 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
