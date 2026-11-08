import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoCube,
  IoBarcodeOutline,
  IoLocationOutline,
  IoPersonOutline,
  IoBusinessOutline,
  IoChevronDown,
  IoSwapHorizontal,
  IoCheckmarkCircle,
  IoLocation,
  IoPerson,
  IoSend,
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

export default function MovimentacaoFormScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { material, patrimonio, patrimonios } = location.state || {};

  const { usuario } = useAuth();
  const isAdm = usuario?.role === "ROLE_ADM";
  const usuarioIdAtual =
    usuario?.id ||
    usuario?.usuarioId ||
    usuario?.idUsuario ||
    usuario?.userId ||
    null;

  const [locais, setLocais] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [localSelecionado, setLocalSelecionado] = useState(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(usuario || null);
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLocais, setLoadingLocais] = useState(true);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUsuarioVisible, setModalUsuarioVisible] = useState(false);
  const [focoObs, setFocoObs] = useState(false);

  const [toast, setToast] = useState({
    visivel: false,
    tipo: "info",
    mensagem: "",
  });

  const mostrarToast = (mensagem, tipo = "erro") =>
    setToast({ visivel: true, tipo, mensagem });

  useEffect(() => {
    carregarLocais();
    if (isAdm) {
      carregarUsuarios();
    } else {
      setLoadingUsuarios(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (usuario) {
      setUsuarioSelecionado({ ...usuario, id: usuarioIdAtual || usuario.id });
    }
  }, [usuario, usuarioIdAtual]);

  const carregarUsuarios = async () => {
    try {
      const response = await api.get("/usuario");
      const usuariosDisponiveis = (response.data || [])
        .filter((item) => item.role !== "ROLE_ADM")
        .map((item) => ({
          ...item,
          id: item.id || item.usuarioId || item.idUsuario || item.userId,
        }));
      setUsuarios(usuariosDisponiveis);
    } catch {
      mostrarToast("Não foi possível carregar os usuários.", "erro");
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const carregarLocais = async () => {
    try {
      const response = await api.get("/local");
      const refPat = patrimonio || (patrimonios && patrimonios[0]);
      const localAtualId = refPat ? refPat.local?.id : material?.local?.id;
      const locaisDisponiveis = (response.data || []).filter(
        (l) => l.id !== localAtualId
      );
      setLocais(locaisDisponiveis);
    } catch {
      mostrarToast("Não foi possível carregar os locais.", "erro");
    } finally {
      setLoadingLocais(false);
    }
  };

  const handleSolicitar = async () => {
    if (!localSelecionado) {
      mostrarToast("Selecione o local de destino.", "aviso");
      return;
    }
    if (isAdm && !usuarioSelecionado) {
      mostrarToast("Selecione o usuário responsável.", "aviso");
      return;
    }

    const listaPatrimonios =
      patrimonios && patrimonios.length > 0
        ? patrimonios
        : patrimonio
        ? [patrimonio]
        : material?.patrimonios?.[0]
        ? [material.patrimonios[0]]
        : [];

    if (listaPatrimonios.length === 0) {
      mostrarToast(
        "Nenhum patrimônio identificado para transferir. Volte e selecione um item.",
        "erro"
      );
      return;
    }

    const endpoint = "/movimentacao";

    setLoading(true);
    try {
      await Promise.all(
        listaPatrimonios.map((pat) =>
          api.post(endpoint, {
            patrimonioId: pat.id,
            localDestinoId: localSelecionado.id,
            observacao: observacao?.trim() || null,
          })
        )
      );

      mostrarToast(
        isAdm
          ? listaPatrimonios.length > 1
            ? `${listaPatrimonios.length} transferência(s) confirmada(s)!`
            : "Transferência confirmada com sucesso!"
          : listaPatrimonios.length > 1
          ? `${listaPatrimonios.length} solicitação(ões) enviada(s)! Aguardando aprovação.`
          : "Solicitação enviada! Aguardando aprovação do administrador.",
        "sucesso"
      );
      setTimeout(() => navigate("/materiais"), 1500);
    } catch (error) {
      const status = error.response?.status;
      const msgBack = error.response?.data?.message;

      if (status === 401) {
        mostrarToast("Sessão expirada. Faça login novamente.", "erro");
      } else if (status === 403) {
        mostrarToast(
          msgBack ||
            "Sem permissão. Confirme no backend se o colaborador pode solicitar transferência.",
          "erro"
        );
      } else if (status === 400) {
        mostrarToast(
          msgBack ||
            "Dados inválidos. Verifique patrimônio e local de destino.",
          "erro"
        );
      } else {
        mostrarToast(
          msgBack ||
            (isAdm
              ? "Erro ao confirmar transferência."
              : "Erro ao enviar solicitação de transferência."),
          "erro"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const renderModal = (
    visivel,
    setVisivel,
    dados,
    selecionado,
    setSelecionado,
    titulo,
    IconHeader
  ) => {
    if (!visivel) return null;

    return (
      <div style={styles.modalOverlay} onClick={() => setVisivel(false)}>
        <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHandle} />

          <div style={styles.modalHeader}>
            <div style={styles.modalHeaderIconBox}>
              <IconHeader size={18} color={IFPE.primary} />
            </div>
            <h3 style={styles.modalTitulo}>{titulo}</h3>
          </div>

          <div style={styles.modalLista}>
            {dados.length === 0 ? (
              <p style={styles.modalVazio}>Nenhum item disponível.</p>
            ) : (
              dados.map((item) => {
                const isSelected = selecionado?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    style={{
                      ...styles.modalItem,
                      ...(isSelected ? styles.modalItemSelected : {}),
                    }}
                    onClick={() => {
                      setSelecionado(item);
                      setVisivel(false);
                    }}
                  >
                    <span
                      style={{
                        ...styles.modalItemText,
                        ...(isSelected ? styles.modalItemTextSelected : {}),
                      }}
                    >
                      {item.nome}
                    </span>
                    {isSelected && (
                      <IoCheckmarkCircle size={18} color={IFPE.primary} />
                    )}
                  </button>
                );
              })
            )}
          </div>

          <button
            type="button"
            style={styles.modalFechar}
            onClick={() => setVisivel(false)}
          >
            Fechar
          </button>
        </div>
      </div>
    );
  };

  const localAtualNome = patrimonio
    ? patrimonio.local?.nome || "Não definido"
    : patrimonios && patrimonios.length > 0
    ? patrimonios[0].local?.nome || "Não definido"
    : material?.local?.nome || "Não definido";

  const textoBotao = isAdm
    ? "CONFIRMAR TRANSFERÊNCIA"
    : "SOLICITAR TRANSFERÊNCIA";

  const tagCard =
    patrimonios && patrimonios.length > 0
      ? isAdm
        ? "TRANSFERÊNCIA EM LOTE"
        : "SOLICITAÇÃO EM LOTE"
      : isAdm
      ? "TRANSFERÊNCIA"
      : "SOLICITAÇÃO DE TRANSFERÊNCIA";

  return (
    <div style={styles.page}>
      <Toast
        visivel={toast.visivel}
        tipo={toast.tipo}
        mensagem={toast.mensagem}
        onClose={() => setToast((t) => ({ ...t, visivel: false }))}
      />

      <div style={styles.container}>
        <div style={styles.materialCard}>
          <div style={styles.materialTagRow}>
            <IoCube size={14} color={IFPE.primary} />
            <span style={styles.materialLabel}>{tagCard}</span>
          </div>

          <h2 style={styles.materialNome}>{material?.nome || "Material"}</h2>

          {patrimonios && patrimonios.length > 0 ? (
            <div style={styles.patrimoniosChipsContainer}>
              {patrimonios.map((p) => (
                <div key={p.id} style={styles.patrimonioChip}>
                  <IoBarcodeOutline size={12} color={IFPE.primary} />
                  <span style={styles.patrimonioChipText}>
                    {p.codigoPatrimonio}
                  </span>
                </div>
              ))}
            </div>
          ) : patrimonio ? (
            <div style={styles.patrimonioChip}>
              <IoBarcodeOutline size={12} color={IFPE.primary} />
              <span style={styles.patrimonioChipText}>
                {patrimonio.codigoPatrimonio}
              </span>
            </div>
          ) : null}

          <div style={styles.origemRow}>
            <IoLocationOutline size={14} color="#64748b" />
            <span style={styles.origemText}>
              Local atual: <strong style={styles.bold}>{localAtualNome}</strong>
            </span>
          </div>

          {!isAdm && (
            <p style={styles.avisoColab}>
              Sua solicitação ficará pendente até a aprovação de um
              administrador.
            </p>
          )}
        </div>

        <div style={styles.formCard}>
          {isAdm && (
            <>
              <label style={styles.label}>SOLICITANTE RESPONSÁVEL *</label>
              {loadingUsuarios ? (
                <div style={styles.loadingRow}>
                  <div style={styles.spinnerSmall} />
                </div>
              ) : (
                <button
                  type="button"
                  style={styles.selector}
                  onClick={() => setModalUsuarioVisible(true)}
                >
                  <div style={styles.selectorLeft}>
                    <IoPersonOutline
                      size={18}
                      color={IFPE.primary}
                      style={{ marginRight: 10 }}
                    />
                    <span
                      style={
                        usuarioSelecionado
                          ? styles.selectorText
                          : styles.selectorPlaceholder
                      }
                    >
                      {usuarioSelecionado
                        ? usuarioSelecionado.nome
                        : "Selecionar colaborador..."}
                    </span>
                  </div>
                  <IoChevronDown size={18} color="#94a3b8" />
                </button>
              )}
            </>
          )}

          <label style={styles.label}>NOVO LOCAL DE DESTINO *</label>
          {loadingLocais ? (
            <div style={styles.loadingRow}>
              <div style={styles.spinnerSmall} />
            </div>
          ) : (
            <button
              type="button"
              style={styles.selector}
              onClick={() => setModalVisible(true)}
            >
              <div style={styles.selectorLeft}>
                <IoBusinessOutline
                  size={18}
                  color={IFPE.primary}
                  style={{ marginRight: 10 }}
                />
                <span
                  style={
                    localSelecionado
                      ? styles.selectorText
                      : styles.selectorPlaceholder
                  }
                >
                  {localSelecionado
                    ? localSelecionado.nome
                    : "Selecionar destino..."}
                </span>
              </div>
              <IoChevronDown size={18} color="#94a3b8" />
            </button>
          )}

          <label style={styles.label}>
            JUSTIFICATIVA / OBSERVAÇÃO (OPCIONAL)
          </label>
          <div
            style={{
              ...styles.inputWrapperMultiline,
              ...(focoObs ? styles.inputWrapperFocado : {}),
            }}
          >
            <textarea
              style={styles.inputMultiline}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              onFocus={() => setFocoObs(true)}
              onBlur={() => setFocoObs(false)}
              placeholder="Ex: Mudança de sala para alocação de nova equipe..."
              rows={3}
            />
          </div>

          <button
            type="button"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            onClick={handleSolicitar}
            disabled={loading}
          >
            {loading ? (
              <div style={styles.spinner} />
            ) : (
              <div style={styles.buttonContent}>
                {isAdm ? (
                  <IoSwapHorizontal size={19} color="#fff" />
                ) : (
                  <IoSend size={17} color="#fff" />
                )}
                <span style={styles.buttonText}>{textoBotao}</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {renderModal(
        modalVisible,
        setModalVisible,
        locais,
        localSelecionado,
        setLocalSelecionado,
        "Selecionar Local de Destino",
        IoLocation
      )}
      {renderModal(
        modalUsuarioVisible,
        setModalUsuarioVisible,
        usuarios,
        usuarioSelecionado,
        setUsuarioSelecionado,
        "Selecionar Colaborador",
        IoPerson
      )}
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
  materialCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 10px rgba(15, 23, 42, 0.05)",
  },
  materialTagRow: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  materialLabel: {
    fontSize: 11,
    color: IFPE.primary,
    fontWeight: 800,
    letterSpacing: 0.6,
  },
  materialNome: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  patrimoniosChipsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  patrimonioChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    backgroundColor: IFPE.primaryLight,
    padding: "3px 8px",
    borderRadius: 8,
    border: `1px solid ${IFPE.primaryBorder}`,
    marginBottom: 8,
  },
  patrimonioChipText: {
    fontSize: 11.5,
    fontWeight: 700,
    color: IFPE.primaryText,
  },
  origemRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    borderTop: "1px solid #f1f5f9",
  },
  origemText: {
    fontSize: 13,
    color: "#64748b",
  },
  bold: {
    fontWeight: 700,
    color: "#0f172a",
  },
  avisoColab: {
    margin: "12px 0 0 0",
    fontSize: 12,
    color: IFPE.primaryDark,
    backgroundColor: IFPE.primaryLight,
    border: `1px solid ${IFPE.primaryBorder}`,
    borderRadius: 10,
    padding: "10px 12px",
    lineHeight: 1.4,
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
    marginBottom: 6,
    marginTop: 10,
    letterSpacing: 0.6,
  },
  selector: {
    width: "100%",
    backgroundColor: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 14,
    padding: "0 14px",
    height: 48,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    cursor: "pointer",
    textAlign: "left",
  },
  selectorLeft: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  selectorText: {
    fontSize: 14.5,
    color: "#0f172a",
    fontWeight: 600,
  },
  selectorPlaceholder: {
    fontSize: 14,
    color: "#94a3b8",
  },
  inputWrapperMultiline: {
    backgroundColor: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
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
    minHeight: 72,
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.4,
  },
  button: {
    width: "100%",
    backgroundColor: IFPE.primary,
    borderRadius: 14,
    height: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(21, 128, 61, 0.3)",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
  buttonContent: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 0.4,
  },
  loadingRow: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 16,
  },
  spinner: {
    width: 20,
    height: 20,
    border: "2.5px solid rgba(255,255,255,0.3)",
    borderTop: "2.5px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  spinnerSmall: {
    width: 22,
    height: 22,
    border: "2.5px solid #e2e8f0",
    borderTop: `2.5px solid ${IFPE.primary}`,
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: "12px 20px 28px",
    width: "100%",
    maxWidth: 520,
    maxHeight: "75vh",
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
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottom: "1px solid #f1f5f9",
  },
  modalHeaderIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: IFPE.primaryLight,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  modalTitulo: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
  },
  modalLista: {
    overflowY: "auto",
    flex: 1,
  },
  modalItem: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 12px",
    borderRadius: 12,
    marginBottom: 4,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  modalItemSelected: {
    backgroundColor: IFPE.primaryLight,
  },
  modalItemText: {
    fontSize: 14.5,
    color: "#334155",
    fontWeight: 500,
  },
  modalItemTextSelected: {
    color: IFPE.primary,
    fontWeight: 700,
  },
  modalVazio: {
    textAlign: "center",
    color: "#94a3b8",
    padding: "20px 0",
    fontSize: 13,
    margin: 0,
  },
  modalFechar: {
    marginTop: 14,
    padding: "12px 0",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    border: "none",
    color: "#475569",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
};