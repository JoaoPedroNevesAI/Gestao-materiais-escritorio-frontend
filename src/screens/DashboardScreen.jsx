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
  IoCheckmarkDoneOutline,
} from "react-icons/io5";
import api from "../services/api";
import Toast from "../components/Toast";

const IFPE = {
  primary: "#15803d",
  primaryLight: "#f0fdf4",
  primaryBorder: "#bbf7d0",
  primaryText: "#14532d",
};

/** Status que contam como "concluída / aprovada" (ajuste se o back usar outros nomes) */
const STATUS_MOV_CONCLUIDA = new Set([
  "APROVADA",
  "APROVADO",
  "CONCLUIDA",
  "CONCLUIDO",
  "FINALIZADA",
  "FINALIZADO",
]);
const STATUS_MOV_PENDENTE = new Set([
  "PENDENTE",
  "AGUARDANDO",
  "SOLICITADA",
  "SOLICITADO",
]);
const STATUS_MANUT_CONCLUIDA = new Set([
  "CONCLUIDA",
  "CONCLUIDO",
  "APROVADA",
  "APROVADO",
  "FINALIZADA",
]);
const STATUS_MANUT_PENDENTE = new Set(["PENDENTE", "AGUARDANDO"]);

function normalizarStatus(s) {
  return String(s || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

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
    concluidasMov: 0,
    concluidasManut: 0,
  });
  const [ultimasMov, setUltimasMov] = useState([]);
  const [ultimasManut, setUltimasManut] = useState([]);
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
      const [resMat, resPendMov, resMov] = await Promise.all([
        api.get("/material").catch(() => ({ data: [] })),
        api.get("/movimentacao/pendentes").catch(() => ({ data: [] })),
        api.get("/movimentacao").catch(() => ({ data: [] })),
      ]);

      // Manutenções: tenta lista geral e pendentes
      let listaManut = [];
      let pendentesManutApi = null;
      try {
        const resManutAll = await api.get("/manutencao");
        listaManut = Array.isArray(resManutAll.data)
          ? resManutAll.data
          : resManutAll.data?.content || [];
      } catch {
        listaManut = [];
      }
      try {
        const resManutPend = await api.get("/manutencao/pendentes");
        if (Array.isArray(resManutPend.data)) {
          pendentesManutApi = resManutPend.data;
        }
      } catch {
        // ignora
      }

      const materiais = resMat.data || [];
      let totalPatrimonios = 0;
      let disponiveis = 0;
      let emUso = 0;
      let emManutencao = 0;

      materiais.forEach((m) => {
        const pats = m.patrimonios || [];
        totalPatrimonios += pats.length || Number(m.quantidade) || 0;
        pats.forEach((p) => {
          const st = normalizarStatus(p.status);
          if (st === "DISPONIVEL") disponiveis++;
          else if (st === "EM_USO") emUso++;
          else if (st === "EM_MANUTENCAO") emManutencao++;
        });
      });

      // --- Movimentações ---
      const todasMov = Array.isArray(resMov.data)
        ? resMov.data
        : resMov.data?.content || [];

      let pendentesMov = 0;
      const pendRaw = resPendMov.data;
      if (Array.isArray(pendRaw)) {
        pendentesMov = pendRaw.length;
      } else if (pendRaw && typeof pendRaw === "object") {
        pendentesMov = (
          pendRaw.transferencias ||
          pendRaw.movimentacoes ||
          []
        ).length;
      } else {
        pendentesMov = todasMov.filter((m) =>
          STATUS_MOV_PENDENTE.has(normalizarStatus(m.status))
        ).length;
      }

      const concluidasMov = todasMov.filter((m) =>
        STATUS_MOV_CONCLUIDA.has(normalizarStatus(m.status))
      ).length;

      // --- Manutenções ---
      let pendentesManut =
        pendentesManutApi != null
          ? pendentesManutApi.length
          : listaManut.filter((m) =>
              STATUS_MANUT_PENDENTE.has(normalizarStatus(m.status))
            ).length;

      // Se pendentes veio no objeto de movimentacao/pendentes
      if (
        pendRaw &&
        typeof pendRaw === "object" &&
        !Array.isArray(pendRaw) &&
        Array.isArray(pendRaw.manutencoes)
      ) {
        pendentesManut = Math.max(
          pendentesManut,
          pendRaw.manutencoes.length
        );
      }

      const concluidasManut = listaManut.filter((m) =>
        STATUS_MANUT_CONCLUIDA.has(normalizarStatus(m.status))
      ).length;

      const movs = todasMov
        .slice()
        .sort(
          (a, b) =>
            new Date(b.dataMovimentacao || b.createdAt || 0) -
            new Date(a.dataMovimentacao || a.createdAt || 0)
        )
        .slice(0, 5);

      const manuts = listaManut
        .slice()
        .sort(
          (a, b) =>
            new Date(b.dataSolicitacao || b.createdAt || 0) -
            new Date(a.dataSolicitacao || a.createdAt || 0)
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
        concluidasMov,
        concluidasManut,
      });
      setUltimasMov(movs);
      setUltimasManut(manuts);
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

  const badgeStatus = (status) => {
    const st = normalizarStatus(status);
    if (STATUS_MOV_CONCLUIDA.has(st) || STATUS_MANUT_CONCLUIDA.has(st)) {
      return { label: status || "Concluída", bg: "#ecfdf5", cor: "#059669" };
    }
    if (STATUS_MOV_PENDENTE.has(st) || STATUS_MANUT_PENDENTE.has(st)) {
      return { label: status || "Pendente", bg: "#fffbeb", cor: "#d97706" };
    }
    if (st === "REPROVADA" || st === "REPROVADO") {
      return { label: status || "Reprovada", bg: "#fef2f2", cor: "#dc2626" };
    }
    return {
      label: status || "—",
      bg: "#f1f5f9",
      cor: "#64748b",
    };
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
      color: IFPE.primary,
      bg: IFPE.primaryLight,
      onClick: () => navigate("/movimentacoes"),
    },
    {
      label: "Em manutenção",
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
            <p style={styles.subtitulo}>
              Inventário, pendências e histórico concluído
            </p>
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

            {/* Concluídas */}
            <div style={styles.secao}>
              <h3 style={styles.secaoTitulo}>Concluídas</h3>
              <div style={styles.gridConcluidas}>
                <div style={styles.cardConcluida}>
                  <div style={styles.concluidaIcon}>
                    <IoCheckmarkDoneOutline size={20} color={IFPE.primary} />
                  </div>
                  <div>
                    <div style={styles.concluidaValor}>
                      {stats.concluidasMov}
                    </div>
                    <div style={styles.concluidaLabel}>
                      Transferências concluídas
                    </div>
                  </div>
                </div>
                <div style={styles.cardConcluida}>
                  <div
                    style={{
                      ...styles.concluidaIcon,
                      backgroundColor: "#ecfdf5",
                    }}
                  >
                    <IoConstructOutline size={20} color="#059669" />
                  </div>
                  <div>
                    <div style={styles.concluidaValor}>
                      {stats.concluidasManut}
                    </div>
                    <div style={styles.concluidaLabel}>
                      Manutenções concluídas
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pendências */}
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
                <h3 style={{ ...styles.secaoTitulo, marginBottom: 0 }}>
                  Últimas movimentações
                </h3>
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
                ultimasMov.map((item) => {
                  const b = badgeStatus(item.status);
                  return (
                    <div key={item.id} style={styles.movCard}>
                      <div style={styles.movTop}>
                        <span style={styles.movCodigo}>
                          {item.patrimonio?.codigoPatrimonio ||
                            item.material?.nome ||
                            "Movimentação"}
                        </span>
                        <span
                          style={{
                            ...styles.statusPill,
                            backgroundColor: b.bg,
                            color: b.cor,
                          }}
                        >
                          {b.label}
                        </span>
                      </div>
                      <div style={styles.movRota}>
                        {item.localOrigem?.nome || "—"} →{" "}
                        {item.localDestino?.nome || "—"}
                      </div>
                      <div style={styles.movMeta}>
                        <span>
                          {formatarData(
                            item.dataMovimentacao || item.createdAt
                          )}
                        </span>
                        {item.usuario?.nome && (
                          <span>Por: {item.usuario.nome}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Últimas manutenções */}
            <div style={styles.secao}>
              <h3 style={styles.secaoTitulo}>Últimas manutenções</h3>
              {ultimasManut.length === 0 ? (
                <p style={styles.vazio}>Nenhuma manutenção recente.</p>
              ) : (
                ultimasManut.map((item) => {
                  const b = badgeStatus(item.status);
                  return (
                    <div key={item.id} style={styles.movCard}>
                      <div style={styles.movTop}>
                        <span style={styles.movCodigo}>
                          {item.patrimonio?.codigoPatrimonio ||
                            "Manutenção #" + item.id}
                        </span>
                        <span
                          style={{
                            ...styles.statusPill,
                            backgroundColor: b.bg,
                            color: b.cor,
                          }}
                        >
                          {b.label}
                        </span>
                      </div>
                      {item.descricao && (
                        <div style={styles.movRota}>
                          {item.descricao.length > 80
                            ? item.descricao.slice(0, 80) + "…"
                            : item.descricao}
                        </div>
                      )}
                      <div style={styles.movMeta}>
                        <span>
                          {formatarData(
                            item.dataSolicitacao || item.createdAt
                          )}
                        </span>
                        {item.solicitante?.nome && (
                          <span>Por: {item.solicitante.nome}</span>
                        )}
                      </div>
                    </div>
                  );
                })
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
  },
  gridConcluidas: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
  },
  cardConcluida: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 14,
  },
  concluidaIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: IFPE.primaryLight,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  concluidaValor: {
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1,
  },
  concluidaLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: 600,
    marginTop: 2,
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
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  movCodigo: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0f172a",
  },
  statusPill: {
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 8,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  movRota: {
    fontSize: 12,
    color: "#475569",
  },
  movMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 6,
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