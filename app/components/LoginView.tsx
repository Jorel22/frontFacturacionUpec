"use client";

import React, { useState } from "react";
import Image from "next/image";
import { api } from "../lib/api";

interface LoginViewProps {
  onLoginSuccess: (emisorData?: any) => void;
  apiStatus: "conectado" | "desconectado" | "verificando";
}

export function LoginView({ onLoginSuccess, apiStatus }: LoginViewProps) {
  const [ruc, setRuc] = useState("1792952327001");
  const [usuario, setUsuario] = useState("admin@facturaec.com");
  const [password, setPassword] = useState("admin123");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (apiStatus === "conectado") {
        // Intento de autenticación / registro contra FastAPI
        await api.registrarEmisor(ruc, "SOLUCIONES ANDINAS S.A.S.", password);
      }
      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("facturaec_user_session", JSON.stringify({ ruc, usuario }));
      }
      onLoginSuccess();
    } catch (err: any) {
      // Si la API falla, permitimos fallback o mostramos aviso
      if (err.message && err.message.includes("409")) {
        // RUC ya existente, permitir ingreso
        onLoginSuccess();
      } else {
        setError(err.message || "No se pudo conectar con el backend de autenticación");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "facturaec_user_session",
        JSON.stringify({ ruc: "1792952327001", usuario: "demo@facturaec.com", modo: "demo" })
      );
    }
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#071120] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card Header & Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md mb-4">
            <Image
              src="/VERTICAL.png"
              alt="FacturaEC"
              width={140}
              height={140}
              style={{ width: "auto", height: "auto" }}
              className="h-20 object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Sistema de Facturación Electrónica
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Plataforma SaaS tributaria autorizada para el SRI de Ecuador
          </p>
        </div>

        {/* Login Form Container */}
        <div className="bg-[#0D1A30]/80 border border-slate-800/90 rounded-2xl p-7 shadow-2xl backdrop-blur-md">
          {/* Status Indicator Pill */}
          <div className="mb-5 flex items-center justify-between px-3 py-1.5 bg-[#081224] border border-slate-800 rounded-lg text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Estado del Backend:</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiStatus === "conectado"
                    ? "bg-emerald-400 ring-2 ring-emerald-400/20"
                    : apiStatus === "verificando"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-rose-400"
                }`}
              />
              <span className="font-mono text-[11px] text-slate-300">
                {apiStatus === "conectado"
                  ? "FastAPI (8000) Conectado"
                  : apiStatus === "verificando"
                  ? "Verificando..."
                  : "API Offline (Modo Local)"}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                RUC del Emisor
              </label>
              <input
                type="text"
                required
                maxLength={13}
                value={ruc}
                onChange={(e) => setRuc(e.target.value)}
                className="w-full bg-[#071120] border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="1792952327001"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Usuario / Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full bg-[#071120] border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="admin@empresa.ec"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">Contraseña</label>
                <span className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer">
                  ¿Olvidaste tu clave?
                </span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#071120] border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-[#071120] text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                Recordar mi sesión
              </label>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-xs rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Ingresar a FacturaEC</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleDemoAccess}
                className="w-full py-2 px-4 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-medium text-xs rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Acceso Rápido de Prueba (Modo Demo)</span>
                <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.2 rounded font-mono">
                  1-Click
                </span>
              </button>
            </div>
          </form>

          {/* Compliance & Standards Footer */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-[10px] text-slate-400">
            <div className="p-2 bg-[#071120]/70 rounded border border-slate-800">
              <span className="font-semibold text-slate-300 block">Esquema SRI</span>
              <span>XSD Comprobantes v2.1.0</span>
            </div>
            <div className="p-2 bg-[#071120]/70 rounded border border-slate-800">
              <span className="font-semibold text-slate-300 block">Algoritmo Clave</span>
              <span>Módulo 11 (49 dígitos)</span>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          Maestría UPEC · Automatización de Procesos de Software
        </p>
      </div>
    </div>
  );
}

