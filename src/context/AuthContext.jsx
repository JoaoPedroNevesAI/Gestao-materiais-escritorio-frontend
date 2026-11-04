import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

const AuthContext = createContext({});

/**
 * Padroniza o usuário para o frontend sempre ter:
 * - id
 * - role: "ROLE_ADM" | "ROLE_COLABORADOR" (ou o que o back usar)
 * - telefone (se vier)
 */
function normalizarUsuario(dadosUsuario) {
  if (!dadosUsuario) return null;

  const id =
    dadosUsuario.id ||
    dadosUsuario.usuarioId ||
    dadosUsuario.idUsuario ||
    dadosUsuario.userId ||
    null;

  // Aceita vários formatos que o back pode devolver
  const roleBruto =
    dadosUsuario.role ||
    dadosUsuario.tipo ||
    dadosUsuario.perfil ||
    dadosUsuario.authority ||
    (Array.isArray(dadosUsuario.authorities)
      ? dadosUsuario.authorities[0]
      : null) ||
    "";

  const roleUpper = String(roleBruto).toUpperCase();

  let role = roleUpper;
  if (
    roleUpper === "ADM" ||
    roleUpper === "ADMIN" ||
    roleUpper === "ADMINISTRADOR" ||
    roleUpper === "ROLE_ADMIN"
  ) {
    role = "ROLE_ADM";
  } else if (
    roleUpper === "COLABORADOR" ||
    roleUpper === "CLIENTE" ||
    roleUpper === "USER" ||
    roleUpper === "ROLE_USER" ||
    roleUpper === "ROLE_COLABORADOR"
  ) {
    role = "ROLE_COLABORADOR";
  } else if (roleUpper.includes("ADM")) {
    role = "ROLE_ADM";
  } else if (roleUpper) {
    // mantém o valor original se já vier "ROLE_ADM" etc.
    role = roleUpper.startsWith("ROLE_") ? roleUpper : `ROLE_${roleUpper}`;
  } else {
    role = "ROLE_COLABORADOR"; // padrão seguro
  }

  return {
    ...dadosUsuario,
    id,
    role,
    telefone: dadosUsuario.telefone ?? dadosUsuario.celular ?? null,
  };
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function carregarSessao() {
      try {
        const tokenSalvo = localStorage.getItem("@token");
        const usuarioSalvo = localStorage.getItem("@usuario");

        if (tokenSalvo && usuarioSalvo) {
          // Renormaliza caso a sessão antiga não tenha role padronizado
          setUsuario(normalizarUsuario(JSON.parse(usuarioSalvo)));
        }
      } catch (e) {
        console.error("Erro ao carregar sessão:", e);
      } finally {
        setLoading(false);
      }
    }

    carregarSessao();
  }, []);

  async function login(email, senha) {
    const response = await api.post("/auth/login", { email, senha });
    const { token, ...dadosUsuario } = response.data;

    const usuarioNormalizado = normalizarUsuario(dadosUsuario);

    localStorage.setItem("@token", token);
    localStorage.setItem("@usuario", JSON.stringify(usuarioNormalizado));

    setUsuario(usuarioNormalizado);
    return usuarioNormalizado;
  }

  async function logout() {
    localStorage.removeItem("@token");
    localStorage.removeItem("@usuario");
    setUsuario(null);
  }

  async function updateUsuario(dadosAtualizados) {
    const usuarioAtualizado = normalizarUsuario({
      ...usuario,
      ...dadosAtualizados,
    });

    localStorage.setItem("@usuario", JSON.stringify(usuarioAtualizado));
    setUsuario(usuarioAtualizado);
    return usuarioAtualizado;
  }

  return (
    <AuthContext.Provider
      value={{ usuario, loading, login, logout, updateUsuario }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}