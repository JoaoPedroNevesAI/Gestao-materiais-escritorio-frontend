import { useState, useEffect } from 'react';
import Formulario from './components/Formulario';
import TabelaEstoque from './components/TabelaEstoque';
import Login from './components/Login';
import ListaAcessos from './components/ListaAcessos';
import Auditoria from './components/Auditoria'; 
import { ToastContainer, toast } from 'react-toastify';
import { listarMateriais, salvarMaterial, deletarMaterial, listarCategorias } from './services/api';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  // 1. ESTADO DE LOGIN COM PERSISTÊNCIA
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    const salvo = localStorage.getItem('usuario_patrimonio');
    return salvo ? JSON.parse(salvo) : null;
  });

  // Novos estados para Dark Mode e filtros
  const [darkMode, setDarkMode] = useState(false);
  const [bens, setBens] = useState([]);
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('estoque'); 
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('');
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    if (usuarioLogado) {
      listarMateriais()
        .then(setBens)
        .catch(() => toast.error("Erro ao carregar materiais. Verifique o Back-end."));
      
      listarCategorias()
        .then(setCategorias)
        .catch(() => console.error("Erro ao carregar categorias."));
    }
  }, [usuarioLogado]);

  const handleLogin = (dados) => {
    setUsuarioLogado(dados);
    localStorage.setItem('usuario_patrimonio', JSON.stringify(dados));
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    localStorage.removeItem('usuario_patrimonio');
    toast.info("Sessão encerrada.");
  };

  const aoAdicionarBemNoBanco = async (material) => {
    try {
      const materialComUsuario = { ...material, cadastradoPor: usuarioLogado.nome };
      const novo = await salvarMaterial(materialComUsuario);
      setBens(prev => [...prev, novo]);
      toast.success(`Sucesso: ${novo.nome} registrado!`);
    } catch (err) {
      toast.error("Erro ao salvar no servidor.");
    }
  };

  const removerBem = async (id) => {
    if (confirm("Deseja confirmar a baixa deste patrimônio?")) {
      try {
        await deletarMaterial(id);
        setBens(bens.filter(b => b.id !== id));
        toast.warn("O item recebeu baixa.");
      } catch (err) {
        toast.error("Erro ao remover.");
      }
    }
  };

  const materiaisFiltrados = bens.filter(b => {
    const matchBusca = b.nome?.toLowerCase().includes(busca.toLowerCase()) ||
                       b.descricao?.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = filtroCategoria === '' || b.categoriaId === parseInt(filtroCategoria);
    const matchLocal = filtroLocal === '' || b.localId === parseInt(filtroLocal);
    return matchBusca && matchCategoria && matchLocal;
  });

  if (!usuarioLogado) {
    return (
      <>
        <ToastContainer position="top-center" autoClose={3000} theme="colored" />
        <Login aoLogar={handleLogin} />
      </>
    );
  }

  // Definição de cores para o Dark Mode
  const themeStyles = {
    backgroundColor: darkMode ? '#121212' : '#f8f9fa',
    color: darkMode ? '#e0e0e0' : '#333',
    cardBg: darkMode ? '#1e1e1e' : '#fff',
    borderColor: darkMode ? '#333' : '#ddd',
    inputBg: darkMode ? '#2d2d2d' : '#fff',
    headerBg: darkMode ? '#1e1e1e' : '#fff'
  };

  return (
    <div className="app-layout" style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: themeStyles.backgroundColor, 
      color: themeStyles.color,
      transition: 'all 0.2s'
    }}>
      
      <div className="app-container" style={{ flex: 1, padding: '20px' }}>
        <ToastContainer position="top-right" autoClose={3000} theme={darkMode ? "dark" : "light"} />

        <header style={{ 
          marginBottom: '30px', 
          backgroundColor: themeStyles.headerBg, 
          padding: '20px', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, color: '#1a73e8' }}>🏛️ Gestão de Patrimônio</h1>
              <p style={{ color: darkMode ? '#aaa' : '#5f6368', margin: '5px 0 0 0' }}>Painel Administrativo Web</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* Toggle Dark Mode */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px',
                  padding: '10px', borderRadius: '50%', backgroundColor: darkMode ? '#333' : '#eee'
                }}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              <div style={{ 
                textAlign: 'right', 
                backgroundColor: themeStyles.cardBg, 
                padding: '10px 15px', 
                borderRadius: '8px', 
                border: `1px solid ${themeStyles.borderColor}`,
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div>
                  <span style={{ fontSize: '12px', display: 'block', color: '#888' }}>Usuário</span>
                  <strong>{usuarioLogado.nome}</strong>
                </div>
                <button 
                  onClick={handleLogout} 
                  style={{ 
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ff4d4f',
                    color: '#ff4d4f',
                    background: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Sair
                </button>
              </div>
            </div>
          </div>

          <nav style={{ marginTop: '20px', borderBottom: `1px solid ${themeStyles.borderColor}` }}>
            <button 
              onClick={() => setAbaAtiva('estoque')}
              style={{ 
                padding: '10px 20px', border: 'none', 
                background: abaAtiva === 'estoque' ? (darkMode ? '#1a73e833' : '#e8f0fe') : 'none', 
                color: abaAtiva === 'estoque' ? '#1a73e8' : (darkMode ? '#aaa' : '#5f6368'), 
                cursor: 'pointer', fontWeight: 'bold',
                borderBottom: abaAtiva === 'estoque' ? '3px solid #1a73e8' : 'none'
              }}
            >
              📦 Inventário
            </button>
            
            {usuarioLogado.cargo === 'ADM' && (
              <button 
                onClick={() => setAbaAtiva('logs')}
                style={{ 
                  padding: '10px 20px', border: 'none', 
                  background: abaAtiva === 'logs' ? (darkMode ? '#1a73e833' : '#e8f0fe') : 'none', 
                  color: abaAtiva === 'logs' ? '#1a73e8' : (darkMode ? '#aaa' : '#5f6368'), 
                  cursor: 'pointer', fontWeight: 'bold',
                  borderBottom: abaAtiva === 'logs' ? '3px solid #1a73e8' : 'none'
                }}
              >
                📜 Auditoria
              </button>
            )}
          </nav>
        </header>

        {abaAtiva === 'estoque' ? (
          <>
            <Formulario aoAdicionar={aoAdicionarBemNoBanco} darkMode={darkMode} />
            
            <div className="card" style={{ backgroundColor: themeStyles.cardBg, padding: '20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Buscar por nome ou descrição..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  style={{ 
                    flex: 2, padding: '10px', borderRadius: '8px', 
                    border: `1px solid ${themeStyles.borderColor}`,
                    backgroundColor: themeStyles.inputBg,
                    color: themeStyles.color
                  }}
                />
                
                <select 
                  value={filtroCategoria} 
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', 
                    border: `1px solid ${themeStyles.borderColor}`,
                    backgroundColor: themeStyles.inputBg,
                    color: themeStyles.color
                  }}
                >
                  <option value="">Todas Categorias</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>

                <select 
                  value={filtroLocal} 
                  onChange={(e) => setFiltroLocal(e.target.value)}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', 
                    border: `1px solid ${themeStyles.borderColor}`,
                    backgroundColor: themeStyles.inputBg,
                    color: themeStyles.color
                  }}
                >
                  <option value="">Todos os Locais</option>
                  <option value="1">Recepção</option>
                  <option value="2">Escritório</option>
                  <option value="3">TI</option>
                </select>
              </div>

              <TabelaEstoque materiais={materiaisFiltrados} aoRemover={removerBem} podeEditar={true} darkMode={darkMode} />
            </div>
          </>
        ) : (
          <Auditoria darkMode={darkMode} />
        )}
      </div>

      {/* BARRA LATERAL (FIXA) */}
      {usuarioLogado.cargo === 'ADM' && (
        <div style={{ 
          width: '300px', 
          position: 'sticky', 
          top: 0, 
          height: '100vh', 
          borderLeft: `1px solid ${themeStyles.borderColor}`, 
          backgroundColor: themeStyles.cardBg 
        }}>
          <ListaAcessos darkMode={darkMode} />
        </div>
      )}
    </div>
  );
}

export default App;