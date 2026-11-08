import React, { useEffect, useState } from "react";
import {
  IoLogOutOutline,
  IoCreateOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoCheckmarkSharp,
  IoChevronForward,
  IoShieldCheckmark,
  IoPerson,
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

export default function ProfileScreen() {
  const { usuario, logout, updateUsuario } = useAuth();

  const [modalSair, setModalSair] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);
  const [camposFocados, setCamposFocados] = useState({});
  const [toast, setToast] = useState({
    visivel: false,
    tipo: "info",
    mensagem: "",
  });

  const isAdm = usuario?.role === "ROLE_ADM";

  const idUsuario =
    usuario?.id ||
    usuario?.usuarioId ||
    usuario?.idUsuario ||
    usuario?.userId ||
    null;

  const mostrarToast = (mensagem, tipo = "erro") =>
    setToast({ visivel: true, tipo, mensagem });

  const mascaraTelefone = (valor) => {
    if (!valor) return "";
    return String(valor)
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2")
      .slice(0, 15);
  };

  // Preenche com o que já está no contexto
  useEffect(() => {
    if (!usuario) return;
    setNome(usuario.nome || "");
    setEmail(usuario.email || "");
    setTelefone(mascaraTelefone(usuario.telefone ?? usuario.celular ?? ""));
  }, [usuario]);

  // Busca dados atualizados na API (telefone fresco do banco)
  useEffect(() => {
    if (!idUsuario) return;

    let cancelado = false;

    (async () => {
      setCarregandoPerfil(true);
      try {
        const { data } = await api.get(`/usuario/${idUsuario}`);
        if (cancelado || !data) return;

        const tel = data.telefone ?? data.celular ?? "";
        setNome(data.nome || "");
        setEmail(data.email || "");
        setTelefone(mascaraTelefone(tel));

        if (updateUsuario) {
          await updateUsuario({
            ...usuario,
            ...data,
            id: idUsuario,
            telefone: tel || null,
          });
        }
      } catch {
        // Mantém o que veio do contexto / login
      } finally {
        if (!cancelado) setCarregandoPerfil(false);
      }
    })();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idUsuario]);

  const validar = () => {
    if (!nome.trim() || !email.trim()) {
      mostrarToast("Preencha nome e e-mail.", "aviso");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      mostrarToast("Digite um e-mail válido.", "aviso");
      return false;
    }

    const telefoneLimpo = telefone.replace(/\D/g, "");
    if (
      telefoneLimpo &&
      (telefoneLimpo.length < 10 || telefoneLimpo.length > 11)
    ) {
      mostrarToast("Digite um telefone válido com DDD.", "aviso");
      return false;
    }

    return true;
  };

  const handleSalvar = async () => {
    if (!idUsuario) {
      mostrarToast("Não foi possível identificar o usuário.", "erro");
      return;
    }

    if (!validar()) return;

    const telefoneLimpo = telefone.replace(/\D/g, "") || null;

    const payload = {
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefoneLimpo,
    };

    setLoading(true);
    try {
      const response = await api.put(`/usuario/${idUsuario}`, payload);

      const dadosBack =
        response?.data && typeof response.data === "object"
          ? response.data
          : {};

      const usuarioAtualizado = {
        ...usuario,
        ...dadosBack,
        ...payload,
        id: idUsuario,
        telefone:
          dadosBack.telefone ?? dadosBack.celular ?? payload.telefone,
      };

      if (updateUsuario) {
        await updateUsuario(usuarioAtualizado);
      }

      setNome(usuarioAtualizado.nome || payload.nome);
      setEmail(usuarioAtualizado.email || payload.email);
      setTelefone(mascaraTelefone(usuarioAtualizado.telefone || ""));

      mostrarToast("Perfil atualizado com sucesso!", "sucesso");
    } catch (error) {
      const status = error.response?.status;
      let msg =
        error.response?.data?.message || "Não foi possível atualizar o perfil.";
      if (status === 403) {
        msg = "Sem permissão para atualizar este perfil.";
      } else if (status === 401) {
        msg = "Sessão expirada. Faça login novamente.";
      }
      mostrarToast(msg, "erro");
    } finally {
      setLoading(false);
    }
  };

  const telefoneExibicao =
    telefone ||
    mascaraTelefone(usuario?.telefone || usuario?.celular || "") ||
    "Não informado";

  return (
    <div style={styles.container}>
      <Toast
        visivel={toast.visivel}
        tipo={toast.tipo}
        mensagem={toast.mensagem}
        onClose={() => setToast((t) => ({ ...t, visivel: false }))}
      />

      {modalSair && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalIconBox}>
              <IoLogOutOutline size={32} color="#ef4444" />
            </div>
            <h2 style={styles.modalTitulo}>Sair da Conta</h2>
            <p style={styles.modalMensagem}>
              Tem certeza que deseja encerrar sua sessão? Você precisará entrar
              novamente.
            </p>
            <div style={styles.modalBotoes}>
              <button
                type="button"
                style={styles.btnModalCancelar}
                onClick={() => setModalSair(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                style={styles.btnModalConfirmar}
                onClick={logout}
              >
                Sim, Sair
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.scrollContent}>
        <div style={styles.heroCard}>
          <div style={styles.avatarRing}>
            <div style={styles.avatar}>
              <span style={styles.avatarText}>
                {nome?.charAt(0).toUpperCase() ||
                  usuario?.nome?.charAt(0).toUpperCase() ||
                  "U"}
              </span>
            </div>
          </div>

          <h1 style={styles.heroNome}>{nome || usuario?.nome || "Usuário"}</h1>
          <p style={styles.heroEmail}>
            {email || usuario?.email || "sem e-mail cadastrado"}
          </p>

          <div style={styles.heroTelefone}>
            <IoCallOutline size={14} color={IFPE.primary} />
            <span>
              {carregandoPerfil ? "Carregando..." : telefoneExibicao}
            </span>
          </div>

          <div style={styles.badgeRole}>
            {isAdm ? (
              <IoShieldCheckmark size={13} color={IFPE.primaryText} />
            ) : (
              <IoPerson size={13} color={IFPE.primaryText} />
            )}
            <span style={styles.badgeRoleText}>
              {isAdm ? "ADMINISTRADOR" : "COLABORADOR"}
            </span>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.sectionHeaderBox}>
            <IoCreateOutline size={18} color={IFPE.primary} />
            <span style={styles.sectionHeaderTitle}>DADOS CADASTRAIS</span>
          </div>

          <label style={styles.label}>NOME COMPLETO</label>
          <div
            style={{
              ...styles.inputWrapper,
              ...(camposFocados.nome ? styles.inputWrapperFocado : {}),
            }}
          >
            <IoPersonOutline
              size={18}
              color={camposFocados.nome ? IFPE.primary : "#94a3b8"}
              style={styles.inputIcon}
            />
            <input
              style={styles.input}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onFocus={() => setCamposFocados((f) => ({ ...f, nome: true }))}
              onBlur={() => setCamposFocados((f) => ({ ...f, nome: false }))}
              placeholder="Digite seu nome"
            />
          </div>

          <label style={styles.label}>E-MAIL</label>
          <div
            style={{
              ...styles.inputWrapper,
              ...(camposFocados.email ? styles.inputWrapperFocado : {}),
            }}
          >
            <IoMailOutline
              size={18}
              color={camposFocados.email ? IFPE.primary : "#94a3b8"}
              style={styles.inputIcon}
            />
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setCamposFocados((f) => ({ ...f, email: true }))}
              onBlur={() => setCamposFocados((f) => ({ ...f, email: false }))}
              placeholder="Digite seu e-mail"
              autoCapitalize="none"
            />
          </div>

          <label style={styles.label}>TELEFONE (WHATSAPP)</label>
          <div
            style={{
              ...styles.inputWrapper,
              ...(camposFocados.telefone ? styles.inputWrapperFocado : {}),
            }}
          >
            <IoCallOutline
              size={18}
              color={camposFocados.telefone ? IFPE.primary : "#94a3b8"}
              style={styles.inputIcon}
            />
            <input
              style={styles.input}
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
              onFocus={() =>
                setCamposFocados((f) => ({ ...f, telefone: true }))
              }
              onBlur={() =>
                setCamposFocados((f) => ({ ...f, telefone: false }))
              }
              placeholder="(81) 90000-0000"
              maxLength={15}
            />
          </div>

          <button
            type="button"
            style={{
              ...styles.btnSalvar,
              ...(loading ? styles.btnSalvarDisabled : {}),
            }}
            onClick={handleSalvar}
            disabled={loading}
          >
            {loading ? (
              <div style={styles.spinner} />
            ) : (
              <div style={styles.btnSalvarInner}>
                <IoCheckmarkSharp size={18} color="#fff" />
                <span style={styles.btnSalvarText}>SALVAR ALTERAÇÕES</span>
              </div>
            )}
          </button>
        </div>

        <div style={styles.cardLogout}>
          <button
            type="button"
            style={styles.btnLogout}
            onClick={() => setModalSair(true)}
          >
            <div style={styles.btnLogoutLeft}>
              <div style={styles.btnLogoutIconBox}>
                <IoLogOutOutline size={20} color="#ef4444" />
              </div>
              <div>
                <div style={styles.btnLogoutText}>Encerrar Sessão</div>
                <div style={styles.btnLogoutSub}>
                  Desconectar deste dispositivo
                </div>
              </div>
            </div>
            <IoChevronForward size={18} color="#94a3b8" />
          </button>
        </div>

        <p style={styles.footerVersion}>
          IF Escritório • IFPE • {isAdm ? "Administrador" : "Colaborador"}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "sans-serif",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
    maxWidth: 520,
    margin: "0 auto",
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "26px 20px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 10px rgba(15, 23, 42, 0.05)",
    marginBottom: 16,
  },
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: IFPE.primaryLight,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: `2px solid ${IFPE.primaryBorder}`,
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: IFPE.primary,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 30,
    fontWeight: 800,
    color: "#ffffff",
  },
  heroNome: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
    textAlign: "center",
    margin: 0,
  },
  heroEmail: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    marginBottom: 6,
  },
  heroTelefone: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: IFPE.primaryText,
    fontWeight: 600,
    marginBottom: 12,
  },
  badgeRole: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 12px",
    borderRadius: 20,
    backgroundColor: IFPE.primaryLight,
  },
  badgeRoleText: {
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: 0.4,
    color: IFPE.primaryText,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 10px rgba(15, 23, 42, 0.05)",
    marginBottom: 16,
  },
  sectionHeaderBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: "1px solid #f1f5f9",
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: 800,
    color: IFPE.primary,
    letterSpacing: 0.8,
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
    backgroundColor: "transparent",
    fontSize: 14.5,
    color: "#0f172a",
    fontWeight: 500,
  },
  btnSalvar: {
    width: "100%",
    backgroundColor: IFPE.primary,
    borderRadius: 14,
    height: 48,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(21, 128, 61, 0.3)",
  },
  btnSalvarDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
  btnSalvarInner: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  btnSalvarText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 0.4,
  },
  spinner: {
    width: 20,
    height: 20,
    border: "2.5px solid rgba(255,255,255,0.3)",
    borderTop: "2.5px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  cardLogout: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    border: "1px solid #fee2e2",
    overflow: "hidden",
    marginBottom: 20,
  },
  btnLogout: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  btnLogoutLeft: {
    display: "flex",
    alignItems: "center",
  },
  btnLogoutIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  btnLogoutText: {
    fontSize: 14.5,
    fontWeight: 700,
    color: "#ef4444",
  },
  btnLogoutSub: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 1,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  modalIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fef2f2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  modalMensagem: {
    fontSize: 13.5,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 1.5,
    margin: "0 0 22px 0",
  },
  modalBotoes: {
    display: "flex",
    width: "100%",
    gap: 12,
  },
  btnModalCancelar: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: "12px 0",
    border: "none",
    color: "#475569",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  btnModalConfirmar: {
    flex: 1,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    padding: "12px 0",
    border: "none",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  footerVersion: {
    textAlign: "center",
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: 500,
    margin: 0,
  },
};