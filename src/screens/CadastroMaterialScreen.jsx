import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoCamera,
  IoCameraOutline,
  IoTrashOutline,
  IoCubeOutline,
  IoRemove,
  IoAdd,
  IoPricetagOutline,
  IoLocationOutline,
  IoChevronDown,
  IoCheckmarkCircle,
  IoCheckmarkCircleOutline,
  IoSaveOutline,
  IoPricetag,
  IoLocation,
  IoAddCircleOutline,
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

export default function CadastroMaterialScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const materialEdicao = location.state?.material || null;
  const modoEdicao = !!materialEdicao;

  const [nome, setNome] = useState(materialEdicao?.nome || "");
  const [imagemUri, setImagemUri] = useState(materialEdicao?.imagem || "");
  const [imagemFile, setImagemFile] = useState(null);
  const [quantidade, setQuantidade] = useState(
    materialEdicao?.quantidade ? String(materialEdicao.quantidade) : "1"
  );
  const [loading, setLoading] = useState(false);
  const [camposFocados, setCamposFocados] = useState({});

  const [categorias, setCategorias] = useState([]);
  const [locais, setLocais] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(
    materialEdicao?.categoria || null
  );
  const [localSelecionado, setLocalSelecionado] = useState(
    materialEdicao?.local || null
  );

  const [modalCat, setModalCat] = useState(false);
  const [modalLoc, setModalLoc] = useState(false);

  // Criar categoria / local
  const [novoNomeCat, setNovoNomeCat] = useState("");
  const [novoNomeLoc, setNovoNomeLoc] = useState("");
  const [salvandoCat, setSalvandoCat] = useState(false);
  const [salvandoLoc, setSalvandoLoc] = useState(false);

  const [toast, setToast] = useState({
    visivel: false,
    tipo: "info",
    mensagem: "",
  });

  const fileInputRef = useRef(null);

  const mostrarToast = (mensagem, tipo = "erro") =>
    setToast({ visivel: true, tipo, mensagem });

  const BASE_URL = (api.defaults.baseURL || "").replace("/api", "");

  const imagemPreviewUri = imagemUri
    ? imagemUri.startsWith("http") ||
      imagemUri.startsWith("blob:") ||
      imagemUri.startsWith("data:")
      ? imagemUri
      : `${BASE_URL}/imagens/${encodeURIComponent(imagemUri)}`
    : null;

  useEffect(() => {
    carregarOpcoes();
  }, []);

  const carregarOpcoes = async () => {
    try {
      const [resCat, resLoc] = await Promise.all([
        api.get("/categoria"),
        api.get("/local"),
      ]);
      setCategorias(resCat.data || []);
      setLocais(resLoc.data || []);
    } catch {
      mostrarToast("Não foi possível carregar categorias e locais.", "erro");
    }
  };

  const criarCategoria = async () => {
    const nomeCat = novoNomeCat.trim();
    if (!nomeCat) {
      mostrarToast("Informe o nome da categoria.", "aviso");
      return;
    }
    setSalvandoCat(true);
    try {
      const { data } = await api.post("/categoria", { nome: nomeCat });
      const criada = data || { id: data?.id, nome: nomeCat };
      setCategorias((prev) => [...prev, criada]);
      setCategoriaSelecionada(criada);
      setNovoNomeCat("");
      mostrarToast("Categoria criada!", "sucesso");
      setModalCat(false);
    } catch (error) {
      mostrarToast(
        error.response?.data?.message || "Erro ao criar categoria.",
        "erro"
      );
    } finally {
      setSalvandoCat(false);
    }
  };

  const criarLocal = async () => {
    const nomeLoc = novoNomeLoc.trim();
    if (!nomeLoc) {
      mostrarToast("Informe o nome do local.", "aviso");
      return;
    }
    setSalvandoLoc(true);
    try {
      const { data } = await api.post("/local", { nome: nomeLoc });
      const criado = data || { id: data?.id, nome: nomeLoc };
      setLocais((prev) => [...prev, criado]);
      setLocalSelecionado(criado);
      setNovoNomeLoc("");
      mostrarToast("Local criado!", "sucesso");
      setModalLoc(false);
    } catch (error) {
      mostrarToast(
        error.response?.data?.message || "Erro ao criar local.",
        "erro"
      );
    } finally {
      setSalvandoLoc(false);
    }
  };

  const escolherImagem = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      mostrarToast("Selecione apenas arquivos de imagem.", "aviso");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      mostrarToast("A imagem deve ter no máximo 5MB.", "aviso");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagemUri(previewUrl);
    setImagemFile(file);
  };

  const removerImagem = () => {
    setImagemUri("");
    setImagemFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validar = () => {
    if (!nome.trim()) {
      mostrarToast("Informe o nome do material.", "aviso");
      return false;
    }
    if (!categoriaSelecionada) {
      mostrarToast("Selecione uma categoria.", "aviso");
      return false;
    }
    if (!localSelecionado) {
      mostrarToast("Selecione um local de armazenamento.", "aviso");
      return false;
    }
    const qtdNum = parseInt(quantidade, 10);
    if (isNaN(qtdNum) || qtdNum <= 0) {
      mostrarToast("A quantidade deve ser um número maior que zero.", "aviso");
      return false;
    }
    return true;
  };

  const handleSalvar = async () => {
    if (!validar()) return;
    setLoading(true);

    const payload = {
      nome: nome.trim(),
      quantidade: parseInt(quantidade, 10),
      categoriaId: categoriaSelecionada.id,
      localId: localSelecionado.id,
    };

    const isImagemNova = !!imagemFile;
    if (modoEdicao && materialEdicao?.imagem && !isImagemNova) {
      payload.imagem = materialEdicao.imagem;
    }

    try {
      let materialId;

      if (modoEdicao) {
        await api.put(`/material/${materialEdicao.id}`, payload);
        materialId = materialEdicao.id;
      } else {
        const response = await api.post("/material", payload);
        materialId = response.data.id;
      }

      if (isImagemNova && imagemFile) {
        const formData = new FormData();
        formData.append(
          "imagem",
          imagemFile,
          imagemFile.name || "imagem_upload.jpg"
        );

        await api.post(`/material/${materialId}/imagem`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      mostrarToast(
        modoEdicao
          ? "Material atualizado com sucesso!"
          : "Material cadastrado com sucesso!",
        "sucesso"
      );

      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      const msg =
        error.response?.data?.message || "Erro ao salvar material ou imagem.";
      mostrarToast(msg, "erro");
    } finally {
      setLoading(false);
    }
  };

  const alterarQuantidade = (delta) => {
    const atual = parseInt(quantidade, 10) || 1;
    const novo = Math.max(1, atual + delta);
    setQuantidade(String(novo));
  };

  const renderModal = (
    visivel,
    setVisivel,
    dados,
    selecionado,
    setSelecionado,
    titulo,
    IconHeader,
    // extras para criar item
    tipoCriacao // "categoria" | "local"
  ) => {
    if (!visivel) return null;

    const isCat = tipoCriacao === "categoria";
    const novoNome = isCat ? novoNomeCat : novoNomeLoc;
    const setNovoNome = isCat ? setNovoNomeCat : setNovoNomeLoc;
    const salvando = isCat ? salvandoCat : salvandoLoc;
    const onCriar = isCat ? criarCategoria : criarLocal;

    return (
      <div style={styles.modalOverlay} onClick={() => setVisivel(false)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHandle} />

          <div style={styles.modalHeader}>
            <div style={styles.modalHeaderIconBox}>
              <IconHeader size={20} color={IFPE.primary} />
            </div>
            <h3 style={styles.modalTitle}>{titulo}</h3>
          </div>

          <div style={styles.modalLista}>
            {dados.length === 0 ? (
              <p style={styles.modalVazio}>
                Nenhum item cadastrado. Crie o primeiro abaixo.
              </p>
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
                      {item.nome || item.descricao}
                    </span>
                    {isSelected && (
                      <IoCheckmarkCircle size={20} color={IFPE.primary} />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Criar novo */}
          <div style={styles.criarBox}>
            <span style={styles.criarLabel}>
              {isCat ? "Nova categoria" : "Novo local"}
            </span>
            <div style={styles.criarRow}>
              <input
                style={styles.criarInput}
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder={
                  isCat ? "Ex: Informática" : "Ex: Sala 12 / Almoxarifado"
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCriar();
                }}
              />
              <button
                type="button"
                style={{
                  ...styles.criarBtn,
                  ...(salvando ? styles.saveBtnDisabled : {}),
                }}
                onClick={onCriar}
                disabled={salvando}
              >
                {salvando ? (
                  <div style={styles.spinnerSmall} />
                ) : (
                  <>
                    <IoAddCircleOutline size={18} color="#fff" />
                    <span>Criar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            type="button"
            style={styles.modalCloseBtn}
            onClick={() => setVisivel(false)}
          >
            Fechar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <Toast
        visivel={toast.visivel}
        mensagem={toast.mensagem}
        tipo={toast.tipo}
        onClose={() => setToast((t) => ({ ...t, visivel: false }))}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFileChange}
      />

      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.cardSectionTitle}>FOTOGRAFIA DO BEM</h2>

          {imagemPreviewUri ? (
            <div style={styles.previewContainer}>
              <img
                src={imagemPreviewUri}
                alt="Preview"
                style={styles.imagePreview}
              />
              <div style={styles.previewActions}>
                <button
                  type="button"
                  style={styles.btnAcaoImagem}
                  onClick={escolherImagem}
                >
                  <IoCamera size={16} color="#ffffff" />
                  <span style={styles.btnAcaoImagemText}>Trocar Foto</span>
                </button>
                <button
                  type="button"
                  style={{ ...styles.btnAcaoImagem, ...styles.btnRemoverFoto }}
                  onClick={removerImagem}
                >
                  <IoTrashOutline size={16} color="#ef4444" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              style={styles.imagePickerBtn}
              onClick={escolherImagem}
            >
              <div style={styles.cameraIconBox}>
                <IoCameraOutline size={28} color={IFPE.primary} />
              </div>
              <span style={styles.imagePickerTitle}>
                Adicionar foto do material
              </span>
              <span style={styles.imagePickerSub}>
                PNG, JPG ou JPEG até 5MB
              </span>
            </button>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardSectionTitle}>IDENTIFICAÇÃO</h2>

          <label style={styles.label}>NOME DO MATERIAL *</label>
          <div
            style={{
              ...styles.inputWrapper,
              ...(camposFocados.nome ? styles.inputWrapperFocado : {}),
            }}
          >
            <IoCubeOutline
              size={18}
              color={camposFocados.nome ? IFPE.primary : "#94a3b8"}
              style={styles.inputIcon}
            />
            <input
              style={styles.input}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Monitor Dell UltraSharp 27"
              onFocus={() => setCamposFocados((f) => ({ ...f, nome: true }))}
              onBlur={() => setCamposFocados((f) => ({ ...f, nome: false }))}
            />
          </div>

          {!modoEdicao && (
            <>
              <label style={styles.label}>
                QUANTIDADE DE UNIDADES A GERAR *
              </label>
              <div style={styles.stepperContainer}>
                <button
                  type="button"
                  style={styles.stepperBtn}
                  onClick={() => alterarQuantidade(-1)}
                >
                  <IoRemove size={20} color={IFPE.primary} />
                </button>
                <input
                  style={styles.stepperInput}
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  type="number"
                  min={1}
                />
                <button
                  type="button"
                  style={styles.stepperBtn}
                  onClick={() => alterarQuantidade(1)}
                >
                  <IoAdd size={20} color={IFPE.primary} />
                </button>
              </div>
              <p style={styles.helperText}>
                O sistema gerará um código patrimonial individual (PAT-XXXXXX)
                para cada unidade.
              </p>
            </>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardSectionTitle}>
            CLASSIFICAÇÃO & LOCALIZAÇÃO
          </h2>

          <label style={styles.label}>CATEGORIA *</label>
          <button
            type="button"
            style={styles.selectorBtn}
            onClick={() => setModalCat(true)}
          >
            <div style={styles.selectorLeft}>
              <IoPricetagOutline
                size={18}
                color={IFPE.primary}
                style={{ marginRight: 10 }}
              />
              <span
                style={
                  categoriaSelecionada
                    ? styles.selectorText
                    : styles.selectorPlaceholder
                }
              >
                {categoriaSelecionada
                  ? categoriaSelecionada.nome
                  : "Selecione a categoria"}
              </span>
            </div>
            <IoChevronDown size={18} color="#94a3b8" />
          </button>

          <label style={styles.label}>LOCAL DE ARMAZENAMENTO *</label>
          <button
            type="button"
            style={styles.selectorBtn}
            onClick={() => setModalLoc(true)}
          >
            <div style={styles.selectorLeft}>
              <IoLocationOutline
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
                  : "Selecione o local de armazenamento"}
              </span>
            </div>
            <IoChevronDown size={18} color="#94a3b8" />
          </button>
        </div>

        <button
          type="button"
          style={{
            ...styles.saveBtn,
            ...(loading ? styles.saveBtnDisabled : {}),
          }}
          onClick={handleSalvar}
          disabled={loading}
        >
          {loading ? (
            <div style={styles.spinner} />
          ) : (
            <div style={styles.saveBtnInner}>
              {modoEdicao ? (
                <IoSaveOutline size={20} color="#ffffff" />
              ) : (
                <IoCheckmarkCircleOutline size={20} color="#ffffff" />
              )}
              <span style={styles.saveBtnText}>
                {modoEdicao
                  ? "Atualizar Material"
                  : "Cadastrar no Inventário"}
              </span>
            </div>
          )}
        </button>
      </div>

      {renderModal(
        modalCat,
        setModalCat,
        categorias,
        categoriaSelecionada,
        setCategoriaSelecionada,
        "Selecione a Categoria",
        IoPricetag,
        "categoria"
      )}
      {renderModal(
        modalLoc,
        setModalLoc,
        locais,
        localSelecionado,
        setLocalSelecionado,
        "Local de Armazenamento",
        IoLocation,
        "local"
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
    paddingBottom: 40,
    maxWidth: 640,
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 10px rgba(15, 23, 42, 0.05)",
  },
  cardSectionTitle: {
    fontSize: 11.5,
    fontWeight: 800,
    color: IFPE.primary,
    letterSpacing: 0.8,
    margin: "0 0 12px 0",
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
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 14,
    padding: "0 14px",
    height: 48,
  },
  inputWrapperFocado: {
    borderColor: IFPE.primary,
    backgroundColor: "#ffffff",
  },
  inputIcon: {
    marginRight: 10,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    height: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14.5,
    color: "#0f172a",
    fontWeight: 500,
  },
  stepperContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 14,
    height: 48,
    padding: "0 6px",
  },
  stepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: IFPE.primaryLight,
    border: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  stepperInput: {
    flex: 1,
    height: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    textAlign: "center",
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
  },
  helperText: {
    fontSize: 11.5,
    color: "#94a3b8",
    marginTop: 6,
    lineHeight: 1.4,
  },
  imagePickerBtn: {
    width: "100%",
    backgroundColor: "#f8fafc",
    border: `1.5px dashed ${IFPE.primaryBorder}`,
    borderRadius: 16,
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
  },
  cameraIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: IFPE.primaryLight,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  imagePickerTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1e293b",
  },
  imagePickerSub: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  previewContainer: {
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 180,
    objectFit: "cover",
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
    display: "block",
  },
  previewActions: {
    position: "absolute",
    bottom: 10,
    right: 10,
    display: "flex",
    gap: 8,
  },
  btnAcaoImagem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    padding: "7px 12px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
  },
  btnRemoverFoto: {
    backgroundColor: "#ffffff",
  },
  btnAcaoImagemText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 700,
  },
  selectorBtn: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 14,
    padding: "0 14px",
    height: 48,
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
  saveBtn: {
    width: "100%",
    backgroundColor: IFPE.primary,
    height: 52,
    borderRadius: 16,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(21, 128, 61, 0.3)",
  },
  saveBtnDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
  saveBtnInner: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 700,
  },
  spinner: {
    width: 22,
    height: 22,
    border: "2.5px solid rgba(255,255,255,0.3)",
    borderTop: "2.5px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  spinnerSmall: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #ffffff",
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
  modalContent: {
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
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "1px solid #f1f5f9",
  },
  modalHeaderIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: IFPE.primaryLight,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
  },
  modalLista: {
    overflowY: "auto",
    flex: 1,
  },
  modalVazio: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 13,
    padding: "16px 0",
    margin: 0,
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
  criarBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: "1px solid #f1f5f9",
  },
  criarLabel: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: "#475569",
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  criarRow: {
    display: "flex",
    gap: 8,
  },
  criarInput: {
    flex: 1,
    height: 42,
    border: "1.5px solid #e2e8f0",
    borderRadius: 12,
    padding: "0 12px",
    fontSize: 14,
    outline: "none",
    color: "#0f172a",
  },
  criarBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    backgroundColor: IFPE.primary,
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "0 14px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  modalCloseBtn: {
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