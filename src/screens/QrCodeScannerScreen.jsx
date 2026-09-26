import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import {
  IoArrowBack,
  IoFlash,
  IoFlashOff,
  IoCamera,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import api from "../services/api";
import Toast from "../components/Toast";

export default function QrCodeScannerScreen() {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const [permission, setPermission] = useState(null); // null | true | false
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [toast, setToast] = useState({
    visivel: false,
    tipo: "info",
    mensagem: "",
  });

  const mostrarToast = (mensagem, tipo = "erro") =>
    setToast({ visivel: true, tipo, mensagem });

  // ====================== LÓGICA DE LEITURA ======================
  const abrirDetalhes = async (valorLido) => {
    if (scanned) return;

    const texto = String(valorLido).trim();
    const match = texto.match(/PAT-\d+/i);
    const codigo = match ? match[0].toUpperCase() : texto;

    if (!codigo) {
      mostrarToast("QR Code inválido.", "aviso");
      return;
    }

    setScanned(true);

    try {
      let response;
      try {
        response = await api.get(`/patrimonio/codigo/${codigo}`);
      } catch (errCodigo) {
        if (errCodigo.response?.status === 404) {
          response = await api.get(
            `/patrimonio/qrcode/${encodeURIComponent(texto)}`
          );
        } else {
          throw errCodigo;
        }
      }

      const materialId = response.data?.material?.id;

      if (materialId) {
        // Para a câmera antes de navegar
        if (html5QrCodeRef.current) {
          await html5QrCodeRef.current.stop().catch(() => {});
        }
        navigate(`/detalhes-material/${materialId}`, { replace: true });
      } else {
        mostrarToast(
          "Material associado a este patrimônio não foi encontrado.",
          "erro"
        );
        setScanned(false);
      }
    } catch (error) {
      const msg =
        error.response?.status === 404
          ? `Patrimônio ${codigo} não cadastrado no sistema.`
          : "Erro ao ler o código de patrimônio.";
      mostrarToast(msg, "erro");
      setScanned(false);
    }
  };

  // ====================== PERMISSÃO + INICIAR SCANNER ======================
  const iniciarScanner = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setPermission(false);
        return;
      }

      setPermission(true);

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" }, // câmera traseira
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (!scanned) {
            abrirDetalhes(decodedText);
          }
        },
        () => {} // ignore frame errors
      );
    } catch (err) {
      console.error(err);
      setPermission(false);
    }
  };

  const solicitarPermissao = async () => {
    try {
      // Força o browser a pedir permissão
      await navigator.mediaDevices.getUserMedia({ video: true });
      iniciarScanner();
    } catch {
      setPermission(false);
      mostrarToast("Permissão de câmera negada.", "erro");
    }
  };

  useEffect(() => {
    // Tenta iniciar automaticamente
    iniciarScanner();

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current?.clear())
          .catch(() => {});
      }
    };
  }, []);

  // ====================== TORCH (Flash) ======================
  const toggleTorch = async () => {
    if (!html5QrCodeRef.current) return;

    try {
      const track = html5QrCodeRef.current.getRunningTrackCameraCapabilities?.();
      // html5-qrcode não expõe torch de forma direta em todas as versões.
      // Solução mais confiável:
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();

      if (capabilities.torch) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !torch }],
        });
        setTorch((t) => !t);
      } else {
        mostrarToast("Flash não suportado neste dispositivo.", "aviso");
      }
    } catch {
      mostrarToast("Não foi possível controlar o flash.", "aviso");
    }
  };

  // ====================== TELAS DE ESTADO ======================
  if (permission === null) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
      </div>
    );
  }

  if (permission === false) {
    return (
      <div style={styles.permissionContainer}>
        <Toast
          visivel={toast.visivel}
          tipo={toast.tipo}
          mensagem={toast.mensagem}
          onClose={() => setToast((t) => ({ ...t, visivel: false }))}
        />

        <div style={styles.permissionIconCircle}>
          <IoCamera size={44} color="#38bdf8" />
        </div>

        <h2 style={styles.permissionTitle}>Acesso à Câmera</h2>
        <p style={styles.permissionText}>
          Precisamos da sua permissão para ler o QR Code ou código de barras dos
          bens patrimoniais.
        </p>

        <button style={styles.permissionButton} onClick={solicitarPermissao}>
          <IoShieldCheckmarkOutline size={18} color="#ffffff" />
          <span style={styles.permissionButtonText}>Permitir Acesso</span>
        </button>

        <button style={styles.secondaryButton} onClick={() => navigate(-1)}>
          <span style={styles.secondaryButtonText}>Voltar</span>
        </button>
      </div>
    );
  }

  // ====================== TELA PRINCIPAL ======================
  return (
    <div style={styles.container}>
      <Toast
        visivel={toast.visivel}
        tipo={toast.tipo}
        mensagem={toast.mensagem}
        onClose={() => setToast((t) => ({ ...t, visivel: false }))}
      />

      {/* Elemento onde a câmera será renderizada */}
      <div id="qr-reader" style={styles.camera} />

      {/* Top Bar */}
      <div style={styles.topControls}>
        <button style={styles.iconCircleBtn} onClick={() => navigate(-1)}>
          <IoArrowBack size={22} color="#ffffff" />
        </button>

        <div style={styles.topCenterTitleBox}>
          <span style={styles.topCenterTitle}>Leitor Patrimonial</span>
        </div>

        <button
          style={{
            ...styles.iconCircleBtn,
            ...(torch ? styles.iconCircleBtnActive : {}),
          }}
          onClick={toggleTorch}
        >
          {torch ? (
            <IoFlash size={20} color="#f59e0b" />
          ) : (
            <IoFlashOff size={20} color="#ffffff" />
          )}
        </button>
      </div>

      {/* Overlay / HUD */}
      <div style={styles.overlay}>
        <div style={styles.targetFrame}>
          <div style={{ ...styles.corner, ...styles.cornerTL }} />
          <div style={{ ...styles.corner, ...styles.cornerTR }} />
          <div style={{ ...styles.corner, ...styles.cornerBL }} />
          <div style={{ ...styles.corner, ...styles.cornerBR }} />
          <div style={styles.crosshairH} />
          <div style={styles.crosshairV} />
        </div>

        <div style={styles.hintContainer}>
          <h3 style={styles.title}>Posicione o QR Code</h3>
          <p style={styles.subtitle}>
            Aponte a câmera para a etiqueta patrimonial para abrir a ficha do
            material instantaneamente.
          </p>
        </div>
      </div>
    </div>
  );
}

