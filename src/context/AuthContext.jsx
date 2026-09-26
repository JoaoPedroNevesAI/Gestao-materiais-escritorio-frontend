import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

const AuthContext = createContext({});

function normalizarUsuario(dadosUsuario) {
  if (!dadosUsuario) return null;

  const id =
    dadosUsuario.id ||
    dadosUsuario.usuarioId ||
    dadosUsuario.idUsuario ||
    dadosUsuario.userId ||
    null;

  return { ...dadosUsuario, id };
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ao abrir o app, verifica se já tem sessão salva
  useEffect(() => {
    function carregarSessao() {
      try {
        const tokenSalvo = localStorage.getItem("@token");
        const usuarioSalvo = localStorage.getItem("@usuario");

        if (tokenSalvo && usuarioSalvo) {
          setUsuario(JSON.parse(usuarioSalvo));
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
    return usuarioNormalizado; // retorna para o caller saber o tipo (ADM/CLIENTE)
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

// Hook de atalho: useAuth()
export function useAuth() {
  return useContext(AuthContext);
}