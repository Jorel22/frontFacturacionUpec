"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Emisor } from "../types/api";

interface ShellProps {
  emisor: Emisor;
  currentTab: "facturas" | "nueva" | "clientes" | "productos" | "config";
  onTabChange: (tab: "facturas" | "nueva" | "clientes" | "productos" | "config") => void;
  apiStatus: "conectado" | "desconectado" | "verificando";
  onSincronizarApi?: () => void;
  syncLoading?: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  simularCaidaSri?: boolean;
  onToggleSimularCaida?: () => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

export function Shell({
  emisor,
  currentTab,
  onTabChange,
  apiStatus,
  onSincronizarApi,
  syncLoading = false,
  searchTerm,
  onSearchChange,
  simularCaidaSri = false,
  onToggleSimularCaida,
  onLogout,
  children,
}: ShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    {
      id: "facturas",
      label: "Comprobantes",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "nueva",
      label: "Emitir Factura",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      id: "clientes",
      label: "Clientes",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: "productos",
      label: "Catálogo & Tarifas",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar Azul Marino Profundo */}
      <aside className="w-full md:w-64 bg-[#0A1322] text-white flex flex-col flex-shrink-0 border-r border-slate-800 shadow-xl">
        {/* Brand Header con Logotipo Oficial */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/HORIZONTAL BLANCO.png"
              alt="FacturaEC"
              width={180}
              height={45}
              style={{ width: "auto", height: "auto" }}
              className="h-9 max-w-[190px] object-contain mix-blend-screen"
              priority
            />
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
        <div className="p-3 mx-3 my-3 rounded-xl bg-[#101D33] border border-blue-900/30 shadow-inner">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold text-xs flex-shrink-0">
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

          {/* SRI Adaptador Status */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Gateway SRI:</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  simularCaidaSri
                    ? "bg-amber-400 animate-ping"
                    : apiStatus === "conectado"
                    ? "bg-emerald-400 ring-2 ring-emerald-400/20"
                    : "bg-slate-500"
                }`}
              />
              <span className="font-mono text-[10px] text-slate-200 font-medium">
                {simularCaidaSri
                  ? "Simulando Caída (E2)"
                  : apiStatus === "conectado"
                  ? "Supabase / Online"
                  : "Modo Local"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className={`px-3 flex-1 space-y-1 overflow-y-auto ${mobileMenuOpen ? "block" : "hidden md:block"}`}>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1.5">
            Menú Principal
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-md shadow-blue-900/40"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? "text-white" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.id === "nueva" && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded font-mono font-bold">
                    +
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Panel de Control Académico: Escenario E2 (Supabase Edge Function) */}
        {onToggleSimularCaida && (
          <div className="p-3 mx-3 my-2 bg-[#0d172a] rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center justify-between font-medium">
              <span className="text-slate-300">Escenario Calidad E2:</span>
              <button
                onClick={onToggleSimularCaida}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                  simularCaidaSri
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
                title="Simula que el SRI está caído o no responde para verificar contingencia"
              >
                {simularCaidaSri ? "Caída Activa (E2)" : "Simular Caída"}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {simularCaidaSri
                ? "Las facturas pasarán a PENDIENTE según contingencia SRI."
                : "Comportamiento normal con autorización inmediata."}
            </p>
          </div>
        )}

        {/* Footer info tributaria & Logout */}
        <div className="p-3.5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-2 bg-[#070e1c]">
          <div className="flex justify-between items-center">
            <span>Ambiente SRI:</span>
            <span className="font-mono text-emerald-400 text-[10px] font-semibold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
              PRUEBAS (01)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Esquema XSD:</span>
            <span className="font-mono text-slate-300 text-[10px]">Factura v2.1.0</span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-rose-400 hover:text-rose-300 text-xs font-medium cursor-pointer transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
          {/* Búsqueda Global Conectada en Tiempo Real */}
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <div className="relative w-full">
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por secuencial, cliente, RUC o clave de acceso..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-sans"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Header Actions & User Profile */}
          <div className="flex items-center gap-3">
            {/* Botón de Sembrar Datos API */}
            {onSincronizarApi && (
              <button
                disabled={syncLoading}
                onClick={onSincronizarApi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
                title="Registra el emisor y carga los clientes y productos en la base de datos de FastAPI"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{syncLoading ? "Sembrando datos..." : "Sembrar en API"}</span>
              </button>
            )}

            {/* Nueva Factura Rápida */}
            {currentTab !== "nueva" ? (
              <button
                onClick={() => onTabChange("nueva")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
              >
                <span>+ Nueva Factura</span>
              </button>
            ) : (
              <button
                onClick={() => onTabChange("facturas")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                ← Volver a Facturas
              </button>
            )}

            {/* Profile Avatar / Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-600/20">
                  {emisor.razonSocial.charAt(0)}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-semibold text-slate-800 leading-tight">Admin FacturaEC</div>
                  <div className="text-[10px] text-slate-400 font-mono">Emisor Principal</div>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-mono">CONECTADO COMO</span>
                    <span className="font-medium text-slate-800 block truncate">{emisor.correo}</span>
                  </div>
                  <button
                    onClick={() => {
                      onTabChange("config");
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    ⚙️ Configuración SRI
                  </button>
                  {onLogout && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 font-medium border-t border-slate-100"
                    >
                      🚪 Cerrar Sesión
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-6 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
