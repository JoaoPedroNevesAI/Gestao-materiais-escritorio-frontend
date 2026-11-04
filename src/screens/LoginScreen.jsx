import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoCube,
  IoMailOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoArrowForward,
} from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";

const IFPE = {
  primary: "#15803d",
  primaryDark: "#166534",
  primaryLight: "#f0fdf4",
  pageBg: "#14532d",
  accent: "#4ade80",
};

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focado, setFocado] = useState({ email: false, senha: false });
  const [shake, setShake] = useState(false);

  const [toast, setToast] = useState({
    visivel: false,
    tipo: "info",
    mensagem: "",
  });

  const mostrarToast = (mensagem, tipo = "erro") =>
    setToast({ visivel: true, tipo, mensagem });

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleLogin = async () => {
    if (!email || !senha) {
      mostrarToast("Preencha todos os campos.", "aviso");
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const usuarioLogado = await login(email.trim(), senha);

      const isAdm = usuarioLogado?.role === "ROLE_ADM";
      mostrarToast(
        isAdm
          ? "Bem-vindo, Administrador!"
          : "Bem-vindo! Login realizado com sucesso.",
        "sucesso"
      );
      // App.jsx redireciona pelas rotas conforme o role
    } catch (error) {
      let mensagem = "E-mail ou senha inválidos.";

      if (error.response?.status === 401 || error.response?.status === 403) {
        mensagem = "E-mail ou senha incorretos. Tente novamente.";
      } else if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      } else if (error.message && error.message.includes("Network Error")) {
        mensagem = "Erro de conexão com o servidor. Verifique o backend.";
      }

      mostrarToast(mensagem, "erro");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={styles.page}>
      <Toast
        visivel={toast.visivel}
        tipo={toast.tipo}
        mensagem={toast.mensagem}
        onClose={() => setToast((t) => ({ ...t, visivel: false }))}
      />

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.iconCircleOuter}>
            <div style={styles.iconCircle}>
              <IoCube size={36} color={IFPE.accent} />
            </div>
          </div>
          <h1 style={styles.appNome}>Gestão de Bens</h1>
          <p style={styles.appSubtitulo}>
            IFPE • Controle de Materiais & Patrimônios
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Bem-vindo de volta</h2>
          <p style={styles.cardSubtitle}>
            Entre com suas credenciais de acesso
          </p>

          <label style={styles.label}>E-MAIL CORPORATIVO</label>
          <div
            style={{
              ...styles.inputWrapper,
              ...(focado.email ? styles.inputWrapperFocado : {}),
            }}
          >
            <IoMailOutline
              size={18}
              color={focado.email ? IFPE.primary : "#94a3b8"}
              style={styles.inputIcon}
            />
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocado((f) => ({ ...f, email: true }))}
              onBlur={() => setFocado((f) => ({ ...f, email: false }))}
              onKeyDown={handleKeyDown}
              placeholder="exemplo@ifpe.edu.br"
              autoCapitalize="none"
            />
          </div>

          <label style={styles.label}>SENHA</label>
          <div
            style={{
              ...styles.inputWrapper,
              ...(focado.senha ? styles.inputWrapperFocado : {}),
            }}
          >
            <IoLockClosedOutline
              size={18}
              color={focado.senha ? IFPE.primary : "#94a3b8"}
              style={styles.inputIcon}
            />
            <input
              style={styles.input}
              type={senhaVisivel ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onFocus={() => setFocado((f) => ({ ...f, senha: true }))}
              onBlur={() => setFocado((f) => ({ ...f, senha: false }))}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua senha"
            />
            <button
              type="button"
              style={styles.olhoBtn}
              onClick={() => setSenhaVisivel((v) => !v)}
            >
              {senhaVisivel ? (
                <IoEyeOutline size={20} color="#94a3b8" />
              ) : (
                <IoEyeOffOutline size={20} color="#94a3b8" />
              )}
            </button>
          </div>

          <div
            style={{
              marginTop: 24,
              animation: shake ? "shake 0.4s ease" : "none",
            }}
          >
            <button
              type="button"
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
              }}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <div style={styles.spinner} />
              ) : (
                <div style={styles.buttonInner}>
                  <span style={styles.buttonText}>Acessar Sistema</span>
                  <IoArrowForward size={18} color="#fff" />
                </div>
              )}
            </button>
          </div>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>Novo por aqui?</span>
            <div style={styles.dividerLine} />
          </div>

          <div style={styles.linkContainer}>
            <span style={styles.linkText}>Não possui conta? </span>
            <button
              type="button"
              style={styles.linkDestaque}
              onClick={() => navigate("/cadastro")}
            >
              Cadastre-se
            </button>
          </div>
        </div>

        <p style={styles.footerText}>IF Escritório • IFPE • v2.0</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: IFPE.pageBg,
    fontFamily: "sans-serif",
  },
  container: {
    maxWidth: 440,
    margin: "0 auto",
    padding: "36px 0",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: 24,
  },
  iconCircleOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    border: "1px solid rgba(74, 222, 128, 0.3)",
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#166534",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid rgba(255, 255, 255, 0.12)",
  },
  appNome: {
    fontSize: 24,
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: -0.3,
    margin: 0,
  },
  appSubtitulo: {
    fontSize: 13,
    color: "#bbf7d0",
    margin: "4px 0 0 0",
    fontWeight: 500,
  },
  card: {
    backgroundColor: "#ffffff",
    margin: "0 18px",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 2px 0",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#64748b",
    margin: "0 0 20px 0",
  },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: "#475569",
    marginBottom: 6,
    marginTop: 12,
    letterSpacing: 0.6,
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 14,
    padding: "0 14px",
    height: 50,
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
    fontSize: 15,
    color: "#0f172a",
    fontWeight: 500,
  },
  olhoBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
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
    boxShadow: "0 4px 12px rgba(21, 128, 61, 0.35)",
  },
  buttonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
  buttonInner: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 700,
  },
  spinner: {
    width: 20,
    height: 20,
    border: "2.5px solid rgba(255,255,255,0.3)",
    borderTop: "2.5px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "20px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    margin: "0 12px",
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: 500,
  },
  linkContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  linkText: {
    fontSize: 14,
    color: "#64748b",
  },
  linkDestaque: {
    background: "transparent",
    border: "none",
    fontSize: 14,
    color: IFPE.primary,
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },
  footerText: {
    textAlign: "center",
    color: "#86efac",
    fontSize: 11,
    fontWeight: 500,
    marginTop: 20,
  },
};