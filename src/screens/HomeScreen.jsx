import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoSearchOutline,
  IoCloseCircle,
  IoOptionsOutline,
  IoCubeOutline,
  IoLayersOutline,
  IoLocation,
  IoChevronForward,
  IoClose,
  IoAdd,
  IoQrCodeOutline,
} from "react-icons/io5";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import NotificationBell from "../components/NotificationBell";

const IFPE = {
  primary: "#15803d",
  primaryDark: "#166534",
  primaryLight: "#f0fdf4",
  primaryBorder: "#bbf7d0",
  primaryText: "#14532d",
  headerBg: "#14532d",
};

export default function HomeScreen() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busca, setBusca] = useState("");
  const debounceRef = useRef(null);

  const [categorias, setCategorias] = useState([]);
  const [locais, setLocais] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [localSelecionado, setLocalSelecionado] = useState(null);
  const [modalFiltro, setModalFiltro] = useState(false);

  const [toast, setToast] = useState({
    visivel: false,
    tipo: "info",
    mensagem: "",
  });

  const mostrarToast = useCallback((mensagem, tipo = "erro") => {
    setToast({ visivel: true, tipo, mensagem });
  }, []);

  useEffect(() => {
    carregarFiltros();
    carregarMateriais();
  }, []);

  const carregarFiltros = async () => {
    try {
      const [resCat, resLoc] = await Promise.all([
        api.get("/categoria"),
        api.get("/local"),
      ]);
      setCategorias(resCat.data || []);
      setLocais(resLoc.data || []);
    } catch (e) {
      console.error("Erro ao carregar filtros:", e);
    }
  };

  const carregarMateriais = useCallback(
    async (nome = "", idCategoria = null, idLocal = null) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (nome) params.append("nome", nome);
        if (idCategoria) params.append("idCategoria", idCategoria);
        if (idLocal) params.append("idLocal", idLocal);

        const query = params.toString();
        const response = query
          ? await api.post(`/material/filtrar?${query}`)
          : await api.get("/material");

        setMateriais(response.data || []);
      } catch (error) {
        console.error("Erro na API:", error);
        mostrarToast(
          "Não foi possível carregar os materiais. Verifique a conexão.",
          "erro"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [mostrarToast]
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarFiltros();
    carregarMateriais(busca, categoriaSelecionada?.id, localSelecionado?.id);
  };

  const handleBusca = (texto) => {
    setBusca(texto);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      carregarMateriais(texto, categoriaSelecionada?.id, localSelecionado?.id);
    }, 400);
  };

  const selecionarCategoriaRapida = (cat) => {
    const nova = categoriaSelecionada?.id === cat?.id ? null : cat;
    setCategoriaSelecionada(nova);
    carregarMateriais(busca, nova?.id, localSelecionado?.id);
  };

  const aplicarFiltros = () => {
    setModalFiltro(false);
    carregarMateriais(busca, categoriaSelecionada?.id, localSelecionado?.id);
  };

  const limparFiltros = () => {
    setCategoriaSelecionada(null);
    setLocalSelecionado(null);
    setBusca("");
    setModalFiltro(false);
    carregarMateriais();
  };

  const filtrosAtivos = !!categoriaSelecionada || !!localSelecionado;

  const formatarValor = (valor) => {
    if (!valor) return null;
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const BASE_URL = (api.defaults.baseURL || "").replace("/api", "");

  return (
    <div style={styles.container}>
      <Toast
        visivel={toast.visivel}
        tipo={toast.tipo}
        mensagem={toast.mensagem}
        onClose={() => setToast((t) => ({ ...t, visivel: false }))}
      />

      <div style={styles.headerActions}>
        {usuario?.role === "ROLE_ADM" && (
          <button
            type="button"
            style={styles.headerBtn}
            onClick={() => navigate("/materiais/cadastro")}
            title="Novo Material"
          >
            <IoAdd size={22} color="#ffffff" />
          </button>
        )}
        <button
          type="button"
          style={styles.headerBtn}
          onClick={() => navigate("/materiais/scanner")}
          title="Ler QR Code"
        >
          <IoQrCodeOutline size={19} color="#ffffff" />
        </button>
        <NotificationBell />
      </div>

      <div style={styles.topoContainer}>
        <div style={styles.buscaRow}>
          <div style={styles.buscaInputWrapper}>
            <IoSearchOutline
              size={18}
              color="#64748b"
              style={{ marginRight: 8 }}
            />
            <input
              style={styles.buscaInput}
              value={busca}
              onChange={(e) => handleBusca(e.target.value)}
              placeholder="Buscar materiais, patrimônios..."
            />
            {busca.length > 0 && (
              <button
                type="button"
                style={styles.clearBtn}
                onClick={() => handleBusca("")}
              >
                <IoCloseCircle size={18} color="#94a3b8" />
              </button>
            )}
          </div>

          <button
            type="button"
            style={{
              ...styles.btnFiltro,
              ...(filtrosAtivos ? styles.btnFiltroAtivo : {}),
            }}
            onClick={() => setModalFiltro(true)}
            title="Filtros avançados"
          >
            <IoOptionsOutline
              size={18}
              color={filtrosAtivos ? "#ffffff" : "#475569"}
            />
            {filtrosAtivos && <span style={styles.dotFiltro} />}
          </button>
        </div>

        <div style={styles.chipsScroll}>
          <button
            type="button"
            style={{
              ...styles.chip,
              ...(!categoriaSelecionada ? styles.chipAtivo : {}),
            }}
            onClick={() => selecionarCategoriaRapida(null)}
          >
            <span
              style={{
                ...styles.chipTexto,
                ...(!categoriaSelecionada ? styles.chipTextoAtivo : {}),
              }}
            >
              Todos
            </span>
          </button>

          {categorias.map((cat) => {
            const isAtivo = categoriaSelecionada?.id === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                style={{
                  ...styles.chip,
                  ...(isAtivo ? styles.chipAtivo : {}),
                }}
                onClick={() => selecionarCategoriaRapida(cat)}
              >
                <span
                  style={{
                    ...styles.chipTexto,
                    ...(isAtivo ? styles.chipTextoAtivo : {}),
                  }}
                >
                  {cat.nome}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filtrosAtivos && (
        <div style={styles.bannerFiltroAtivo}>
          <span style={styles.bannerFiltroTexto}>
            Filtros ativos:{" "}
            {[categoriaSelecionada?.nome, localSelecionado?.nome]
              .filter(Boolean)
              .join(" • ")}
          </span>
          <button
            type="button"
            style={styles.bannerLimparBtn}
            onClick={limparFiltros}
          >
            Limpar
          </button>
        </div>
      )}

      {loading && !refreshing ? (
        <div style={styles.centerContainer}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Carregando inventário...</p>
        </div>
      ) : (
        <div style={styles.lista}>
          <div style={styles.refreshRow}>
            <button
              type="button"
              style={styles.btnRefresh}
              onClick={onRefresh}
              disabled={refreshing}
            >
              {refreshing ? "Atualizando..." : "Atualizar lista"}
            </button>
          </div>

          {materiais.length > 0 && (
            <div style={styles.headerLista}>
              <span style={styles.totalItensTexto}>
                {materiais.length}{" "}
                {materiais.length === 1
                  ? "material encontrado"
                  : "materiais encontrados"}
              </span>
            </div>
          )}

          {materiais.length === 0 ? (
            <div style={styles.vazioContainer}>
              <div style={styles.vazioIconeCircle}>
                <IoCubeOutline size={44} color="#94a3b8" />
              </div>
              <h3 style={styles.vazioTitulo}>Nenhum material encontrado</h3>
              <p style={styles.vazioSub}>
                {busca || filtrosAtivos
                  ? "Tente ajustar os termos de pesquisa ou remover os filtros."
                  : "Nenhum item cadastrado no sistema ainda."}
              </p>
              {(busca || filtrosAtivos) && (
                <button
                  type="button"
                  style={styles.btnLimparVazio}
                  onClick={limparFiltros}
                >
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            <div style={styles.grid}>
              {materiais.map((item) => {
                const uriImagem = item.imagem
                  ? item.imagem.startsWith("http")
                    ? item.imagem
                    : `${BASE_URL}/imagens/${encodeURIComponent(item.imagem)}`
                  : null;
                const valorFormatado = formatarValor(item.valor);

                return (
                  <div
                    key={item.id}
                    style={styles.card}
                    onClick={() =>
                      navigate(`/materiais/detalhes/${item.id}`, {
                        state: { material: item },
                      })
                    }
                  >
                    <div style={styles.imagemContainer}>
                      {uriImagem ? (
                        <img
                          src={uriImagem}
                          alt={item.nome}
                          style={styles.imagem}
                        />
                      ) : (
                        <div style={styles.imagemPlaceholder}>
                          <IoCubeOutline size={36} color="#cbd5e1" />
                        </div>
                      )}
                      <div style={styles.badgeQtdFlutuante}>
                        <IoLayersOutline size={12} color="#ffffff" />
                        <span style={styles.badgeQtdTexto}>
                          {item.quantidade} un.
                        </span>
                      </div>
                    </div>

                    <div style={styles.cardContent}>
                      <div style={styles.metaRow}>
                        <div style={styles.categoriaPill}>
                          <span style={styles.categoriaPillTexto}>
                            {item.categoria?.nome || "Geral"}
                          </span>
                        </div>
                        {valorFormatado && (
                          <span style={styles.valorTexto}>
                            {valorFormatado}
                          </span>
                        )}
                      </div>

                      <h3 style={styles.nomeText}>{item.nome}</h3>

                      <div style={styles.localRow}>
                        <div style={styles.localInfo}>
                          <IoLocation size={13} color={IFPE.primary} />
                          <span style={styles.localText}>
                            {item.local?.nome || "Local não definido"}
                          </span>
                        </div>
                        <IoChevronForward size={16} color="#94a3b8" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {modalFiltro && (
        <div style={styles.modalOverlay} onClick={() => setModalFiltro(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHandle} />

            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitulo}>Filtros de Inventário</h2>
              <button
                type="button"
                style={styles.modalCloseBtn}
                onClick={() => setModalFiltro(false)}
              >
                <IoClose size={24} color="#64748b" />
              </button>
            </div>

            <div style={styles.modalBody}>
              <h3 style={styles.modalSecaoTitulo}>Categoria</h3>
              <div style={styles.modalChipsContainer}>
                {categorias.map((cat) => {
                  const sel = categoriaSelecionada?.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      style={{
                        ...styles.modalChip,
                        ...(sel ? styles.modalChipSelecionado : {}),
                      }}
                      onClick={() =>
                        setCategoriaSelecionada(sel ? null : cat)
                      }
                    >
                      <span
                        style={{
                          ...styles.modalChipTexto,
                          ...(sel ? styles.modalChipTextoSelecionado : {}),
                        }}
                      >
                        {cat.nome}
                      </span>
                    </button>
                  );
                })}
              </div>

              <h3 style={styles.modalSecaoTitulo}>Local de Armazenamento</h3>
              <div style={styles.modalChipsContainer}>
                {locais.map((loc) => {
                  const sel = localSelecionado?.id === loc.id;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      style={{
                        ...styles.modalChip,
                        ...(sel ? styles.modalChipSelecionado : {}),
                      }}
                      onClick={() => setLocalSelecionado(sel ? null : loc)}
                    >
                      <span
                        style={{
                          ...styles.modalChipTexto,
                          ...(sel ? styles.modalChipTextoSelecionado : {}),
                        }}
                      >
                        {loc.nome}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={styles.modalAcoes}>
              <button
                type="button"
                style={styles.modalBtnLimpar}
                onClick={limparFiltros}
              >
                Redefinir
              </button>
              <button
                type="button"
                style={styles.modalBtnAplicar}
                onClick={aplicarFiltros}
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100%",
    backgroundColor: "#f8fafc",
    fontFamily: "sans-serif",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    backgroundColor: IFPE.headerBg,
    justifyContent: "flex-end",
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
  },
  topoContainer: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    paddingTop: 12,
    paddingBottom: 8,
  },
  buscaRow: {
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    gap: 10,
  },
  buscaInputWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: "0 12px",
    height: 44,
  },
  buscaInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
    color: "#0f172a",
    height: "100%",
  },
  clearBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    padding: 0,
  },
  btnFiltro: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
    position: "relative",
  },
  btnFiltroAtivo: {
    backgroundColor: IFPE.primary,
  },
  dotFiltro: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    border: "1.5px solid #ffffff",
  },
  chipsScroll: {
    display: "flex",
    gap: 8,
    padding: "10px 16px 4px",
    overflowX: "auto",
  },
  chip: {
    padding: "7px 14px",
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  chipAtivo: {
    backgroundColor: IFPE.primary,
    borderColor: IFPE.primary,
  },
  chipTexto: {
    fontSize: 13,
    color: "#475569",
    fontWeight: 600,
  },
  chipTextoAtivo: {
    color: "#ffffff",
    fontWeight: 700,
  },
  bannerFiltroAtivo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: IFPE.primaryLight,
    padding: "8px 16px",
    borderBottom: `1px solid ${IFPE.primaryBorder}`,
  },
  bannerFiltroTexto: {
    fontSize: 12,
    color: IFPE.primaryText,
    fontWeight: 500,
    flex: 1,
  },
  bannerLimparBtn: {
    background: "transparent",
    border: "none",
    fontSize: 12,
    color: IFPE.primary,
    fontWeight: 700,
    cursor: "pointer",
    marginLeft: 8,
  },
  lista: {
    padding: 16,
    paddingBottom: 32,
    maxWidth: 960,
    margin: "0 auto",
  },
  refreshRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  btnRefresh: {
    background: "transparent",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    color: "#64748b",
    cursor: "pointer",
    fontWeight: 600,
  },
  headerLista: { marginBottom: 12 },
  totalItensTexto: { fontSize: 13, fontWeight: 600, color: "#64748b" },
  centerContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingTop: 60,
  },
  loadingText: { fontSize: 14, color: "#64748b", fontWeight: 500 },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid #e2e8f0",
    borderTop: `3px solid ${IFPE.primary}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.05)",
    cursor: "pointer",
    transition: "box-shadow 0.15s",
  },
  imagemContainer: {
    width: "100%",
    height: 155,
    backgroundColor: "#f1f5f9",
    position: "relative",
  },
  imagem: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  imagemPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  badgeQtdFlutuante: {
    position: "absolute",
    top: 10,
    right: 10,
    display: "flex",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    padding: "4px 9px",
    borderRadius: 12,
  },
  badgeQtdTexto: { color: "#ffffff", fontSize: 11, fontWeight: 700 },
  cardContent: { padding: 14 },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  categoriaPill: {
    backgroundColor: IFPE.primaryLight,
    padding: "3px 8px",
    borderRadius: 6,
  },
  categoriaPillTexto: {
    fontSize: 11,
    fontWeight: 700,
    color: IFPE.primary,
  },
  valorTexto: { fontSize: 13, fontWeight: 700, color: "#059669" },
  nomeText: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1.35,
    margin: "0 0 10px 0",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  localRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #f1f5f9",
    paddingTop: 10,
  },
  localInfo: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    flex: 1,
    minWidth: 0,
  },
  localText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 500,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  vazioContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 60,
    padding: "0 32px",
    textAlign: "center",
  },
  vazioIconeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f1f5f9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  vazioTitulo: {
    fontSize: 17,
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 6px 0",
  },
  vazioSub: {
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: 1.4,
    margin: 0,
  },
  btnLimparVazio: {
    marginTop: 18,
    backgroundColor: IFPE.primaryLight,
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    color: IFPE.primary,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: "20px 20px 36px",
    width: "100%",
    maxWidth: 520,
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#cbd5e1",
    borderRadius: 2,
    margin: "0 auto 16px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
  modalCloseBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  modalBody: {
    overflowY: "auto",
    flex: 1,
  },
  modalSecaoTitulo: {
    fontSize: 13,
    fontWeight: 700,
    color: "#475569",
    margin: "14px 0 10px 0",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalChipsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  modalChip: {
    padding: "8px 14px",
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
  },
  modalChipSelecionado: {
    backgroundColor: IFPE.primaryLight,
    borderColor: IFPE.primary,
  },
  modalChipTexto: {
    fontSize: 13,
    color: "#475569",
    fontWeight: 500,
  },
  modalChipTextoSelecionado: {
    color: IFPE.primary,
    fontWeight: 700,
  },
  modalAcoes: {
    display: "flex",
    gap: 12,
    marginTop: 24,
  },
  modalBtnLimpar: {
    flex: 1,
    padding: "14px 0",
    textAlign: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    border: "none",
    color: "#475569",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
  },
  modalBtnAplicar: {
    flex: 1.5,
    padding: "14px 0",
    textAlign: "center",
    backgroundColor: IFPE.primary,
    borderRadius: 12,
    border: "none",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
};