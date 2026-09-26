import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoArrowBack,
  IoPersonOutline,
  IoCardOutline,
  IoCallOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import api from "../services/api";
import Toast from "../components/Toast";

export default function CadastroScreen() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [camposFocados, setCamposFocados] = useState({});
  const [toast, setToast] = useState({
    visivel: false,
    tipo: "info",
    mensagem: "",
  });

  const mostrarToast = (mensagem, tipo = "erro") =>
    setToast({ visivel: true, tipo, mensagem });

  // Máscaras
  const mascaraCPF = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  };

  const mascaraTelefone = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2")
      .slice(0, 15);
  };

  const validar = () => {
    if (!nome.trim() || !cpf || !email || !senha) {
      mostrarToast("Preencha todos os campos obrigatórios (*).", "aviso");
      return false;
    }
    if (nome.trim().length < 3) {
      mostrarToast("O nome deve ter pelo menos 3 caracteres.", "aviso");
      return false;
    }
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      mostrarToast("CPF inválido. Digite os 11 dígitos.", "aviso");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      mostrarToast("Digite um e-mail corporativo válido.", "aviso");
      return false;
    }
    if (senha.length < 6) {
      mostrarToast("A senha deve ter pelo menos 6 caracteres.", "aviso");
      return false;
    }
    if (!/[A-Z]/.test(senha)) {
      mostrarToast("A senha deve ter pelo menos uma letra maiúscula.", "aviso");
      return false;
    }
    if (!/[0-9]/.test(senha)) {
      mostrarToast("A senha deve ter pelo menos um número.", "aviso");
      return false;
    }
    if (telefone) {
      const telLimpo = telefone.replace(/\D/g, "");
      if (telLimpo.length < 10 || telLimpo.length > 11) {
        mostrarToast("Telefone inválido. Digite DDD + número.", "aviso");
        return false;
      }
    }
    return true;
  };

  const handleCadastro = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      await api.post("/usuario", {
        nome: nome.trim(),
        cpf: cpf.replace(/\D/g, ""),
        email,
        senha,
        telefone: telefone.replace(/\D/g, "") || null,
        tipo: "COLABORADOR",
      });
      mostrarToast("Conta criada com sucesso! Faça login.", "sucesso");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message ||
        "Não foi possível criar a conta. Verifique os dados.";
      mostrarToast(msg, "erro");
    } finally {
      setLoading(false);
    }
  };

  const forcaSenha = () => {
    if (!senha) return { nivel: 0, label: "", cor: "#e2e8f0", barra: "0%" };
    if (senha.length >= 6 && /[A-Z]/.test(senha) && /[0-9]/.test(senha)) {
      return { nivel: 3, label: "✓ Senha forte", cor: "#10b981", barra: "100%" };
    }
    if (senha.length >= 6) {
      return {
        nivel: 2,
        label: "⚠ Adicione maiúscula e número",
        cor: "#f59e0b",
        barra: "60%",
      };
    }
    return {
      nivel: 1,
      label: "✗ Mínimo 6 caracteres",
      cor: "#ef4444",
      barra: "30%",
    };
  };

  const infoForca = forcaSenha();

  return (
    <div style={styles.page}>
      <Toast
        visivel={toast.visivel}
        tipo={toast.tipo}
        mensagem={toast.mensagem}
        onClose={() => setToast((t) => ({ ...t, visivel: false }))}
      />

      <div style={styles.container}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <button
            type="button"
            style={styles.btnVoltar}
            onClick={() => navigate(-1)}
          >
            <IoArrowBack size={22} color="#ffffff" />
          </button>
          <div style={styles.headerInfo}>
            <h1 style={styles.headerTitle}>Criar Conta</h1>
            <p style={styles.headerSubtitle}>Cadastro de novo colaborador</p>
          </div>
        </div>

        {/* Card do Formulário */}
        <div style={styles.card}>
          <h2 style={styles.sectionHeader}>DADOS PESSOAIS</h2>

          {/* Nome */}
          <label style={styles.label}>NOME COMPLETO *</label>
          <div
            style={{
              ...styles.inputWrapper,
              ...(camposFocados.nome ? styles.inputWrapperFocado : {}),
            }}
          >
            <IoPersonOutline
              size={18}
              color={camposFocados.nome ? "#2563eb" : "#94a3b8"}
              style={styles.inputIcon}
            />
            <input
              style={styles.input}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onFocus={() => setCamposFocados((f) => ({ ...f, nome: true }))}
              onBlur={() => setCamposFocados((f) => ({ ...f, nome: false }))}
              placeholder="Ex: João da Silva"
            />
          </div>

          {/* CPF */}
          <label style={styles.label}>CPF *</label>
          <div
            style={{
              ...styles.inputWrapper,
              ...(camposFocados.cpf ? styles.inputWrapperFocado : {}),
            }}
          >
            <IoCardOutline
              size={18}
              color={camposFocados.cpf ? "#2563eb" : "#94a3b8"}
              style={styles.inputIcon}
            />
            <input
              style={styles.input}
              value={cpf}
              onChange={(e) => setCpf(mascaraCPF(e.target.value))}
              onFocus={() => setCamposFocados((f) => ({ ...f, cpf: true }))}
              onBlur={() => setCamposFocados((f) => ({ ...f, cpf: false }))}
              placeholder="000.000.000-00"
              maxLength={14}
              inputMode="numeric"
            />
          </div>

          {/* Telefone */}
          <label style={styles.label}>TELEFONE (WHATSAPP)</label>
          <div
            style={{
              ...styles.inputWrapper,
              ...(camposFocados.telefone ? styles.inputWrapperFocado : {}),
            }}
          >
            <IoCallOutline
              size={18}
              color={camposFocados.telefone ? "#2563eb" : "#94a3b8"}
              style={styles.inputIcon}
            />
            <input
              style={styles.input}
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
              inputMode="tel"
            />
          </div>

          <h2 style={{ ...styles.sectionHeader, marginTop: 20 }}>
            ACESSO AO SISTEMA
          </h2>

          {/* E-mail */}
          <label style={styles.label}>E-MAIL *</label>
          <div
            style={{
              ...styles.inputWrapper,
              ...(camposFocados.email ? styles.inputWrapperFocado : {}),
            }}
          >
            <IoMailOutline
              size={18}
              color={camposFocados.email ? "#2563eb" : "#94a3b8"}
              style={styles.inputIcon}
            />
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setCamposFocados((f) => ({ ...f, email: true }))}
              onBlur={() => setCamposFocados((f) => ({ ...f, email: false }))}
              placeholder="exemplo@ifpe.edu.br"
              autoCapitalize="none"
            />
          </div>

          {/* Senha */}
          <label style={styles.label}>SENHA *</label>
          <div
            style={{
              ...styles.inputWrapper,
              ...(camposFocados.senha ? styles.inputWrapperFocado : {}),
            }}
          >
            <IoLockClosedOutline
              size={18}
              color={camposFocados.senha ? "#2563eb" : "#94a3b8"}
              style={styles.inputIcon}
            />
            <input
              style={styles.input}
              type={senhaVisivel ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onFocus={() => setCamposFocados((f) => ({ ...f, senha: true }))}
              onBlur={() => setCamposFocados((f) => ({ ...f, senha: false }))}
              placeholder="Mínimo 6 dígitos"
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

          {/* Indicador de força de senha */}
          {senha.length > 0 && (
            <div style={styles.forcaContainer}>
              <div style={styles.barraFundo}>
                <div
                  style={{
                    ...styles.barraPreenchida,
                    width: infoForca.barra,
                    backgroundColor: infoForca.cor,
                  }}
                />
              </div>
              <span style={{ ...styles.forcaTexto, color: infoForca.cor }}>
                {infoForca.label}
              </span>
            </div>
          )}

          {/* Botão de Cadastro */}
          <button
            type="button"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            onClick={handleCadastro}
            disabled={loading}
          >
            {loading ? (
              <div style={styles.spinner} />
            ) : (
              <div style={styles.buttonInner}>
                <span style={styles.buttonText}>Finalizar Cadastro</span>
                <IoCheckmarkCircleOutline size={19} color="#fff" />
              </div>
            )}
          </button>

          <div style={styles.linkContainer}>
            <span style={styles.linkText}>Já possui uma conta? </span>
            <button
              type="button"
              style={styles.linkDestaque}
              onClick={() => navigate("/login")}
            >
              Acessar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    fontFamily: "sans-serif",
  },
  container: {
    maxWidth: 480,
    margin: "0 auto",
    paddingBottom: 32,
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    padding: "32px 20px 24px",
  },
  btnVoltar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    border: "none",
    cursor: "pointer",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: -0.3,
    margin: 0,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    margin: "2px 0 0 0",
    fontWeight: 500,
  },
  card: {
    backgroundColor: "#ffffff",
    margin: "0 16px",
    borderRadius: 24,
    padding: 22,
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 800,
    color: "#2563eb",
    letterSpacing: 0.8,
    margin: "0 0 8px 0",
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
    borderColor: "#2563eb",
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
  olhoBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
  },
  forcaContainer: {
    marginTop: 8,
  },
  barraFundo: {
    height: 4,
    backgroundColor: "#f1f5f9",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 4,
  },
  barraPreenchida: {
    height: "100%",
    borderRadius: 2,
    transition: "width 0.25s ease",
  },
  forcaTexto: {
    fontSize: 11.5,
    fontWeight: 600,
  },
  button: {
    width: "100%",
    backgroundColor: "#2563eb",
    borderRadius: 14,
    height: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
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
  linkContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
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
    color: "#2563eb",
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },
};