import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoCubeOutline,
  IoCheckmarkCircleOutline,
  IoSwapHorizontalOutline,
  IoConstructOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoRefreshOutline,
  IoChevronForward,
} from "react-icons/io5";
import api from "../services/api";
import Toast from "../components/Toast";

const IFPE = {
  primary: "#15803d",
  primaryLight: "#f0fdf4",
  primaryBorder: "#bbf7d0",
  primaryText: "#14532d",
};

export default function DashboardScreen() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMateriais: 0,
    totalPatrimonios: 0,
    disponiveis: 0,
    emUso: 0,
    emManutencao: 0,
    pendentesMov: 0,
    pendentesManut: 0,
  });
  const [ultimasMov, setUltimasMov] = useState([]);
  const [toast, setToast] = useState({
    visivel: false,
    tipo: "info",
    mensagem: "",
  });

  const mostrarToast = (mensagem, tipo = "erro") =>
    setToast({ visivel: true, tipo, mensagem });

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [resMat, resPend, resMov] = await Promise.all([
        api.get("/material").catch(() => ({ data: [] })),
        api.get("/movimentacao/pendentes").catch(() => ({ data: [] })),
        api.get("/movimentacao").catch(() => ({ data: [] })),
      ]);

      const materiais = resMat.data || [];
      let totalPatrimonios = 0;
      let disponiveis = 0;
      let emUso = 0;
      let emManutencao = 0;

      materiais.forEach((m) => {
        const pats = m.patrimonios || [];
        totalPatrimonios += pats.length || Number(m.quantidade) || 0;
        pats.forEach((p) => {
          if (p.status === "DISPONIVEL") disponiveis++;
          else if (p.status === "EM_USO") emUso++;
          else if (p.status === "EM_MANUTENCAO") emManutencao++;
        });
      });

      // Pendentes: array ou { transferencias, manutencoes }
      const pendRaw = resPend.data;
      let pendentesMov = 0;
      let pendentesManut = 0;
      if (Array.isArray(pendRaw)) {
        pendentesMov = pendRaw.length;
      } else if (pendRaw && typeof pendRaw === "object") {
        pendentesMov = (pendRaw.transferencias || pendRaw.movimentacoes || []).length;
        pendentesManut = (pendRaw.manutencoes || []).length;
      }

      // Tenta endpoint de manutenções pendentes (se existir)
      try {
        const resManut = await api.get("/manutencao/pendentes");
        if (Array.isArray(resManut.data)) {
          pendentesManut = resManut.data.length;
        }
      } catch {
        // ignora se não existir
      }

      const movs = (resMov.data || [])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.dataMovimentacao || b.createdAt || 0) -
            new Date(a.dataMovimentacao || a.createdAt || 0)
        )
        .slice(0, 5);

      setStats({
        totalMateriais: materiais.length,
        totalPatrimonios,
        disponiveis,
        emUso,
        emManutencao,
        pendentesMov,
        pendentesManut,
      });
      setUltimasMov(movs);
    } catch {
      mostrarToast("Não foi possível carregar o dashboard.", "erro");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const formatarData = (dataString) => {
    if (!dataString) return "—";
    return new Date(dataString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cards = [
    {
      label: "Materiais",
      value: stats.totalMateriais,
      icon: IoCubeOutline,
      color: IFPE.primary,
      bg: IFPE.primaryLight,
      onClick: () => navigate("/materiais"),
    },
    {
      label: "Disponíveis",
      value: stats.disponiveis,
      icon: IoCheckmarkCircleOutline,
      color: "#059669",
      bg: "#ecfdf5",
      onClick: () => navigate("/materiais"),
    },
    {
      label: "Em uso",
      value: stats.emUso,
      icon: IoSwapHorizontalOutline,
      color: "#2563eb",
      bg: "#eff6ff",
      onClick: () => navigate("/movimentacoes"),
    },
    {
      label: "Manutenção",
      value: stats.emManutencao,
      icon: IoConstructOutline,
      color: "#d97706",
      bg: "#fffbeb",
      onClick: () => navigate("/solicitacoes"),
    },
  ];

  return (
    <div style={styles.page}>
      <Toast
        visivel={toast.visivel}
        tipo={toast.tipo}
        mensagem={toast.mensagem}
        onClose={() => setToast((t) => ({ ...t, visivel: false }))}
      />

      <div style={styles.container}>
        <div style={styles.topo}>
          <div>
            <h2 style={styles.titulo}>Painel gerencial</h2>
            <p style={styles.subtitulo}>Resumo do inventário e solicitações</p>
          </div>
          <button
            type="button"
            style={styles.btnRefresh}
            onClick={carregar}
            disabled={loading}
            title="Atualizar"
          >
            <IoRefreshOutline size={20} color={IFPE.primary} />
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <span style={styles.loadingText}>Carregando indicadores...</span>
          </div>
        ) : (
          <>
            {/* Cards principais */}
            <div style={styles.grid}>
              {cards.map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.label}
                    type="button"
                    style={{ ...styles.card, backgroundColor: c.bg }}
                    onClick={c.onClick}
                  >
                    <Icon size={22} color={c.color} />
                    <span style={{ ...styles.cardValue, color: c.color }}>
                      {c.value}
                    </span>
                    <span style={styles.cardLabel}>{c.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Alertas pendentes */}
            <div style={styles.secao}>
              <h3 style={styles.secaoTitulo}>Pendências</h3>
              <button
                type="button"
                style={styles.alertaCard}
                onClick={() => navigate("/solicitacoes")}
              >
                <div style={styles.alertaLeft}>
                  <div style={styles.alertaIcon}>
                    <IoTimeOutline size={20} color="#d97706" />
                  </div>
                  <div>
                    <div style={styles.alertaTitulo}>
                      Transferências aguardando
                    </div>
                    <div style={styles.alertaSub}>
                      {stats.pendentesMov} solicitação(ões)
                    </div>
                  </div>
                </div>
                <IoChevronForward size={18} color="#94a3b8" />
              </button>

              <button
                type="button"
                style={{ ...styles.alertaCard, marginTop: 8 }}
                onClick={() => navigate("/solicitacoes")}
              >
                <div style={styles.alertaLeft}>
                  <div
                    style={{
                      ...styles.alertaIcon,
                      backgroundColor: "#fff7ed",
                    }}
                  >
                    <IoAlertCircleOutline size={20} color="#ea580c" />
                  </div>
                  <div>
                    <div style={styles.alertaTitulo}>
                      Manutenções aguardando
                    </div>
                    <div style={styles.alertaSub}>
                      {stats.pendentesManut} solicitação(ões)
                    </div>
                  </div>
                </div>
                <IoChevronForward size={18} color="#94a3b8" />
              </button>
            </div>

            {/* Últimas movimentações */}
            <div style={styles.secao}>
              <div style={styles.secaoHeader}>
                <h3 style={styles.secaoTitulo}>Últimas movimentações</h3>
                <button
                  type="button"
                  style={styles.linkVer}
                  onClick={() => navigate("/movimentacoes")}
                >
                  Ver todas
                </button>
              </div>

              {ultimasMov.length === 0 ? (
                <p style={styles.vazio}>Nenhuma movimentação recente.</p>
              ) : (
                ultimasMov.map((item) => (
                  <div key={item.id} style={styles.movCard}>
                    <div style={styles.movTop}>
                      <span style={styles.movCodigo}>
                        {item.patrimonio?.codigoPatrimonio ||
                          item.material?.nome ||
                          "Movimentação"}
                      </span>
                      <span style={styles.movData}>
                        {formatarData(
                          item.dataMovimentacao || item.createdAt
                        )}
                      </span>
                    </div>
                    <div style={styles.movRota}>
                      {item.localOrigem?.nome || "—"} →{" "}
                      {item.localDestino?.nome || "—"}
                    </div>
                    {item.usuario?.nome && (
                      <div style={styles.movAutor}>
                        Por: {item.usuario.nome}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <p style={styles.footerHint}>
              Patrimônios contabilizados: {stats.totalPatrimonios}
            </p>
          </>
        )}
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
    paddingBottom: 24,
    maxWidth: 720,
    margin: "0 auto",
  },
  topo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titulo: {
    margin: 0,
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
  },
  subtitulo: {
    margin: "4px 0 0 0",
    fontSize: 13,
    color: "#64748b",
  },
  btnRefresh: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: `1px solid ${IFPE.primaryBorder}`,
    backgroundColor: IFPE.primaryLight,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: 48,
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid #e2e8f0",
    borderTop: `3px solid ${IFPE.primary}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { fontSize: 13, color: "#64748b" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
    marginBottom: 20,
  },
  card: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: "16px 14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
    cursor: "pointer",
    textAlign: "left",
  },
  cardValue: {
    fontSize: 26,
    fontWeight: 800,
    lineHeight: 1,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
  },
  secao: { marginBottom: 20 },
  secaoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  secaoTitulo: {
    margin: "0 0 10px 0",
    fontSize: 13,
    fontWeight: 800,
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  linkVer: {
    background: "none",
    border: "none",
    color: IFPE.primary,
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    marginBottom: 10,
  },
  alertaCard: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    cursor: "pointer",
    textAlign: "left",
  },
  alertaLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  alertaIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fffbeb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  alertaTitulo: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
  },
  alertaSub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  movCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  movTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  movCodigo: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0f172a",
  },
  movData: {
    fontSize: 11,
    color: "#94a3b8",
  },
  movRota: {
    fontSize: 12,
    color: "#475569",
  },
  movAutor: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4,
  },
  vazio: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    padding: 16,
  },
  footerHint: {
    textAlign: "center",
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 8,
  },
};