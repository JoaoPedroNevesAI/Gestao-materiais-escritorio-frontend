import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  IoCubeOutline,
  IoPricetag,
  IoLocation,
  IoCheckbox,
  IoSquareOutline,
  IoSwapHorizontal,
  IoConstruct,
  IoQrCodeOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoSwapHorizontalOutline,
  IoConstructOutline,
  IoBarcodeOutline,
  IoArrowForward,
  IoClose,
  IoQrCode,
  IoLocationOutline,
  IoRefresh,
} from "react-icons/io5";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";

const IFPE = {
  primary: "#15803d",
  primaryDark: "#166534",
  primaryLight: "#f0fdf4",
  primaryBorder: "#bbf7d0",
  primaryText: "#14532d",
};

export default function DetalhesMaterialScreen() {
  const navigate = useNavigate();
  const { materialId: paramId } = useParams();
  const location = useLocation();

  const materialParam = location.state?.material || null;
  const materialId = paramId || materialParam?.id || null;

  const [materialAtual, setMaterialAtual] = useState(materialParam);
  const [historico, setHistorico] = useState([]);
  const [historicoManutencoes, setHistoricoManutencoes] = useState([]);
  const [abaHistorico, setAbaHistorico] = useState("movimentacoes");
  const [loadingMaterial, setLoadingMaterial] = useState(
    !materialParam && !!materialId
  );
  const [loadingHistorico, setLoadingHistorico] = useState(true);
  const [patrimoniosSelecionados, setPatrimoniosSelecionados] = useState([]);
  const [modalQrCode, setModalQrCode] = useState({
    visivel: false,
    patrimonio: null,
    loading: false,
  });
  const [modalExcluir, setModalExcluir] = useState(false);

  const { usuario } = useAuth();

  const [toast, setToast] = useState({
    visivel: false,
    tipo: "info",
    mensagem: "",
  });

  const mostrarToast = (mensagem, tipo = "erro") =>
    setToast({ visivel: true, tipo, mensagem });

  const toggleSelecionar = (pat) => {
    if (patrimoniosSelecionados.some((p) => p.id === pat.id)) {
      setPatrimoniosSelecionados(
        patrimoniosSelecionados.filter((p) => p.id !== pat.id)
      );
    } else {
      setPatrimoniosSelecionados([...patrimoniosSelecionados, pat]);
    }
  };

  const carregarDados = useCallback(async () => {
    if (!materialId) {
      mostrarToast("Não foi possível identificar o material.", "erro");
      setLoadingMaterial(false);
      setLoadingHistorico(false);
      return;
    }

    try {
      setLoadingMaterial(true);
      const responseMaterial = await api.get(`/material/${materialId}`);
      setMaterialAtual(responseMaterial.data);

      setLoadingHistorico(true);
      const responseHistorico = await api.get("/movimentacao");
      const listPatrimonios = responseMaterial.data.patrimonios || [];
      const listPatrimonioIds = listPatrimonios.map((p) => p.id);

      const historicoFiltrado = (responseHistorico.data || []).filter(
        (mov) =>
          mov.patrimonio?.id && listPatrimonioIds.includes(mov.patrimonio.id)
      );
      setHistorico(historicoFiltrado);

      if (listPatrimonioIds.length > 0) {
        const promessasManut = listPatrimonioIds.map((id) =>
          api.get(`/manutencao/patrimonio/${id}`).catch(() => ({ data: [] }))
        );
        const respsManut = await Promise.all(promessasManut);
        const todasManut = respsManut.flatMap((r) => r.data || []);
        todasManut.sort(
          (a, b) =>
            new Date(b.dataSolicitacao || 0) - new Date(a.dataSolicitacao || 0)
        );
        setHistoricoManutencoes(todasManut);
      } else {
        setHistoricoManutencoes([]);
      }
    } catch {
      mostrarToast("Não foi possível carregar os dados do material.", "erro");
    } finally {
      setLoadingMaterial(false);
      setLoadingHistorico(false);
    }
  }, [materialId]);

  useEffect(() => {
    setPatrimoniosSelecionados([]);
    carregarDados();
  }, [carregarDados]);

  const handleExcluir = async () => {
    try {
      await api.delete(`/material/${materialAtual.id}`);
      mostrarToast("Material excluído com sucesso!", "sucesso");
      setModalExcluir(false);
      setTimeout(() => navigate(-1), 1000);
    } catch {
      mostrarToast("Não foi possível excluir o material.", "erro");
    }
  };

  const abrirModalQrCode = (pat) => {
    setModalQrCode({
      visivel: true,
      patrimonio: pat,
      loading: false,
    });
  };

  const handleRegenerarNoModal = async () => {
    if (!modalQrCode.patrimonio) return;
    setModalQrCode((prev) => ({ ...prev, loading: true }));
    try {
      const resp = await api.post(
        `/patrimonio/${modalQrCode.patrimonio.id}/qrcode/regenerar`
      );
      setModalQrCode((prev) => ({
        ...prev,
        loading: false,
        patrimonio: resp.data || prev.patrimonio,
      }));
      mostrarToast("QR Code regenerado com sucesso!", "sucesso");
    } catch {
      setModalQrCode((prev) => ({ ...prev, loading: false }));
      mostrarToast("Não foi possível regenerar o QR Code.", "erro");
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return "—";
    return new Date(dataString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatarValor = (valor) => {
    if (!valor) return null;
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const obterStatusPatrimonioBadge = (status) => {
    switch (status) {
      case "DISPONIVEL":
        return {
          rotulo: "Disponível",
          bg: "#ecfdf5",
          cor: "#059669",
          borda: "#a7f3d0",
        };
      case "EM_USO":
        return {
          rotulo: "Em Uso",
          bg: IFPE.primaryLight,
          cor: IFPE.primary,
          borda: IFPE.primaryBorder,
        };
      case "EM_MANUTENCAO":
        return {
          rotulo: "Manutenção",
          bg: "#fffbeb",
          cor: "#d97706",
          borda: "#fde68a",
        };
      case "BAIXADO":
        return {
          rotulo: "Baixado",
          bg: "#fef2f2",
          cor: "#dc2626",
          borda: "#fecaca",
        };
      default:
        return {
          rotulo: status || "Ativo",
          bg: "#f1f5f9",
          cor: "#475569",
          borda: "#cbd5e1",
        };
    }
  };

  const obterStatusManutencaoBadge = (status) => {
    switch (status) {
      case "PENDENTE":
        return {
          rotulo: "Pendente",
          bg: "#fffbeb",
          cor: "#d97706",
          borda: "#fde68a",
        };
      case "APROVADA":
        return {
          rotulo: "Aprovada",
          bg: "#ecfdf5",
          cor: "#059669",
          borda: "#a7f3d0",
        };
      case "REPROVADA":
        return {
          rotulo: "Reprovada",
          bg: "#fef2f2",
          cor: "#dc2626",
          borda: "#fecaca",
        };
      case "CONCLUIDA":
        return {
          rotulo: "Concluída",
          bg: IFPE.primaryLight,
          cor: IFPE.primary,
          borda: IFPE.primaryBorder,
        };
      default:
        return {
          rotulo: status || "Status",
          bg: "#f1f5f9",
          cor: "#475569",
          borda: "#cbd5e1",
        };
    }
  };

  const BASE_URL = (api.defaults.baseURL || "").replace("/api", "");
  const uriImagem = materialAtual?.imagem
    ? materialAtual.imagem.startsWith("http")
      ? materialAtual.imagem
      : `${BASE_URL}/imagens/${encodeURIComponent(materialAtual.imagem)}`
    : null;

  if (loadingMaterial) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinnerLarge} />
      </div>
    );
  }

  if (!materialAtual) {
    return (
      <div style={styles.centerContainer}>
        <p style={styles.erroTitulo}>Material não encontrado.</p>
        <button
          type="button"
          style={styles.btnVoltar}
          onClick={() => navigate(-1)}
        >
          Voltar
        </button>
      </div>
    );
  }

  const patrimonios = materialAtual.patrimonios || [];
  const totalDisponiveis = patrimonios.filter(
    (p) => p.status === "DISPONIVEL"
  ).length;
  const totalEmUso = patrimonios.filter((p) => p.status === "EM_USO").length;
  const totalManutencao = patrimonios.filter(
    (p) => p.status === "EM_MANUTENCAO"
  ).length;

  return (
    <div style={styles.container}>
      <Toast
        visivel={toast.visivel}
        tipo={toast.tipo}
        mensagem={toast.mensagem}
        onClose={() => setToast((t) => ({ ...t, visivel: false }))}
      />

      <div style={styles.content}>
        <div style={styles.heroContainer}>
          {uriImagem ? (
            <img
              src={uriImagem}
              alt={materialAtual.nome}
              style={styles.heroImagem}
            />
          ) : (
            <div style={styles.heroPlaceholder}>
              <IoCubeOutline size={64} color="#cbd5e1" />
              <span style={styles.heroPlaceholderTexto}>Sem foto anexada</span>
            </div>
          )}
        </div>

        <div style={styles.mainInfoCard}>
          <div style={styles.pillRow}>
            {materialAtual.categoria?.nome && (
              <div style={styles.categoriaPill}>
                <IoPricetag size={11} color={IFPE.primary} />
                <span style={styles.categoriaPillTexto}>
                  {materialAtual.categoria.nome}
                </span>
              </div>
            )}
            {materialAtual.local?.nome && (
              <div style={styles.localPill}>
                <IoLocation size={11} color="#475569" />
                <span style={styles.localPillTexto}>
                  {materialAtual.local.nome}
                </span>
              </div>
            )}
          </div>

          <h1 style={styles.tituloNome}>{materialAtual.nome}</h1>

          {materialAtual.descricao && (
            <p style={styles.descricaoTexto}>{materialAtual.descricao}</p>
          )}

          {materialAtual.valor && (
            <p style={styles.precoTexto}>{formatarValor(materialAtual.valor)}</p>
          )}

          <div style={styles.metricasGrid}>
            <div style={styles.metricaBox}>
              <span style={styles.metricaNumero}>{materialAtual.quantidade}</span>
              <span style={styles.metricaRotulo}>Total</span>
            </div>
            <div
              style={{
                ...styles.metricaBox,
                borderColor: "#a7f3d0",
                backgroundColor: "#f0fdf4",
              }}
            >
              <span style={{ ...styles.metricaNumero, color: "#059669" }}>
                {totalDisponiveis}
              </span>
              <span style={styles.metricaRotulo}>Disponíveis</span>
            </div>
            <div
              style={{
                ...styles.metricaBox,
                borderColor: IFPE.primaryBorder,
                backgroundColor: IFPE.primaryLight,
              }}
            >
              <span style={{ ...styles.metricaNumero, color: IFPE.primary }}>
                {totalEmUso}
              </span>
              <span style={styles.metricaRotulo}>Em Uso</span>
            </div>
            {totalManutencao > 0 && (
              <div
                style={{
                  ...styles.metricaBox,
                  borderColor: "#fde68a",
                  backgroundColor: "#fffbeb",
                }}
              >
                <span style={{ ...styles.metricaNumero, color: "#d97706" }}>
                  {totalManutencao}
                </span>
                <span style={styles.metricaRotulo}>Reparo</span>
              </div>
            )}
          </div>
        </div>

        {patrimonios.length > 0 && (
          <div style={styles.secaoPatrimonios}>
            <div style={styles.secaoHeader}>
              <h2 style={styles.secaoTitulo}>
                Itens Patrimoniais ({patrimonios.length})
              </h2>
              <p style={styles.secaoSub}>
                {patrimoniosSelecionados.length > 0
                  ? `${patrimoniosSelecionados.length} selecionado(s)`
                  : "Clique no item para selecionar em lote"}
              </p>
            </div>

            {patrimonios.map((pat) => {
              const isSelected = patrimoniosSelecionados.some(
                (p) => p.id === pat.id
              );
              const statusBadge = obterStatusPatrimonioBadge(pat.status);

              return (
                <div
                  key={pat.id}
                  style={{
                    ...styles.patrimonioCard,
                    ...(isSelected ? styles.patrimonioCardSelecionado : {}),
                  }}
                >
                  <div
                    style={styles.patrimonioCardTop}
                    onClick={() => toggleSelecionar(pat)}
                  >
                    <div style={styles.patrimonioLeft}>
                      {isSelected ? (
                        <IoCheckbox size={22} color={IFPE.primary} />
                      ) : (
                        <IoSquareOutline size={22} color="#94a3b8" />
                      )}
                      <div>
                        <div style={styles.codigoPatrimonio}>
                          {pat.codigoPatrimonio}
                        </div>
                        <div style={styles.localPatrimonio}>
                          Local:{" "}
                          {pat.local?.nome ||
                            materialAtual.local?.nome ||
                            "Sem local"}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: statusBadge.bg,
                        borderColor: statusBadge.borda,
                      }}
                    >
                      <span
                        style={{
                          ...styles.statusBadgeTexto,
                          color: statusBadge.cor,
                        }}
                      >
                        {statusBadge.rotulo}
                      </span>
                    </div>
                  </div>

                  <div style={styles.patrimonioAcoesRow}>
                    <button
                      type="button"
                      style={styles.btnAcaoPill}
                      onClick={() =>
                        navigate("/materiais/transferir", {
                          state: { material: materialAtual, patrimonio: pat },
                        })
                      }
                    >
                      <IoSwapHorizontal size={14} color={IFPE.primary} />
                      <span style={styles.btnAcaoPillTexto}>Transferir</span>
                    </button>

                    <button
                      type="button"
                      style={{
                        ...styles.btnAcaoPill,
                        ...styles.btnAcaoManutencao,
                      }}
                      onClick={() =>
                        navigate("/materiais/manutencao", {
                          state: { material: materialAtual, patrimonio: pat },
                        })
                      }
                    >
                      <IoConstruct size={13} color="#d97706" />
                      <span
                        style={{
                          ...styles.btnAcaoPillTexto,
                          color: "#d97706",
                        }}
                      >
                        Manutenção
                      </span>
                    </button>

                    <button
                      type="button"
                      style={styles.btnQrCodePill}
                      onClick={() => abrirModalQrCode(pat)}
                      title="Ver QR Code"
                    >
                      <IoQrCodeOutline size={15} color={IFPE.primary} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {usuario?.role === "ROLE_ADM" && (
          <div style={styles.adminAcoesContainer}>
            <button
              type="button"
              style={styles.btnEditarMaterial}
              onClick={() =>
                navigate("/materiais/cadastro", {
                  state: { material: materialAtual },
                })
              }
            >
              <IoCreateOutline size={18} color={IFPE.primary} />
              <span style={styles.btnEditarMaterialTexto}>Editar Material</span>
            </button>
            <button
              type="button"
              style={styles.btnExcluirMaterial}
              onClick={() => setModalExcluir(true)}
            >
              <IoTrashOutline size={18} color="#dc2626" />
              <span style={styles.btnExcluirMaterialTexto}>Excluir</span>
            </button>
          </div>
        )}

        <div style={styles.historicoTabsContainer}>
          <button
            type="button"
            style={{
              ...styles.historicoTabBtn,
              ...(abaHistorico === "movimentacoes"
                ? styles.historicoTabBtnAtivo
                : {}),
            }}
            onClick={() => setAbaHistorico("movimentacoes")}
          >
            <IoSwapHorizontalOutline
              size={15}
              color={
                abaHistorico === "movimentacoes" ? IFPE.primary : "#64748b"
              }
            />
            <span
              style={{
                ...styles.historicoTabTexto,
                ...(abaHistorico === "movimentacoes"
                  ? styles.historicoTabTextoAtivo
                  : {}),
              }}
            >
              Transferências ({historico.length})
            </span>
          </button>

          <button
            type="button"
            style={{
              ...styles.historicoTabBtn,
              ...(abaHistorico === "manutencoes"
                ? styles.historicoTabBtnAtivo
                : {}),
            }}
            onClick={() => setAbaHistorico("manutencoes")}
          >
            <IoConstructOutline
              size={15}
              color={
                abaHistorico === "manutencoes" ? IFPE.primary : "#64748b"
              }
            />
            <span
              style={{
                ...styles.historicoTabTexto,
                ...(abaHistorico === "manutencoes"
                  ? styles.historicoTabTextoAtivo
                  : {}),
              }}
            >
              Manutenções ({historicoManutencoes.length})
            </span>
          </button>
        </div>

        {loadingHistorico ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 24 }}
          >
            <div style={styles.spinner} />
          </div>
        ) : abaHistorico === "movimentacoes" ? (
          historico.length === 0 ? (
            <div style={styles.vazioHistorico}>
              <IoSwapHorizontalOutline size={36} color="#cbd5e1" />
              <p style={styles.vazioHistoricoTexto}>
                Nenhuma movimentação registrada para este material.
              </p>
            </div>
          ) : (
            historico.map((item) => (
              <div key={item.id} style={styles.historicoCard}>
                <div style={styles.historicoHeader}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <IoBarcodeOutline size={14} color={IFPE.primary} />
                    <span style={styles.historicoCodigo}>
                      {item.patrimonio?.codigoPatrimonio || "Geral"}
                    </span>
                  </div>
                  <span style={styles.historicoData}>
                    {formatarData(item.dataMovimentacao || item.createdAt)}
                  </span>
                </div>

                <div style={styles.rotaBox}>
                  <div style={styles.rotaLocal}>
                    <span style={styles.rotaLabel}>ORIGEM</span>
                    <span style={styles.rotaNome}>
                      {item.localOrigem?.nome || "—"}
                    </span>
                  </div>
                  <IoArrowForward size={16} color={IFPE.primary} />
                  <div style={styles.rotaLocal}>
                    <span style={styles.rotaLabel}>DESTINO</span>
                    <span style={styles.rotaNome}>
                      {item.localDestino?.nome || "—"}
                    </span>
                  </div>
                </div>

                {item.observacao && (
                  <p style={styles.historicoObs}>"{item.observacao}"</p>
                )}

                <p style={styles.historicoAutor}>
                  Por:{" "}
                  <strong style={{ color: "#334155" }}>
                    {item.usuario?.nome || "—"}
                  </strong>
                </p>
              </div>
            ))
          )
        ) : historicoManutencoes.length === 0 ? (
          <div style={styles.vazioHistorico}>
            <IoConstructOutline size={36} color="#cbd5e1" />
            <p style={styles.vazioHistoricoTexto}>
              Nenhuma manutenção registrada para este material.
            </p>
          </div>
        ) : (
          historicoManutencoes.map((item) => {
            const badge = obterStatusManutencaoBadge(item.status);
            return (
              <div key={item.id} style={styles.historicoCard}>
                <div style={styles.historicoHeader}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <IoConstructOutline size={14} color="#d97706" />
                    <span style={styles.historicoCodigo}>
                      {item.patrimonio?.codigoPatrimonio ||
                        "PAT-" + item.patrimonio?.id}
                    </span>
                  </div>
                  <div
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: badge.bg,
                      borderColor: badge.borda,
                    }}
                  >
                    <span
                      style={{ ...styles.statusBadgeTexto, color: badge.cor }}
                    >
                      {badge.rotulo}
                    </span>
                  </div>
                </div>

                <p style={styles.defeitoDescricao}>"{item.descricao}"</p>

                {item.observacaoAdmin && (
                  <div style={styles.obsAdminCard}>
                    <span style={styles.obsAdminLabel}>Parecer ADM:</span>
                    <p style={styles.obsAdminTexto}>{item.observacaoAdmin}</p>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <span style={styles.historicoAutor}>
                    Solicitante:{" "}
                    <strong style={{ color: "#334155" }}>
                      {item.solicitante?.nome || "—"}
                    </strong>
                  </span>
                  <span style={styles.historicoData}>
                    {formatarData(item.dataSolicitacao)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {patrimoniosSelecionados.length > 0 && (
        <div style={styles.barraLoteFlutuante}>
          <button
            type="button"
            style={styles.btnLoteConfirmar}
            onClick={() =>
              navigate("/materiais/transferir", {
                state: {
                  material: materialAtual,
                  patrimonios: patrimoniosSelecionados,
                },
              })
            }
          >
            <IoSwapHorizontal size={18} color="#ffffff" />
            <span style={styles.btnLoteTexto}>
              Transferir Selecionados ({patrimoniosSelecionados.length})
            </span>
          </button>
        </div>
      )}

      {modalQrCode.visivel && (
        <div style={styles.modalQrOverlay}>
          <div style={styles.modalQrCard}>
            <div style={styles.modalQrHeader}>
              <div style={styles.modalQrIconBox}>
                <IoQrCode size={20} color={IFPE.primary} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.modalQrTitulo}>Etiqueta de Patrimônio</div>
                <div style={styles.modalQrSub}>{materialAtual?.nome}</div>
              </div>
              <button
                type="button"
                style={styles.modalQrCloseBtn}
                onClick={() =>
                  setModalQrCode((prev) => ({ ...prev, visivel: false }))
                }
              >
                <IoClose size={20} color="#64748b" />
              </button>
            </div>

            {modalQrCode.patrimonio && (
              <>
                <div style={styles.modalQrCodeBox}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                      modalQrCode.patrimonio.codigoPatrimonio
                    )}`}
                    alt="QR Code"
                    style={styles.modalQrImage}
                  />
                </div>

                <div style={styles.modalQrInfoRow}>
                  <div style={styles.modalQrCodigo}>
                    {modalQrCode.patrimonio.codigoPatrimonio}
                  </div>
                  <div style={styles.modalQrLocalPill}>
                    <IoLocationOutline size={13} color="#475569" />
                    <span style={styles.modalQrLocalText}>
                      {modalQrCode.patrimonio.local?.nome ||
                        materialAtual?.local?.nome ||
                        "Não definido"}
                    </span>
                  </div>
                </div>

                <p style={styles.modalQrDica}>
                  Aponte a câmera do leitor de qualquer celular para identificar
                  este bem automaticamente.
                </p>

                {usuario?.role === "ROLE_ADM" && (
                  <button
                    type="button"
                    style={{
                      ...styles.btnRegenerarModal,
                      ...(modalQrCode.loading ? { opacity: 0.6 } : {}),
                    }}
                    onClick={handleRegenerarNoModal}
                    disabled={modalQrCode.loading}
                  >
                    {modalQrCode.loading ? (
                      <div style={styles.spinnerSmall} />
                    ) : (
                      <>
                        <IoRefresh size={16} color={IFPE.primary} />
                        <span style={styles.btnRegenerarModalTexto}>
                          Regenerar Imagem no Servidor
                        </span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              style={styles.btnModalQrFechar}
              onClick={() =>
                setModalQrCode((prev) => ({ ...prev, visivel: false }))
              }
            >
              Concluído
            </button>
          </div>
        </div>
      )}

      {modalExcluir && (
        <div style={styles.modalQrOverlay}>
          <div style={{ ...styles.modalQrCard, maxWidth: 360 }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>
              Excluir material
            </h3>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
              Tem certeza que deseja excluir este item? Essa ação não pode ser
              desfeita.
            </p>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 12,
                  border: "none",
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                onClick={() => setModalExcluir(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 12,
                  border: "none",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                onClick={handleExcluir}
              >
                Excluir
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
    position: "relative",
  },
  centerContainer: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  erroTitulo: { fontSize: 16, fontWeight: 600, color: "#0f172a" },
  btnVoltar: {
    backgroundColor: IFPE.primary,
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },
  content: { paddingBottom: 80, maxWidth: 720, margin: "0 auto" },

  heroContainer: {
    width: "100%",
    height: 230,
    backgroundColor: "#e2e8f0",
  },
  heroImagem: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  heroPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  heroPlaceholderTexto: { color: "#94a3b8", fontSize: 13 },

  mainInfoCard: {
    backgroundColor: "#ffffff",
    margin: "-28px 16px 0",
    borderRadius: 20,
    padding: 18,
    boxShadow: "0 3px 12px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e2e8f0",
    position: "relative",
    zIndex: 2,
  },
  pillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  categoriaPill: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    backgroundColor: IFPE.primaryLight,
    padding: "5px 10px",
    borderRadius: 14,
  },
  categoriaPillTexto: {
    fontSize: 11,
    fontWeight: 700,
    color: IFPE.primary,
  },
  localPill: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f1f5f9",
    padding: "5px 10px",
    borderRadius: 14,
  },
  localPillTexto: { fontSize: 11, fontWeight: 600, color: "#475569" },
  tituloNome: {
    fontSize: 21,
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1.3,
    margin: "0 0 6px 0",
  },
  descricaoTexto: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.45,
    margin: "0 0 10px 0",
  },
  precoTexto: {
    fontSize: 18,
    fontWeight: 800,
    color: "#059669",
    margin: "0 0 14px 0",
  },
  metricasGrid: {
    display: "flex",
    gap: 8,
    borderTop: "1px solid #f1f5f9",
    paddingTop: 14,
    flexWrap: "wrap",
  },
  metricaBox: {
    flex: 1,
    minWidth: 70,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: "10px 0",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  metricaNumero: {
    fontSize: 17,
    fontWeight: 800,
    color: "#0f172a",
    display: "block",
  },
  metricaRotulo: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: 600,
    marginTop: 2,
    display: "block",
  },

  secaoPatrimonios: {
    margin: "20px 16px 0",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  secaoHeader: { marginBottom: 4 },
  secaoTitulo: {
    fontSize: 14,
    fontWeight: 700,
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    margin: 0,
  },
  secaoSub: { fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" },

  patrimonioCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 6px rgba(15, 23, 42, 0.04)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  patrimonioCardSelecionado: {
    borderColor: IFPE.primary,
    backgroundColor: IFPE.primaryLight,
  },
  patrimonioCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  patrimonioLeft: { display: "flex", alignItems: "center", gap: 12 },
  codigoPatrimonio: { fontSize: 15, fontWeight: 700, color: "#0f172a" },
  localPatrimonio: { fontSize: 12, color: "#64748b" },
  statusBadge: {
    padding: "3px 8px",
    borderRadius: 8,
    border: "1px solid",
  },
  statusBadgeTexto: { fontSize: 11, fontWeight: 700 },

  patrimonioAcoesRow: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    borderTop: "1px solid #f1f5f9",
    paddingTop: 10,
    flexWrap: "wrap",
  },
  btnAcaoPill: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    backgroundColor: IFPE.primaryLight,
    padding: "6px 12px",
    borderRadius: 20,
    border: `1px solid ${IFPE.primaryBorder}`,
    cursor: "pointer",
  },
  btnAcaoPillTexto: {
    color: IFPE.primary,
    fontSize: 12,
    fontWeight: 700,
  },
  btnAcaoManutencao: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  btnQrCodePill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
  },

  adminAcoesContainer: {
    display: "flex",
    margin: "18px 16px 0",
    gap: 10,
  },
  btnEditarMaterial: {
    flex: 1,
    display: "flex",
    backgroundColor: IFPE.primaryLight,
    padding: "12px 0",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: `1px solid ${IFPE.primaryBorder}`,
    cursor: "pointer",
  },
  btnEditarMaterialTexto: {
    color: IFPE.primary,
    fontWeight: 700,
    fontSize: 14,
  },
  btnExcluirMaterial: {
    flex: 1,
    display: "flex",
    backgroundColor: "#fef2f2",
    padding: "12px 0",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: "1px solid #fecaca",
    cursor: "pointer",
  },
  btnExcluirMaterialTexto: {
    color: "#dc2626",
    fontWeight: 700,
    fontSize: 14,
  },

  historicoTabsContainer: {
    display: "flex",
    backgroundColor: "#ffffff",
    margin: "22px 16px 12px",
    borderRadius: 12,
    padding: 4,
    border: "1px solid #e2e8f0",
  },
  historicoTabBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "9px 0",
    borderRadius: 9,
    gap: 6,
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  historicoTabBtnAtivo: { backgroundColor: IFPE.primaryLight },
  historicoTabTexto: {
    fontSize: 13,
    fontWeight: 600,
    color: "#64748b",
  },
  historicoTabTextoAtivo: {
    color: IFPE.primary,
    fontWeight: 700,
  },

  vazioHistorico: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 28,
    gap: 8,
  },
  vazioHistoricoTexto: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
    margin: 0,
  },

  historicoCard: {
    backgroundColor: "#ffffff",
    margin: "0 16px 10px",
    borderRadius: 14,
    padding: 14,
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 6px rgba(15, 23, 42, 0.04)",
  },
  historicoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 6,
  },
  historicoCodigo: { fontSize: 13, fontWeight: 700, color: "#0f172a" },
  historicoData: { fontSize: 11, color: "#94a3b8" },
  rotaBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  rotaLocal: { flex: 1, textAlign: "center" },
  rotaLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: 700,
    letterSpacing: 0.4,
    display: "block",
  },
  rotaNome: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0f172a",
    marginTop: 2,
    display: "block",
  },
  historicoObs: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
    margin: "0 0 6px 0",
  },
  historicoAutor: { fontSize: 12, color: "#94a3b8", margin: 0 },
  defeitoDescricao: {
    fontSize: 13,
    color: "#334155",
    fontStyle: "italic",
    margin: "0 0 8px 0",
  },
  obsAdminCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    border: "1px solid #e2e8f0",
  },
  obsAdminLabel: { fontSize: 11, fontWeight: 700, color: "#64748b" },
  obsAdminTexto: { fontSize: 12, color: "#0f172a", margin: "2px 0 0 0" },

  barraLoteFlutuante: {
    position: "fixed",
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    padding: 16,
    borderTop: "1px solid #e2e8f0",
    zIndex: 50,
  },
  btnLoteConfirmar: {
    width: "100%",
    maxWidth: 480,
    margin: "0 auto",
    display: "flex",
    backgroundColor: IFPE.primary,
    padding: "14px 0",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(21, 128, 61, 0.3)",
  },
  btnLoteTexto: { color: "#ffffff", fontWeight: 700, fontSize: 15 },

  modalQrOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 1000,
  },
  modalQrCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 22,
    width: "100%",
    maxWidth: 360,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.25)",
  },
  modalQrHeader: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "1px solid #f1f5f9",
  },
  modalQrIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: IFPE.primaryLight,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  modalQrTitulo: { fontSize: 16, fontWeight: 800, color: "#0f172a" },
  modalQrSub: { fontSize: 12, color: "#64748b" },
  modalQrCloseBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  modalQrCodeBox: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 18,
    border: "1.5px solid #e2e8f0",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
    marginBottom: 16,
  },
  modalQrImage: { width: 200, height: 200, display: "block" },
  modalQrInfoRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  modalQrCodigo: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: 0.5,
  },
  modalQrLocalPill: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: 12,
  },
  modalQrLocalText: { fontSize: 12, color: "#475569", fontWeight: 600 },
  modalQrDica: {
    fontSize: 11.5,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 1.4,
    padding: "0 8px",
  },
  btnRegenerarModal: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    backgroundColor: IFPE.primaryLight,
    border: `1px solid ${IFPE.primaryBorder}`,
    padding: "10px 16px",
    borderRadius: 12,
    marginBottom: 12,
    cursor: "pointer",
  },
  btnRegenerarModalTexto: {
    color: IFPE.primary,
    fontSize: 13,
    fontWeight: 700,
  },
  btnModalQrFechar: {
    width: "100%",
    backgroundColor: IFPE.primaryDark,
    padding: "13px 0",
    borderRadius: 14,
    border: "none",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },

  spinner: {
    width: 28,
    height: 28,
    border: "3px solid #e2e8f0",
    borderTop: `3px solid ${IFPE.primary}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  spinnerLarge: {
    width: 40,
    height: 40,
    border: "3px solid #e2e8f0",
    borderTop: `3px solid ${IFPE.primary}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  spinnerSmall: {
    width: 16,
    height: 16,
    border: `2px solid ${IFPE.primaryBorder}`,
    borderTop: `2px solid ${IFPE.primary}`,
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};