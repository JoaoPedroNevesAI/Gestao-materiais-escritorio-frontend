import React, { useState, useEffect } from "react";
import {
  IoSwapHorizontal,
  IoConstruct,
  IoBarcodeOutline,
  IoArrowForward,
  IoPersonOutline,
  IoClose,
  IoCheckmark,
  IoCalendarOutline,
  IoCheckmarkDoneCircleOutline,
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

export default function SolicitacoesPendentesScreen() {
  const [abaAtiva, setAbaAtiva] = useState("transferencias");
  const [transferencias, setTransferencias] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [acao, setAcao] = useState(null);
  const [observacaoAdmin, setObservacaoAdmin] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState({
    visivel: false,
    tipo: "info",
    mensagem: "",
  });

  const mostrarToast = (mensagem, tipo = "erro") =>
    setToast({ visivel: true, tipo, mensagem });

  useEffect(() => {
    carregarTodas();
  }, []);

  const carregarTodas = async () => {
    setLoading(true);
    try {
      const [resTransf, resManut] = await Promise.all([
        api.get("/movimentacao/pendentes"),
        api.get("/manutencao/pendentes"),
      ]);
      setTransferencias(resTransf.data || []);
      setManutencoes(resManut.data || []);
    } catch {
      mostrarToast("Não foi possível carregar as solicitações.", "erro");
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (item, tipoAcao) => {
    setItemSelecionado(item);
    setAcao(tipoAcao);
    setObservacaoAdmin("");
    setModalVisible(true);
  };

  const confirmarAcao = async () => {
    setSalvando(true);
    try {
      const endpoint =
        abaAtiva === "transferencias"
          ? `/movimentacao/${itemSelecionado.id}/${acao}`
          : `/manutencao/${itemSelecionado.id}/${acao}`;

      await api.put(endpoint, { observacaoAdmin });

      setModalVisible(false);
      mostrarToast(
        acao === "aprovar"
          ? "Solicitação aprovada com sucesso!"
          : "Solicitação reprovada.",
        acao === "aprovar" ? "sucesso" : "aviso"
      );
      carregarTodas();
    } catch {
      mostrarToast("Erro ao processar solicitação.", "erro");
    } finally {
      setSalvando(false);
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

  const dadosAtivos =
    abaAtiva === "transferencias" ? transferencias : manutencoes;

  return (
    <div style={styles.container}>
      <Toast
        visivel={toast.visivel}
        tipo={toast.tipo}
        mensagem={toast.mensagem}
        onClose={() => setToast((t) => ({ ...t, visivel: false }))}
      />

      <div style={styles.tabContainer}>
        <div style={styles.segmentedWrapper}>
          <button
            type="button"
            style={{
              ...styles.segmentedBtn,
              ...(abaAtiva === "transferencias"
                ? styles.segmentedBtnAtivo
                : {}),
            }}
            onClick={() => setAbaAtiva("transferencias")}
          >
            <IoSwapHorizontal
              size={16}
              color={abaAtiva === "transferencias" ? IFPE.primary : "#64748b"}
            />
            <span
              style={{
                ...styles.segmentedBtnTexto,
                ...(abaAtiva === "transferencias"
                  ? styles.segmentedBtnTextoAtivo
                  : {}),
              }}
            >
              Transferências
            </span>
            {transferencias.length > 0 && (
              <span
                style={{
                  ...styles.contadorPill,
                  ...(abaAtiva === "transferencias"
                    ? styles.contadorPillAtivo
                    : {}),
                }}
              >
                <span
                  style={{
                    ...styles.contadorPillTexto,
                    ...(abaAtiva === "transferencias"
                      ? styles.contadorPillTextoAtivo
                      : {}),
                  }}
                >
                  {transferencias.length}
                </span>
              </span>
            )}
          </button>

          <button
            type="button"
            style={{
              ...styles.segmentedBtn,
              ...(abaAtiva === "manutencoes" ? styles.segmentedBtnAtivo : {}),
            }}
            onClick={() => setAbaAtiva("manutencoes")}
          >
            <IoConstruct
              size={16}
              color={abaAtiva === "manutencoes" ? IFPE.primary : "#64748b"}
            />
            <span
              style={{
                ...styles.segmentedBtnTexto,
                ...(abaAtiva === "manutencoes"
                  ? styles.segmentedBtnTextoAtivo
                  : {}),
              }}
            >
              Manutenções
            </span>
            {manutencoes.length > 0 && (
              <span
                style={{
                  ...styles.contadorPill,
                  ...(abaAtiva === "manutencoes"
                    ? styles.contadorPillAtivo
                    : {}),
                }}
              >
                <span
                  style={{
                    ...styles.contadorPillTexto,
                    ...(abaAtiva === "manutencoes"
                      ? styles.contadorPillTextoAtivo
                      : {}),
                  }}
                >
                  {manutencoes.length}
                </span>
              </span>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={styles.centerContainer}>
          <div style={styles.spinner} />
          <span style={styles.loadingText}>Carregando solicitações...</span>
        </div>
      ) : dadosAtivos.length === 0 ? (
        <div style={styles.vazioContainer}>
          <div style={styles.vazioIcone}>
            <IoCheckmarkDoneCircleOutline size={36} color="#94a3b8" />
          </div>
          <h3 style={styles.vazioTitulo}>Tudo em dia!</h3>
          <p style={styles.vazioSub}>
            Nenhuma solicitação de {abaAtiva} aguardando aprovação no momento.
          </p>
        </div>
      ) : (
        <div style={styles.lista}>
          {dadosAtivos.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardMaterialNome}>
                    {item.patrimonio?.material?.nome ||
                      item.patrimonio?.nome ||
                      "Item"}
                  </h3>
                  <div style={styles.badgePatrimonio}>
                    <IoBarcodeOutline size={12} color={IFPE.primary} />
                    <span style={styles.badgePatrimonioTexto}>
                      {item.patrimonio?.codigoPatrimonio ||
                        "PAT-" + item.patrimonio?.id}
                    </span>
                  </div>
                </div>
              </div>

              {abaAtiva === "transferencias" && (
                <div style={styles.rotaBox}>
                  <div style={styles.rotaItem}>
                    <span style={styles.rotaLabel}>DE</span>
                    <span style={styles.rotaNome}>
                      {item.localOrigem?.nome || "Origem"}
                    </span>
                  </div>
                  <IoArrowForward size={18} color="#94a3b8" />
                  <div style={styles.rotaItem}>
                    <span style={styles.rotaLabel}>PARA</span>
                    <span style={styles.rotaNome}>
                      {item.localDestino?.nome || "Destino"}
                    </span>
                  </div>
                </div>
              )}

              <div style={styles.solicitanteRow}>
                <IoPersonOutline size={14} color="#64748b" />
                <span style={styles.solicitanteTexto}>
                  Solicitado por: {item.solicitante?.nome || "Colaborador"}
                </span>
              </div>

              {abaAtiva === "manutencoes" && (
                <div style={styles.solicitanteRow}>
                  <IoCalendarOutline size={14} color="#64748b" />
                  <span style={styles.solicitanteTexto}>
                    Data: {formatarData(item.dataSolicitacao)}
                  </span>
                </div>
              )}

              {abaAtiva === "transferencias" && item.observacao && (
                <div style={styles.obsBox}>
                  <p style={styles.obsTexto}>"{item.observacao}"</p>
                </div>
              )}

              {abaAtiva === "manutencoes" && (
                <div style={styles.defeitoBox}>
                  <span style={styles.defeitoLabel}>Defeito relatado:</span>
                  <p style={styles.defeitoTexto}>"{item.descricao}"</p>
                </div>
              )}

              <div style={styles.cardAcoes}>
                <button
                  type="button"
                  style={{ ...styles.btnAcao, ...styles.btnReprovar }}
                  onClick={() => abrirModal(item, "reprovar")}
                >
                  <IoClose size={16} color="#dc2626" />
                  <span style={{ color: "#dc2626", fontWeight: 600 }}>
                    Reprovar
                  </span>
                </button>

                <button
                  type="button"
                  style={{ ...styles.btnAcao, ...styles.btnAprovar }}
                  onClick={() => abrirModal(item, "aprovar")}
                >
                  <IoCheckmark size={16} color="#ffffff" />
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>
                    Aprovar
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalVisible && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHandle} />
            <h2 style={styles.modalTitulo}>
              {acao === "aprovar"
                ? "Aprovar solicitação"
                : "Reprovar solicitação"}
            </h2>
            <p style={styles.modalDesc}>
              {itemSelecionado?.patrimonio?.material?.nome ||
                itemSelecionado?.patrimonio?.nome ||
                "Item selecionado"}{" "}
              (
              {itemSelecionado?.patrimonio?.codigoPatrimonio ||
                "PAT-" + itemSelecionado?.patrimonio?.id}
              )
            </p>

            <label style={styles.labelInput}>
              Observação do Administrador (opcional)
            </label>
            <textarea
              style={styles.modalInputMultiline}
              value={observacaoAdmin}
              onChange={(e) => setObservacaoAdmin(e.target.value)}
              placeholder="Digite um parecer ou instrução..."
              rows={3}
            />

            <div style={styles.modalAcoes}>
              <button
                type="button"
                style={styles.modalBtnCancelar}
                onClick={() => setModalVisible(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                style={{
                  ...styles.modalBtnConfirmar,
                  ...(acao === "aprovar"
                    ? styles.btnAprovarFull
                    : styles.btnReprovarFull),
                }}
                onClick={confirmarAcao}
                disabled={salvando}
              >
                {salvando
                  ? "Processando..."
                  : acao === "aprovar"
                  ? "Confirmar Aprovação"
                  : "Confirmar Reprovação"}
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
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "sans-serif",
    boxSizing: "border-box",
  },
  tabContainer: {
    backgroundColor: "#ffffff",
    padding: "10px 16px",
    borderBottom: "1px solid #e2e8f0",
  },
  segmentedWrapper: {
    display: "flex",
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    padding: 4,
    gap: 4,
    maxWidth: 500,
    margin: "0 auto",
  },
  segmentedBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "9px 0",
    borderRadius: 10,
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
  segmentedBtnAtivo: {
    backgroundColor: "#ffffff",
    boxShadow: "0px 1px 3px rgba(15, 23, 42, 0.08)",
  },
  segmentedBtnTexto: {
    fontSize: 13,
    fontWeight: 600,
    color: "#64748b",
  },
  segmentedBtnTextoAtivo: {
    color: IFPE.primary,
    fontWeight: 700,
  },
  contadorPill: {
    backgroundColor: "#e2e8f0",
    padding: "1px 6px",
    borderRadius: 10,
  },
  contadorPillAtivo: {
    backgroundColor: IFPE.primaryLight,
  },
  contadorPillTexto: {
    fontSize: 11,
    fontWeight: 700,
    color: "#475569",
  },
  contadorPillTextoAtivo: {
    color: IFPE.primary,
  },
  centerContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 0",
    gap: 12,
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid #e2e8f0",
    borderTop: `3px solid ${IFPE.primary}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: 500,
  },
  lista: {
    padding: 16,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 12,
    maxWidth: 1200,
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    border: "1px solid #e2e8f0",
    boxShadow: "0px 1px 6px rgba(15, 23, 42, 0.04)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardMaterialNome: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
  badgePatrimonio: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    backgroundColor: IFPE.primaryLight,
    border: `1px solid ${IFPE.primaryBorder}`,
    padding: "3px 8px",
    borderRadius: 6,
    marginTop: 4,
  },
  badgePatrimonioTexto: {
    fontSize: 11,
    fontWeight: 700,
    color: IFPE.primary,
  },
  rotaBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #f1f5f9",
  },
  rotaItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  rotaLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: 700,
    letterSpacing: 0.4,
  },
  rotaNome: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0f172a",
    marginTop: 2,
    textAlign: "center",
  },
  solicitanteRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  solicitanteTexto: {
    fontSize: 13,
    color: "#64748b",
  },
  obsBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
    borderLeft: `3px solid ${IFPE.primary}`,
  },
  obsTexto: {
    fontSize: 12,
    color: "#475569",
    fontStyle: "italic",
    margin: 0,
  },
  defeitoBox: {
    backgroundColor: "#fffbeb",
    borderRadius: 10,
    padding: 12,
    border: "1px solid #fde68a",
  },
  defeitoLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#b45309",
    textTransform: "uppercase",
  },
  defeitoTexto: {
    fontSize: 13,
    color: "#78350f",
    marginTop: 3,
    fontStyle: "italic",
    margin: 0,
  },
  cardAcoes: {
    display: "flex",
    gap: 10,
    marginTop: 4,
  },
  btnAcao: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "11px 0",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
  },
  btnReprovar: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
  },
  btnAprovar: {
    backgroundColor: IFPE.primary,
  },
  btnAprovarFull: {
    backgroundColor: IFPE.primary,
    color: "#ffffff",
  },
  btnReprovarFull: {
    backgroundColor: "#dc2626",
    color: "#ffffff",
  },
  vazioContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 60,
    padding: "0 32px",
  },
  vazioIcone: {
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
    textAlign: "center",
    margin: 0,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 480,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#cbd5e1",
    borderRadius: 2,
    margin: "0 auto 16px",
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 4px 0",
  },
  modalDesc: {
    fontSize: 13,
    color: "#64748b",
    margin: "0 0 16px 0",
  },
  labelInput: {
    fontSize: 12,
    fontWeight: 700,
    color: "#475569",
    marginBottom: 8,
    display: "block",
    textTransform: "uppercase",
  },
  modalInputMultiline: {
    width: "100%",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#0f172a",
    marginBottom: 20,
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "inherit",
  },
  modalAcoes: {
    display: "flex",
    gap: 12,
  },
  modalBtnCancelar: {
    flex: 1,
    padding: "14px 0",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    border: "none",
    color: "#475569",
    fontWeight: 600,
    cursor: "pointer",
  },
  modalBtnConfirmar: {
    flex: 1.5,
    padding: "14px 0",
    borderRadius: 12,
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
  },
};