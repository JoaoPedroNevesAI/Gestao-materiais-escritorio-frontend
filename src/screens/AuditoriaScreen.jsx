import React, { useState, useEffect, useCallback } from "react";
import {
  IoSearchOutline,
  IoCloseCircle,
  IoRefreshOutline,
  IoFilterOutline,
  IoPersonOutline,
  IoTimeOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoSwapHorizontalOutline,
  IoConstructOutline,
  IoLogInOutline,
  IoCubeOutline,
  IoAlertCircleOutline,
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

// Normaliza vários formatos possíveis do back
function normalizarLog(item) {
  if (!item || typeof item !== "object") return null;

  const acao =
    item.acao ||
    item.action ||
    item.tipo ||
    item.evento ||
    item.operacao ||
    "AÇÃO";

  const descricao =
    item.descricao ||
    item.mensagem ||
    item.detalhe ||
    item.details ||
    item.message ||
    "";

  const usuarioNome =
    item.usuario?.nome ||
    item.user?.nome ||
    item.usuarioNome ||
    item.userName ||
    item.email ||
    item.usuario?.email ||
    "Sistema";

  const data =
    item.dataHora ||
    item.data ||
    item.createdAt ||
    item.timestamp ||
    item.dataCriacao ||
    null;

  const entidade =
    item.entidade ||
    item.recurso ||
    item.entity ||
    item.tabela ||
    item.modulo ||
    null;

  const id = item.id || item.logId || `${acao}-${data}-${usuarioNome}`;

  return {
    id,
    acao: String(acao).toUpperCase(),
    descricao: String(descricao),
    usuarioNome,
    data,
    entidade,
    raw: item,
  };
}

function iconePorAcao(acao) {
  const a = (acao || "").toUpperCase();
  if (a.includes("LOGIN") || a.includes("AUTH")) return IoLogInOutline;
  if (a.includes("DELETE") || a.includes("EXCLU") || a.includes("REMOV"))
    return IoTrashOutline;
  if (a.includes("UPDATE") || a.includes("EDIT") || a.includes("ALTER"))
    return IoCreateOutline;
  if (a.includes("CREATE") || a.includes("CADAST") || a.includes("INSERT"))
    return IoCubeOutline;
  if (a.includes("MOV") || a.includes("TRANSF")) return IoSwapHorizontalOutline;
  if (a.includes("MANUT")) return IoConstructOutline;
  if (a.includes("APROV") || a.includes("REPROV")) return IoShieldCheckmarkOutline;
  return IoDocumentTextOutline;
}

function corPorAcao(acao) {
  const a = (acao || "").toUpperCase();
  if (a.includes("DELETE") || a.includes("EXCLU") || a.includes("REPROV"))
    return { bg: "#fef2f2", cor: "#dc2626", borda: "#fecaca" };
  if (a.includes("CREATE") || a.includes("CADAST") || a.includes("APROV"))
    return { bg: "#ecfdf5", cor: "#059669", borda: "#a7f3d0" };
  if (a.includes("UPDATE") || a.includes("EDIT") || a.includes("ALTER"))
    return { bg: "#eff6ff", cor: "#2563eb", borda: "#bfdbfe" };
  if (a.includes("MANUT"))
    return { bg: "#fffbeb", cor: "#d97706", borda: "#fde68a" };
  if (a.includes("LOGIN") || a.includes("AUTH"))
    return { bg: IFPE.primaryLight, cor: IFPE.primary, borda: IFPE.primaryBorder };
  return { bg: "#f8fafc", cor: "#475569", borda: "#e2e8f0" };
}

export default function AuditoriaScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroAcao, setFiltroAcao] = useState("TODAS");
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
      // Tenta endpoints comuns — o primeiro que responder ok ganha
      const candidatos = [
        "/auditoria",
        "/auditoria/logs",
        "/logs",
        "/log",
        "/audit",
        "/auditorias",
      ];

      let data = null;
      let ultimoErro = null;

      for (const path of candidatos) {
        try {
          const res = await api.get(path);
          data = res.data;
          break;
        } catch (err) {
          ultimoErro = err;
          // 404 → tenta o próximo
          if (err.response?.status && err.response.status !== 404) {
            // erro real (401, 500...) — para
            throw err;
          }
        }
      }

      if (data == null) {
        setLogs([]);
        if (ultimoErro?.response?.status === 404) {
          mostrarToast(
            "Endpoint de auditoria ainda não disponível no backend.",
            "aviso"
          );
        }
        return;
      }

      const lista = Array.isArray(data)
        ? data
        : data.content || data.logs || data.items || data.data || [];

      const normalizados = lista
        .map(normalizarLog)
        .filter(Boolean)
        .sort(
          (a, b) =>
            new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime()
        );

      setLogs(normalizados);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        mostrarToast("Sem permissão para ver a auditoria.", "erro");
      } else {
        mostrarToast(
          error.response?.data?.message ||
            "Não foi possível carregar os logs de auditoria.",
          "erro"
        );
      }
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const formatarData = (dataString) => {
    if (!dataString) return "—";
    try {
      return new Date(dataString).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dataString);
    }
  };

  // Tipos únicos para o filtro
  const tiposAcao = [
    "TODAS",
    ...Array.from(new Set(logs.map((l) => l.acao))).sort(),
  ];

  const logsFiltrados = logs.filter((log) => {
    if (filtroAcao !== "TODAS" && log.acao !== filtroAcao) return false;
    if (!busca.trim()) return true;
    const q = busca.trim().toLowerCase();
    return (
      log.acao.toLowerCase().includes(q) ||
      log.descricao.toLowerCase().includes(q) ||
      log.usuarioNome.toLowerCase().includes(q) ||
      (log.entidade || "").toLowerCase().includes(q)
    );
  });

  return (
    <div style={styles.page}>
      <Toast
        visivel={toast.visivel}
        tipo={toast.tipo}
        mensagem={toast.mensagem}
        onClose={() => setToast((t) => ({ ...t, visivel: false }))}
      />

      <div style={styles.container}>
        {/* Topo */}
        <div style={styles.topo}>
          <div>
            <h2 style={styles.titulo}>Auditoria do sistema</h2>
            <p style={styles.subtitulo}>
              Registro de ações realizadas pelos usuários
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

        {/* Busca */}
        <div style={styles.buscaWrapper}>
          <IoSearchOutline size={18} color="#64748b" />
          <input
            style={styles.buscaInput}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por ação, usuário, descrição..."
          />
          {busca.length > 0 && (
            <button
              type="button"
              style={styles.clearBtn}
              onClick={() => setBusca("")}
            >
              <IoCloseCircle size={18} color="#94a3b8" />
            </button>
          )}
        </div>

        {/* Chips de filtro */}
        <div style={styles.chips}>
          {tiposAcao.slice(0, 12).map((tipo) => {
            const ativo = filtroAcao === tipo;
            return (
              <button
                key={tipo}
                type="button"
                style={{
                  ...styles.chip,
                  ...(ativo ? styles.chipAtivo : {}),
                }}
                onClick={() => setFiltroAcao(tipo)}
              >
                {tipo === "TODAS" ? (
                  <IoFilterOutline
                    size={12}
                    color={ativo ? "#fff" : "#64748b"}
                  />
                ) : null}
                <span>{tipo}</span>
              </button>
            );
          })}
        </div>

        {/* Contador */}
        {!loading && (
          <p style={styles.contador}>
            {logsFiltrados.length} registro
            {logsFiltrados.length !== 1 ? "s" : ""}
            {filtroAcao !== "TODAS" ? ` · filtro: ${filtroAcao}` : ""}
          </p>
        )}

        {/* Lista */}
        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <span style={styles.loadingText}>Carregando auditoria...</span>
          </div>
        ) : logsFiltrados.length === 0 ? (
          <div style={styles.vazio}>
            <IoAlertCircleOutline size={40} color="#cbd5e1" />
            <p style={styles.vazioTitulo}>Nenhum registro encontrado</p>
            <p style={styles.vazioSub}>
              {logs.length === 0
                ? "O backend ainda não retornou logs, ou o endpoint de auditoria não está disponível."
                : "Tente outro filtro ou termo de busca."}
            </p>
          </div>
        ) : (
          <div style={styles.lista}>
            {logsFiltrados.map((log) => {
              const Icon = iconePorAcao(log.acao);
              const cores = corPorAcao(log.acao);
              return (
                <div key={log.id} style={styles.logCard}>
                  <div
                    style={{
                      ...styles.logIconBox,
                      backgroundColor: cores.bg,
                      borderColor: cores.borda,
                    }}
                  >
                    <Icon size={18} color={cores.cor} />
                  </div>

                  <div style={styles.logBody}>
                    <div style={styles.logHeader}>
                      <span
                        style={{
                          ...styles.badgeAcao,
                          backgroundColor: cores.bg,
                          color: cores.cor,
                          borderColor: cores.borda,
                        }}
                      >
                        {log.acao}
                      </span>
                      {log.entidade && (
                        <span style={styles.badgeEntidade}>{log.entidade}</span>
                      )}
                    </div>

                    {log.descricao ? (
                      <p style={styles.logDesc}>{log.descricao}</p>
                    ) : null}

                    <div style={styles.logMeta}>
                      <span style={styles.metaItem}>
                        <IoPersonOutline size={12} color="#94a3b8" />
                        {log.usuarioNome}
                      </span>
                      <span style={styles.metaItem}>
                        <IoTimeOutline size={12} color="#94a3b8" />
                        {formatarData(log.data)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
    marginBottom: 14,
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
  buscaWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "0 12px",
    height: 44,
    marginBottom: 10,
  },
  buscaInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
    background: "transparent",
    height: "100%",
  },
  clearBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "6px 12px",
    borderRadius: 20,
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    fontSize: 11,
    fontWeight: 600,
    color: "#64748b",
    cursor: "pointer",
  },
  chipAtivo: {
    backgroundColor: IFPE.primary,
    borderColor: IFPE.primary,
    color: "#ffffff",
  },
  contador: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: 600,
    margin: "0 0 10px 0",
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
  vazio: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "40px 20px",
    gap: 8,
  },
  vazioTitulo: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#334155",
  },
  vazioSub: {
    margin: 0,
    fontSize: 13,
    color: "#94a3b8",
    maxWidth: 320,
    lineHeight: 1.4,
  },
  lista: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  logCard: {
    display: "flex",
    gap: 12,
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 12,
  },
  logIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logBody: { flex: 1, minWidth: 0 },
  logHeader: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  badgeAcao: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 0.4,
    padding: "3px 8px",
    borderRadius: 6,
    border: "1px solid",
  },
  badgeEntidade: {
    fontSize: 10,
    fontWeight: 600,
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    padding: "3px 8px",
    borderRadius: 6,
  },
  logDesc: {
    margin: "0 0 6px 0",
    fontSize: 13,
    color: "#334155",
    lineHeight: 1.4,
  },
  logMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: 500,
  },
};