import React, { useState, useEffect, useCallback } from "react";
import {
  IoSwapHorizontal,
  IoConstruct,
  IoTime,
  IoNotifications,
  IoNotificationsOffOutline,
  IoTrashOutline,
  IoCheckmarkDone,
} from "react-icons/io5";
import api from "../services/api";
import Toast from "../components/Toast";

export default function NotificacoesScreen() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [filtro, setFiltro] = useState("todas"); // 'todas' | 'nao-lidas'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({
    visivel: false,
    tipo: "info",
    mensagem: "",
  });

  const mostrarToast = (mensagem, tipo = "erro") =>
    setToast({ visivel: true, tipo, mensagem });

  const carregarNotificacoes = useCallback(async () => {
    try {
      const endpoint =
        filtro === "nao-lidas" ? "/notificacao/nao-lidas" : "/notificacao";
      const response = await api.get(endpoint);
      setNotificacoes(response.data || []);
    } catch {
      mostrarToast("Não foi possível carregar as notificações.", "erro");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filtro]);

  useEffect(() => {
    setLoading(true);
    carregarNotificacoes();
  }, [carregarNotificacoes]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarNotificacoes();
  };

  const marcarComoLida = async (item) => {
    if (item.lida) return;
    try {
      await api.put(`/notificacao/${item.id}/ler`);
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, lida: true } : n))
      );
    } catch {
      // Ignora falha silenciosa
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      await api.put("/notificacao/ler-todas");
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
      mostrarToast("Todas as notificações foram marcadas como lidas.", "sucesso");
    } catch {
      mostrarToast("Erro ao marcar todas como lidas.", "erro");
    }
  };

  const excluirNotificacao = async (id) => {
    try {
      await api.delete(`/notificacao/${id}`);
      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
      mostrarToast("Notificação excluída.", "sucesso");
    } catch {
      mostrarToast("Não foi possível excluir a notificação.", "erro");
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return "";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "";
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obterIconeTipo = (tipo) => {
    switch (tipo) {
      case "MOVIMENTACAO":
        return { Icon: IoSwapHorizontal, cor: "#1a73e8", bg: "#e8f0fe" };
      case "MANUTENCAO":
        return { Icon: IoConstruct, cor: "#f2994a", bg: "#fef6ec" };
      case "PENDENCIA":
        return { Icon: IoTime, cor: "#9334ea", bg: "#f3e8ff" };
      default:
        return { Icon: IoNotifications, cor: "#5f6368", bg: "#f1f3f4" };
    }
  };

  return (
    <div style={styles.container}>
      <Toast
        visivel={toast.visivel}
        tipo={toast.tipo}
        mensagem={toast.mensagem}
        onClose={() => setToast((t) => ({ ...t, visivel: false }))}
      />

      {/* Barra de Filtros e Ação */}
      <div style={styles.topo}>
        <div style={styles.filtros}>
          <button
            type="button"
            style={{
              ...styles.chip,
              ...(filtro === "todas" ? styles.chipAtivo : {}),
            }}
            onClick={() => setFiltro("todas")}
          >
            <span
              style={{
                ...styles.chipTexto,
                ...(filtro === "todas" ? styles.chipTextoAtivo : {}),
              }}
            >
              Todas
            </span>
          </button>

          <button
            type="button"
            style={{
              ...styles.chip,
              ...(filtro === "nao-lidas" ? styles.chipAtivo : {}),
            }}
            onClick={() => setFiltro("nao-lidas")}
          >
            <span
              style={{
                ...styles.chipTexto,
                ...(filtro === "nao-lidas" ? styles.chipTextoAtivo : {}),
              }}
            >
              Não lidas
            </span>
          </button>
        </div>

        {notificacoes.some((n) => !n.lida) && (
          <button
            type="button"
            style={styles.btnMarcarTodas}
            onClick={marcarTodasComoLidas}
          >
            <IoCheckmarkDone size={16} color="#1a73e8" />
            <span style={styles.btnMarcarTodasTexto}>Marcar todas</span>
          </button>
        )}
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />
        </div>
      ) : notificacoes.length === 0 ? (
        <div style={styles.vazio}>
          <IoNotificationsOffOutline size={54} color="#dadce0" />
          <h3 style={styles.vazioTitulo}>Nenhuma notificação</h3>
          <p style={styles.vazioSub}>
            {filtro === "nao-lidas"
              ? "Você leu todas as notificações pendentes!"
              : "Quando houver novidades sobre transferências ou manutenções, elas aparecerão aqui."}
          </p>
        </div>
      ) : (
        <div style={styles.lista}>
          {/* Botão de refresh manual (substitui o pull-to-refresh) */}
          <div style={styles.refreshRow}>
            <button
              type="button"
              style={styles.btnRefresh}
              onClick={onRefresh}
              disabled={refreshing}
            >
              {refreshing ? "Atualizando..." : "Atualizar"}
            </button>
          </div>

          {notificacoes.map((item) => {
            const { Icon, cor, bg } = obterIconeTipo(item.tipo);

            return (
              <div
                key={item.id}
                style={{
                  ...styles.card,
                  ...(!item.lida ? styles.cardNaoLida : {}),
                }}
                onClick={() => marcarComoLida(item)}
              >
                <div style={{ ...styles.iconeContainer, backgroundColor: bg }}>
                  <Icon size={20} color={cor} />
                </div>

                <div style={styles.cardCorpo}>
                  <div style={styles.cardHeader}>
                    <span
                      style={{
                        ...styles.titulo,
                        ...(!item.lida ? styles.tituloNegrito : {}),
                      }}
                    >
                      {item.titulo || "Notificação"}
                    </span>
                    {!item.lida && <span style={styles.dotNaoLida} />}
                  </div>

                  <p style={styles.mensagem}>{item.mensagem}</p>

                  <div style={styles.cardRodape}>
                    <span style={styles.data}>
                      {formatarData(item.dataCriacao || item.createdAt)}
                    </span>

                    <button
                      type="button"
                      style={styles.btnExcluir}
                      onClick={(e) => {
                        e.stopPropagation();
                        excluirNotificacao(item.id);
                      }}
                      title="Excluir"
                    >
                      <IoTrashOutline size={16} color="#9aa0a6" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100%",
    backgroundColor: "#f4f6f9",
    fontFamily: "sans-serif",
  },
  topo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #dadce0",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  filtros: {
    display: "flex",
    gap: 8,
  },
  chip: {
    padding: "6px 12px",
    borderRadius: 16,
    backgroundColor: "#f1f3f4",
    border: "none",
    cursor: "pointer",
  },
  chipAtivo: {
    backgroundColor: "#1a73e8",
  },
  chipTexto: {
    fontSize: 13,
    color: "#5f6368",
    fontWeight: 600,
  },
  chipTextoAtivo: {
    color: "#ffffff",
  },
  btnMarcarTodas: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  btnMarcarTodasTexto: {
    fontSize: 13,
    color: "#1a73e8",
    fontWeight: 600,
  },
  loadingBox: {
    display: "flex",
    justifyContent: "center",
    paddingTop: 40,
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #1a73e8",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  lista: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxWidth: 720,
    margin: "0 auto",
  },
  refreshRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  btnRefresh: {
    background: "transparent",
    border: "1px solid #dadce0",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    color: "#5f6368",
    cursor: "pointer",
    fontWeight: 600,
  },
  card: {
    display: "flex",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    border: "1px solid #dadce0",
    gap: 12,
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
  cardNaoLida: {
    backgroundColor: "#f8faff",
    borderColor: "#c5d8fa",
    borderLeft: "4px solid #1a73e8",
  },
  iconeContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  cardCorpo: {
    flex: 1,
    minWidth: 0,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  titulo: {
    fontSize: 14,
    color: "#3c4043",
    fontWeight: 500,
  },
  tituloNegrito: {
    fontWeight: 700,
    color: "#202124",
  },
  dotNaoLida: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1a73e8",
    flexShrink: 0,
  },
  mensagem: {
    fontSize: 13,
    color: "#5f6368",
    lineHeight: 1.4,
    margin: "0 0 8px 0",
  },
  cardRodape: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  data: {
    fontSize: 11,
    color: "#9aa0a6",
  },
  btnExcluir: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
  },
  vazio: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 70,
    padding: "0 32px",
    textAlign: "center",
  },
  vazioTitulo: {
    fontSize: 16,
    fontWeight: 700,
    color: "#3c4043",
    margin: "12px 0 0 0",
  },
  vazioSub: {
    fontSize: 13,
    color: "#9aa0a6",
    marginTop: 6,
    lineHeight: 1.4,
    maxWidth: 320,
  },
};