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

export default function SolicitacoesPendentesScreen() {
  const [abaAtiva, setAbaAtiva] = useState("transferencias"); // 'transferencias' | 'manutencoes'
  const [transferencias, setTransferencias] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [acao, setAcao] = useState(null); // 'aprovar' | 'reprovar'
  const [observacaoAdmin, setObservacaoAdmin] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState({ visivel: false, tipo: "info", mensagem: "" });

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

  const dadosAtivos = abaAtiva === "transferencias" ? transferencias : manutencoes;

  return (
    <div style={styles.container}>
      <Toast
        visivel={toast.visivel}
        tipo={toast.tipo}
        mensagem={toast.mensagem}
        onClose={() => setToast((t) => ({ ...t, visivel: false }))}
      />

      {/* Segmented Control de Abas */}
      <div style={styles.tabContainer}>
        <div style={styles.segmentedWrapper}>
          <button
            type="button"
            style={{
              ...styles.segmentedBtn,
              ...(abaAtiva === "transferencias" ? styles.segmentedBtnAtivo : {}),
            }}
            onClick={() => setAbaAtiva("transferencias")}
          >
            <IoSwapHorizontal
              size={16}
              color={abaAtiva === "transferencias" ? "#2563eb" : "#64748b"}
            />
            <span
              style={{
                ...styles.segmentedBtnTexto,
                ...(abaAtiva === "transferencias" ? styles.segmentedBtnTextoAtivo : {}),
              }}
            >
              Transferências
            </span>
            {transferencias.length > 0 && (
              <span
                style={{
                  ...styles.contadorPill,
                  ...(abaAtiva === "transferencias" ? styles.contadorPillAtivo : {}),
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
              color={abaAtiva === "manutencoes" ? "#2563eb" : "#64748b"}
            />
            <span
              style={{
                ...styles.segmentedBtnTexto,
                ...(abaAtiva === "manutencoes" ? styles.segmentedBtnTextoAtivo : {}),
              }}
            >
              Manutenções
            </span>
            {manutencoes.length > 0 && (
              <span
                style={{
                  ...styles.contadorPill,
                  ...(abaAtiva === "manutencoes" ? styles.contadorPillAtivo : {}),
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

      {/* Lista de Solicitações */}
      {loading ? (
        <div style={styles.centerContainer}>
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
                    <IoBarcodeOutline size={12} color="#2563eb" />
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
                  <span style={{ color: "#dc2626", fontWeight: 600 }}>Reprovar</span>
                </button>

                <button
                  type="button"
                  style={{ ...styles.btnAcao, ...styles.btnAprovar }}
                  onClick={() => abrirModal(item, "aprovar")}
                >
                  <IoCheckmark size={16} color="#ffffff" />
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>Aprovar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação */}
      {modalVisible && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHandle} />
            <h2 style={styles.modalTitulo}>
              {acao === "aprovar" ? "Aprovar solicitação" : "Reprovar solicitação"}
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
    borderRadius: "14px",
    padding: "4px",
    gap: "4px",
    maxWidth: "500px",
    margin: "0 auto",
  },
  segmentedBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "9px 0",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
  segmentedBtnAtivo: {
    backgroundColor: "#ffffff",
    boxShadow: "0px 1px 3px rgba(15, 23, 42, 0.08)",
  },
  segmentedBtnTexto: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
  },
  segmentedBtnTextoAtivo: {
    color: "#2563eb",
    fontWeight: "700",
  },
  contadorPill: {
    backgroundColor: "#e2e8f0",
    padding: "1px 6px",
    borderRadius: "10px",
  },
  contadorPillAtivo: {
    backgroundColor: "#eff6ff",
  },
  contadorPillTexto: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#475569",
  },
  contadorPillTextoAtivo: {
    color: "#2563eb",
  },
  centerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 0",
  },
  loadingText: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "500",
  },
  lista: {
    padding: "16px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "12px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0px 1px 6px rgba(15, 23, 42, 0.04)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardMaterialNome: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  badgePatrimonio: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    padding: "3px 8px",
    borderRadius: "6px",
    marginTop: "4px",
  },
  badgePatrimonioTexto: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#2563eb",
  },
  rotaBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #f1f5f9",
  },
  rotaItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  rotaLabel: {
    fontSize: "10px",
    color: "#94a3b8",
    fontWeight: "700",
    letterSpacing: "0.4px",
  },
  rotaNome: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0f172a",
    marginTop: "2px",
    textAlign: "center",
  },
  solicitanteRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  solicitanteTexto: {
    fontSize: "13px",
    color: "#64748b",
  },
  obsBox: {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "10px",
    borderLeft: "3px solid #2563eb",
  },
  obsTexto: {
    fontSize: "12px",
    color: "#475569",
    fontStyle: "italic",
    margin: 0,
  },
  defeitoBox: {
    backgroundColor: "#fffbeb",
    borderRadius: "10px",
    padding: "12px",
    border: "1px solid #fde68a",
  },
  defeitoLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#b45309",
    textTransform: "uppercase",
  },
  defeitoTexto: {
    fontSize: "13px",
    color: "#78350f",
    marginTop: "3px",
    fontStyle: "italic",
    margin: 0,
  },
  cardAcoes: {
    display: "flex",
    gap: "10px",
    marginTop: "4px",
  },
  btnAcao: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "11px 0",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
  },
  btnReprovar: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
  },
  btnAprovar: {
    backgroundColor: "#2563eb",
  },
  btnAprovarFull: {
    backgroundColor: "#2563eb",
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
    marginTop: "60px",
    padding: "0 32px",
  },
  vazioIcone: {
    width: "80px",
    height: "80px",
    borderRadius: "40px",
    backgroundColor: "#f1f5f9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "16px",
  },
  vazioTitulo: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 6px 0",
  },
  vazioSub: {
    fontSize: "13px",
    color: "#94a3b8",
    textAlign: "center",
    margin: 0,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    width: "90%",
    maxWidth: "480px",
  },
  modalHandle: {
    width: "36px",
    height: "4px",
    backgroundColor: "#cbd5e1",
    borderRadius: "2px",
    margin: "0 auto 16px auto",
  },
  modalTitulo: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 4px 0",
  },
  modalDesc: {
    fontSize: "13px",
    color: "#64748b",
    margin: "0 0 16px 0",
  },
  labelInput: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#475569",
    marginBottom: "8px",
    display: "block",
    textTransform: "uppercase",
  },
  modalInputMultiline: {
    width: "100%",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px",
    fontSize: "14px",
    color: "#0f172a",
    marginBottom: "20px",
    boxSizing: "border-box",
    resize: "vertical",
  },
  modalAcoes: {
    display: "flex",
    gap: "12px",
  },
  modalBtnCancelar: {
    flex: 1,
    padding: "14px 0",
    backgroundColor: "#f1f5f9",
    borderRadius: "12px",
    border: "none",
    color: "#475569",
    fontWeight: "600",
    cursor: "pointer",
  },
  modalBtnConfirmar: {
    flex: 1.5,
    padding: "14px 0",
    borderRadius: "12px",
    border: "none",
    fontWeight: "700",
    cursor: "pointer",
  },
};