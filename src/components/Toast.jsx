import React, { useEffect, useState } from "react";
import {
  IoCheckmarkCircle,
  IoAlertCircle,
  IoWarning,
  IoInformationCircle,
  IoClose,
} from "react-icons/io5";

const TIPOS = {
  sucesso: {
    cor: "#065f46",
    iconeCor: "#10b981",
    fundo: "#ecfdf5",
    borda: "#a7f3d0",
    Icon: IoCheckmarkCircle,
  },
  erro: {
    cor: "#991b1b",
    iconeCor: "#ef4444",
    fundo: "#fef2f2",
    borda: "#fecaca",
    Icon: IoAlertCircle,
  },
  aviso: {
    cor: "#92400e",
    iconeCor: "#f59e0b",
    fundo: "#fffbeb",
    borda: "#fde68a",
    Icon: IoWarning,
  },
  info: {
    cor: "#1e40af",
    iconeCor: "#3b82f6",
    fundo: "#eff6ff",
    borda: "#bfdbfe",
    Icon: IoInformationCircle,
  },
};

export default function Toast({
  visivel,
  tipo = "info",
  mensagem,
  onClose,        // aceita onClose (web) ou onFechar (compatibilidade)
  onFechar,
  duracao = 3500,
}) {
  const [animandoSaida, setAnimandoSaida] = useState(false);
  const fecharCallback = onClose || onFechar;

  useEffect(() => {
    if (!visivel) return;

    setAnimandoSaida(false);
    const timer = setTimeout(() => {
      setAnimandoSaida(true);
      // espera a animação de saída terminar
      setTimeout(() => {
        fecharCallback && fecharCallback();
      }, 220);
    }, duracao);

    return () => clearTimeout(timer);
  }, [visivel, duracao]);

  const fecharManual = () => {
    setAnimandoSaida(true);
    setTimeout(() => {
      fecharCallback && fecharCallback();
    }, 220);
  };

  if (!visivel && !animandoSaida) return null;

  const estilo = TIPOS[tipo] || TIPOS.info;
  const Icon = estilo.Icon;

  return (
    <div
      style={{
        ...styles.container,
        animation: animandoSaida
          ? "toastOut 0.22s ease forwards"
          : "toastIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      }}
    >
      <div
        style={{
          ...styles.toast,
          backgroundColor: estilo.fundo,
          borderColor: estilo.borda,
        }}
      >
        <div
          style={{
            ...styles.iconeContainer,
            backgroundColor: estilo.iconeCor + "20",
          }}
        >
          <Icon size={18} color={estilo.iconeCor} />
        </div>

        <span style={{ ...styles.mensagem, color: estilo.cor }}>
          {mensagem}
        </span>

        <button
          type="button"
          onClick={fecharManual}
          style={styles.closeBtn}
          aria-label="Fechar"
        >
          <IoClose size={16} color={estilo.cor} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    top: 24,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    width: "calc(100% - 32px)",
    maxWidth: 500,
    pointerEvents: "none",
  },
  toast: {
    display: "flex",
    alignItems: "center",
    borderRadius: 14,
    border: "1px solid",
    padding: "12px 14px",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.12)",
    pointerEvents: "auto",
  },
  iconeContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    flexShrink: 0,
  },
  mensagem: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: 600,
    lineHeight: 1.35,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 4,
    marginLeft: 6,
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
};