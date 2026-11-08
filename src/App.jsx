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
  IoStatsChart,
  IoStatsChartOutline,
  IoDocumentText,
  IoDocumentTextOutline,
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
import DashboardScreen from "./screens/DashboardScreen";
import AuditoriaScreen from "./screens/AuditoriaScreen";

const IFPE = {
  primary: "#15803d",
  headerBg: "#14532d",
};

// ====================== HEADER ======================
function Header({ title, showBack = false, rightAction = null }) {
  const navigate = useNavigate();

  return (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        {showBack && (
          <button type="button" style={styles.backBtn} onClick={() => navigate(-1)}>
            ←
          </button>
        )}
        <h1 style={styles.headerTitle}>{title}</h1>
      </div>
      {rightAction}
    </header>
  );
}

function BotaoNovoMaterial() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  if (!usuario || usuario.role !== "ROLE_ADM") return null;

  return (
    <button
      type="button"
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

  // ADM: Painel | Materiais | Solicitações | Auditoria | Perfil
  // (Movimentações continua acessível pelo Dashboard / rotas, sem lotar a tab bar)
  const tabs = isAdm
    ? [
        {
          path: "/dashboard",
          label: "Painel",
          icon: IoStatsChart,
          iconOutline: IoStatsChartOutline,
        },
        {
          path: "/materiais",
          label: "Materiais",
          icon: IoCube,
          iconOutline: IoCubeOutline,
        },
        {
          path: "/solicitacoes",
          label: "Solicitações",
          icon: IoTime,
          iconOutline: IoTimeOutline,
        },
        {
          path: "/auditoria",
          label: "Auditoria",
          icon: IoDocumentText,
          iconOutline: IoDocumentTextOutline,
        },
        {
          path: "/perfil",
          label: "Perfil",
          icon: IoPerson,
          iconOutline: IoPersonOutline,
        },
      ]
    : [
        {
          path: "/materiais",
          label: "Materiais",
          icon: IoCube,
          iconOutline: IoCubeOutline,
        },
        {
          path: "/perfil",
          label: "Perfil",
          icon: IoPerson,
          iconOutline: IoPersonOutline,
        },
      ];

  return (
    <nav style={styles.tabBar}>
      {tabs.map((tab) => {
        const ativo = location.pathname.startsWith(tab.path);
        const Icon = ativo ? tab.icon : tab.iconOutline;
        const cor = ativo ? IFPE.primary : "#64748b";

        return (
          <button
            key={tab.path}
            type="button"
            style={styles.tabItem}
            onClick={() => navigate(tab.path)}
          >
            <Icon size={22} color={cor} />
            <span
              style={{
                ...styles.tabLabel,
                color: cor,
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

  if (!usuario) {
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/cadastro" element={<CadastroScreen />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const isAdm = usuario.role === "ROLE_ADM";
  const homePath = isAdm ? "/dashboard" : "/materiais";

  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* ===== DASHBOARD (ADM) ===== */}
        {isAdm && (
          <Route
            path="/dashboard"
            element={
              <>
                <Header title="Dashboard" />
                <DashboardScreen />
              </>
            }
          />
        )}

        {/* ===== AUDITORIA (ADM) ===== */}
        {isAdm && (
          <Route
            path="/auditoria"
            element={
              <>
                <Header title="Auditoria" />
                <AuditoriaScreen />
              </>
            }
          />
        )}

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

        {/* ===== MOVIMENTAÇÕES (ADM) — rota mantida, link no Dashboard ===== */}
        {isAdm && (
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

        {/* ===== SOLICITAÇÕES (ADM) ===== */}
        {isAdm && (
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

      {/* Redirect padrão */}
      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  );
}

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
    paddingBottom: 70,
  },
  header: {
    backgroundColor: IFPE.headerBg,
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
    fontSize: 10,
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
    borderTop: `3px solid ${IFPE.primary}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};