import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function NotificationBell({
  color = "#ffffff",
  size = 21,
  borderColor = "#1e293b",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const carregarContador = useCallback(async () => {
    if (!usuario) return;
    try {
      const response = await api.get("/notificacao/nao-lidas/count");
      const count =
        typeof response.data === "number"
          ? response.data
          : Number(response.data) || 0;
      setUnreadCount(count);
    } catch {
      // Silencioso em caso de falha de rede temporária
    }
  }, [usuario]);

  // Atualiza quando a rota muda (substitui useIsFocused)
  useEffect(() => {
    carregarContador();
  }, [location.pathname, carregarContador]);

  // Polling a cada 30 segundos
  useEffect(() => {
    if (!usuario) return;
    const interval = setInterval(carregarContador, 30000);
    return () => clearInterval(interval);
  }, [usuario, carregarContador]);

  return (
    <button
      type="button"
      style={styles.container}
      onClick={() => navigate("/materiais/notificacoes")}
      aria-label="Notificações"
      title="Notificações"
    >
      <IoNotificationsOutline size={size} color={color} />

      {unreadCount > 0 && (
        <span
          style={{
            ...styles.badge,
            borderColor,
          }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}

const styles = {
  container: {
    padding: 6,
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#ef4444",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 4px",
    borderWidth: 1.5,
    borderStyle: "solid",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 800,
    lineHeight: 1,
  },
};