// ====================== ESTILOS ======================
const styles = {
  container: {
    position: "relative",
    width: "100%",
    height: "100vh",
    backgroundColor: "#000000",
    overflow: "hidden",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#0f172a",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #334155",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  // Permissão
  permissionContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#0f172a",
    padding: 24,
    textAlign: "center",
  },
  permissionIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    border: "1px solid rgba(56, 189, 248, 0.25)",
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 1.5,
    marginBottom: 32,
    maxWidth: 290,
  },
  permissionButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563eb",
    height: 50,
    width: "100%",
    maxWidth: 280,
    borderRadius: 14,
    border: "none",
    cursor: "pointer",
    marginBottom: 12,
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
  },
  permissionButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 700,
  },
  secondaryButton: {
    background: "transparent",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
  },
  secondaryButtonText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: 600,
  },

  // Controles superiores
  topControls: {
    position: "absolute",
    top: 24,
    left: 16,
    right: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20,
  },
  iconCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    cursor: "pointer",
  },
  iconCircleBtnActive: {
    backgroundColor: "rgba(245, 158, 11, 0.25)",
    border: "1px solid #f59e0b",
  },
  topCenterTitleBox: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    padding: "8px 14px",
    borderRadius: 20,
    border: "1px solid rgba(255, 255, 255, 0.15)",
  },
  topCenterTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.4,
  },

  // Overlay
  overlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    pointerEvents: "none", // deixa a câmera clicável por baixo
    zIndex: 10,
  },
  targetFrame: {
    width: 240,
    height: 240,
    position: "relative",
    marginBottom: 32,
  },
  corner: {
    position: "absolute",
    width: 26,
    height: 26,
    borderColor: "#38bdf8",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTop: "3.5px solid #38bdf8",
    borderLeft: "3.5px solid #38bdf8",
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTop: "3.5px solid #38bdf8",
    borderRight: "3.5px solid #38bdf8",
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottom: "3.5px solid #38bdf8",
    borderLeft: "3.5px solid #38bdf8",
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottom: "3.5px solid #38bdf8",
    borderRight: "3.5px solid #38bdf8",
    borderBottomRightRadius: 10,
  },
  crosshairH: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 20,
    height: 1.5,
    backgroundColor: "rgba(56, 189, 248, 0.4)",
  },
  crosshairV: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    height: 20,
    width: 1.5,
    backgroundColor: "rgba(56, 189, 248, 0.4)",
  },
  hintContainer: {
    textAlign: "center",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    padding: "14px 20px",
    borderRadius: 16,
    maxWidth: 300,
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  title: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 800,
    margin: 0,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 12.5,
    margin: "4px 0 0 0",
    lineHeight: 1.4,
  },
};