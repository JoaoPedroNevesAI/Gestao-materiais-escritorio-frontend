import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoBuild,
  IoBarcodeOutline,
  IoLocationOutline,
  IoSend,
} from "react-icons/io5";
import api from "../services/api";
import Toast from "../components/Toast";

const IFPE = {
  primary: "#15803d",
  primaryDark: "#166534",
  primaryLight: "#f0fdf4",
  primaryBorder: "#bbf7d0",
  primaryText: "#14532d",
};

export default function ManutencaoFormScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const { material, patrimonio } = location.state || {};

  const [descricao, setDescricao] = useState("");
  const [foco, setFoco] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    visivel: false,
    tipo: "info",
    mensagem: "",
  });

  const mostrarToast = (mensagem, tipo = "erro") =>
    setToast({ visivel: true, tipo, mensagem });

  const handleSolicitar = async () => {
    if (!descricao.trim()) {
      mostrarToast("Descreva o motivo ou defeito para a manutenção.", "aviso");
      return;
    }
    if (!patrimonio?.id) {
      mostrarToast("Patrimônio não identificado.", "erro");
      return;
    }

    setLoading(true);
    try {
      await api.post("/manutencao/solicitar", {
        patrimonioId: patrimonio.id,
        descricao: descricao.trim(),
      });
      mostrarToast("Solicitação de manutenção enviada com sucesso!", "sucesso");
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      const status = error.response?.status;
      let msg =
        error.response?.data?.message || "Erro ao solicitar manutenção.";
      if (status === 403) {
        msg =
          "Sem permissão para solicitar manutenção. Verifique as regras de acesso no backend.";
      } else if (status === 401) {
        msg = "Sessão expirada. Faça login novamente.";
      }
      mostrarToast(msg, "erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Toast
        visivel={toast.visivel}
        tipo={toast.tipo}
        mensagem={toast.mensagem}
        onClose={() => setToast((t) => ({ ...t, visivel: false }))}
      />

      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.badgeManutencao}>
            <IoBuild size={13} color="#b45309" />
            <span style={styles.cardTag}>ORDEM DE MANUTENÇÃO</span>
          </div>

          <h2 style={styles.cardTitulo}>
            {patrimonio?.material?.nome || material?.nome || "Equipamento"}
          </h2>

          <div style={styles.patrimonioPill}>
            <IoBarcodeOutline size={12} color={IFPE.primary} />
            <span style={styles.patrimonioPillText}>
              {patrimonio?.codigoPatrimonio || "PAT-" + patrimonio?.id}
            </span>
          </div>

          <div style={styles.linhaInfo}>
            <IoLocationOutline size={14} color="#64748b" />
            <span style={styles.infoText}>
              Local atual:{" "}
              <strong style={styles.bold}>
                {patrimonio?.local?.nome ||
                  material?.local?.nome ||
                  "Não informado"}
              </strong>
            </span>
          </div>
        </div>

        <div style={styles.formCard}>
          <label style={styles.label}>
            MOTIVO / DESCRIÇÃO DO DEFEITO{" "}
            <span style={{ color: "#ef4444" }}>*</span>
          </label>

          <div
            style={{
              ...styles.inputWrapper,
              ...(foco ? styles.inputWrapperFocado : {}),
            }}
          >
            <textarea
              style={styles.inputMultiline}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              onFocus={() => setFoco(true)}
              onBlur={() => setFoco(false)}
              placeholder="Ex: O equipamento parou de ligar após oscilação de energia na tomada..."
              rows={5}
            />
          </div>

          <p style={styles.helperText}>
            A equipe técnica avaliará o chamado e definirá o encaminhamento para
            reparo.
          </p>

          <button
            type="button"
            style={{
              ...styles.btnEnviar,
              ...(loading ? styles.btnDesabilitado : {}),
            }}
            onClick={handleSolicitar}
            disabled={loading}
          >
            {loading ? (
              <div style={styles.spinner} />
            ) : (
              <div style={styles.btnContent}>
                <IoSend size={17} color="#ffffff" />
                <span style={styles.btnEnviarTexto}>ENVIAR SOLICITAÇÃO</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100%",
    backgroundColor: "#f8fafc",
    fontFamily: "sans-serif",
  },
  container: {
    padding: 16,
    paddingBottom: 36,
    maxWidth: 560,
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 10px rgba(15, 23, 42, 0.05)",
    marginBottom: 14,
  },
  badgeManutencao: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fffbeb",
    padding: "4px 8px",
    borderRadius: 8,
    marginBottom: 8,
    border: "1px solid #fde68a",
  },
  cardTag: {
    fontSize: 10.5,
    fontWeight: 800,
    color: "#b45309",
    letterSpacing: 0.5,
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 6px 0",
  },
  patrimonioPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    backgroundColor: IFPE.primaryLight,
    padding: "3px 8px",
    borderRadius: 6,
    marginBottom: 10,
    border: `1px solid ${IFPE.primaryBorder}`,
  },
  patrimonioPillText: {
    fontSize: 11.5,
    fontWeight: 700,
    color: IFPE.primaryText,
  },
  linhaInfo: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    borderTop: "1px solid #f1f5f9",
  },
  infoText: {
    fontSize: 13,
    color: "#64748b",
  },
  bold: {
    fontWeight: 700,
    color: "#0f172a",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 10px rgba(15, 23, 42, 0.05)",
  },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: "#475569",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    backgroundColor: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  inputWrapperFocado: {
    borderColor: IFPE.primary,
    backgroundColor: "#ffffff",
  },
  inputMultiline: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14.5,
    color: "#0f172a",
    minHeight: 110,
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.45,
  },
  helperText: {
    fontSize: 12,
    color: "#94a3b8",
    margin: "0 0 20px 0",
    lineHeight: 1.35,
  },
  btnEnviar: {
    width: "100%",
    backgroundColor: IFPE.primary,
    height: 50,
    borderRadius: 14,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(21, 128, 61, 0.3)",
  },
  btnDesabilitado: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
  btnContent: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  btnEnviarTexto: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 0.4,
  },
  spinner: {
    width: 20,
    height: 20,
    border: "2.5px solid rgba(255,255,255,0.3)",
    borderTop: "2.5px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};