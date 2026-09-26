import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  IoCube,
  IoCubeOutline,
  IoSwapHorizontal,
  IoSwapHorizontalOutline,
  IoTime,
  IoTimeOutline,
  IoPerson,
  IoPersonOutline,
  IoAdd,
} from "react-icons/io5";

import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginScreen from "./screens/LoginScreen";
import CadastroScreen from "./screens/CadastroScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import MovimentacaoFormScreen from "./screens/MovimentacaoFormScreen";
import MovimentacaoListScreen from "./screens/MovimentacaoListScreen";
import DetalhesMaterialScreen from "./screens/DetalhesMaterialScreen";
import CadastroMaterialScreen from "./screens/CadastroMaterialScreen";
import SolicitacoesPendentesScreen from "./screens/SolicitacoesPendentesScreen";
import QrCodeScannerScreen from "./screens/QrCodeScannerScreen";
import NotificacoesScreen from "./screens/NotificacoesScreen";
import ManutencaoFormScreen from "./screens/ManutencaoFormScreen";
// ====================== LAYOUT COM HEADER ======================
function Header({ title, showBack = false, rightAction = null }) {
  const navigate = useNavigate();

  return (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        {showBack && (
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            ←
          </button>
        )}
        <h1 style={styles.headerTitle}>{title}</h1>
      </div>
      {rightAction}
    </header>
  );
}

// Botão "Novo Material" (só ADM)
function BotaoNovoMaterial() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  if (!usuario || usuario.role !== "ROLE_ADM") return null;

  return (
    <button
      style={styles.addBtn}
      onClick={() => navigate("/materiais/cadastro")}
      title="Novo Material"
    >
      <IoAdd size={22} color="#ffffff" />
    </button>
  );
}

// ====================== TAB BAR ======================
function TabBar() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdm = usuario?.role === "ROLE_ADM";

  const tabs = isAdm
    ? [
        { path: "/materiais", label: "Materiais", icon: IoCube, iconOutline: IoCubeOutline },
        { path: "/movimentacoes", label: "Movimentações", icon: IoSwapHorizontal, iconOutline: IoSwapHorizontalOutline },
        { path: "/solicitacoes", label: "Solicitações", icon: IoTime, iconOutline: IoTimeOutline },
        { path: "/perfil", label: "Perfil", icon: IoPerson, iconOutline: IoPersonOutline },
      ]
    : [
        { path: "/materiais", label: "Materiais", icon: IoCube, iconOutline: IoCubeOutline },
        { path: "/perfil", label: "Perfil", icon: IoPerson, iconOutline: IoPersonOutline },
      ];

  return (
    <nav style={styles.tabBar}>
      {tabs.map((tab) => {
        const ativo = location.pathname.startsWith(tab.path);
        const Icon = ativo ? tab.icon : tab.iconOutline;

        return (
          <button
            key={tab.path}
            style={styles.tabItem}
            onClick={() => navigate(tab.path)}
          >
            <Icon size={22} color={ativo ? "#2563eb" : "#64748b"} />
            <span
              style={{
                ...styles.tabLabel,
                color: ativo ? "#2563eb" : "#64748b",
                fontWeight: ativo ? 700 : 600,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ====================== LAYOUT PRINCIPAL (com tabs) ======================
function AppLayout() {
  return (
    <div style={styles.appLayout}>
      <div style={styles.content}>
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
}

// ====================== LOADING ======================
function LoadingScreen() {
  return (
    <div style={styles.loading}>
      <div style={styles.spinner} />
    </div>
  );
}

// ====================== ROTAS ======================
function AppRoutes() {
  const { usuario, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  // Não logado → Auth
  if (!usuario) {
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/cadastro" element={<CadastroScreen />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Logado
  return (
    <Routes>
      {/* Layout com Bottom Tabs */}
      <Route element={<AppLayout />}>
        {/* ===== MATERIAIS ===== */}
        <Route path="/materiais">
          <Route
            index
            element={
              <>
                <Header
                  title="Inventário de Bens"
                  rightAction={<BotaoNovoMaterial />}
                />
                <HomeScreen />
              </>
            }
          />
          <Route
            path="cadastro"
            element={
              <>
                <Header title="Novo Material" showBack />
                <CadastroMaterialScreen />
              </>
            }
          />
          <Route
            path="detalhes/:materialId"
            element={
              <>
                <Header title="Detalhes do Material" showBack />
                <DetalhesMaterialScreen />
              </>
            }
          />
          <Route
            path="transferir/:materialId?"
            element={
              <>
                <Header title="Transferir Material" showBack />
                <MovimentacaoFormScreen />
              </>
            }
          />
          <Route
            path="historico/:materialId?"
            element={
              <>
                <Header title="Histórico" showBack />
                <MovimentacaoListScreen />
              </>
            }
          />
          <Route
            path="manutencao/:materialId?"
            element={
              <>
                <Header title="Solicitar Manutenção" showBack />
                <ManutencaoFormScreen />
              </>
            }
          />
          <Route
            path="scanner"
            element={
              <>
                <Header title="Leitor de QR Code" showBack />
                <QrCodeScannerScreen />
              </>
            }
          />
          <Route
            path="notificacoes"
            element={
              <>
                <Header title="Notificações" showBack />
                <NotificacoesScreen />
              </>
            }
          />
        </Route>

        {/* ===== MOVIMENTAÇÕES (só ADM) ===== */}
        {usuario.role === "ROLE_ADM" && (
          <Route
            path="/movimentacoes"
            element={
              <>
                <Header title="Movimentações" />
                <MovimentacaoListScreen />
              </>
            }
          />
        )}

        {/* ===== SOLICITAÇÕES (só ADM) ===== */}
        {usuario.role === "ROLE_ADM" && (
          <Route
            path="/solicitacoes"
            element={
              <>
                <Header title="Central de Solicitações" />
                <SolicitacoesPendentesScreen />
              </>
            }
          />
        )}

        {/* ===== PERFIL ===== */}
        <Route
          path="/perfil"
          element={
            <>
              <Header title="Meu Perfil" />
              <ProfileScreen />
            </>
          }
        />
      </Route>

      {/* Redirecionamento padrão */}
      <Route path="*" element={<Navigate to="/materiais" replace />} />
    </Routes>
  );
}

// ====================== APP ======================
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

// ====================== ESTILOS ======================
const styles = {
  appLayout: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    paddingBottom: 70, // espaço para a tab bar
  },
  header: {
    backgroundColor: "#1e293b",
    color: "#ffffff",
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 700,
    margin: 0,
    color: "#ffffff",
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: "#ffffff",
    fontSize: 20,
    cursor: "pointer",
    padding: "4px 8px",
  },
  addBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    width: 34,
    height: 34,
    borderRadius: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
  },
  tabBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#ffffff",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 100,
  },
  tabItem: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "6px 0",
  },
  tabLabel: {
    fontSize: 11,
  },
  loading: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};