import { useState, useEffect } from 'react';
import Formulario from './components/Formulario';
import TabelaEstoque from './components/TabelaEstoque';
import Login from './components/Login';
import ListaAcessos from './components/ListaAcessos';
import Auditoria from './components/Auditoria'; 
import { ToastContainer, toast } from 'react-toastify';
import { listarMateriais, salvarMaterial, deletarMaterial, listarCategorias, atualizarMaterial } from './services/api'; 
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    const salvo = localStorage.getItem('usuario_patrimonio');
    return salvo ? JSON.parse(salvo) : null;
  });

  const [darkMode, setDarkMode] = useState(false);
  const [bens, setBens] = useState([]);
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('estoque'); 
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [itemParaEditar, setItemParaEditar] = useState(null);

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
    localStorage.removeItem('token'); // Limpa o token JWT por segurança
    toast.info("Sessão encerrada.");
  };

  const salvarOuAtualizarBem = async (dadosMaterial) => {
    try {
      if (itemParaEditar) {
        // Modo Edição
        const atualizado = await atualizarMaterial(itemParaEditar.id, dadosMaterial);
        setBens(bens.map(b => b.id === itemParaEditar.id ? atualizado : b));
        toast.success("Patrimônio atualizado com sucesso!");
        setItemParaEditar(null);
      } else {
        // Modo Cadastro
        const materialComUsuario = { ...dadosMaterial, cadastradoPor: usuarioLogado.nome };
        const novo = await salvarMaterial(materialComUsuario);
        setBens(prev => [...prev, novo]);
        toast.success(`Sucesso: ${novo.nome} registrado!`);
      }
    } catch (err) {
      toast.error("Erro ao processar solicitação no servidor.");
    }
  };

  const prepararEdicao = (item) => {
    setItemParaEditar(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Filtros ajustados conforme a resposta de objetos do Java
  const materiaisFiltrados = bens.filter(b => {
    const matchBusca = b.nome?.toLowerCase().includes(busca.toLowerCase()) ||
                       b.descricao?.toLowerCase().includes(busca.toLowerCase());
    
    // Alinhado para ler b.categoria.id vindo do Spring Boot
    const matchCategoria = filtroCategoria === '' || b.categoria?.id === parseInt(filtroCategoria);
    
    // Mantido o filtro de local (verifique se o back manda local como id ou string dps)
    const matchLocal = filtroLocal === '' || b.local === filtroLocal || b.localId === parseInt(filtroLocal);
    
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
            
            {/* Trava corrigida de cargo -> role para o menu do ADM */}
            {usuarioLogado.role === 'ROLE_ADM' && (
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
            {/* Trava de renderização para o Formulário: apenas ADM pode cadastrar ou editar */}
            {usuarioLogado.role === 'ROLE_ADM' && (
              <Formulario 
                aoAdicionar={salvarOuAtualizarBem} 
                itemParaEditar={itemParaEditar} 
                cancelarEdicao={() => setItemParaEditar(null)}
                darkMode={darkMode} 
              />
            )}
            
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
                  <option value="TI">TI</option>
                  <option value="Escritório">Escritório</option>
                  <option value="Recepção">Recepção</option>
                </select>
              </div>

              <TabelaEstoque 
                materiais={materiaisFiltrados} 
                aoRemover={removerBem} 
                aoEditar={prepararEdicao} 
                darkMode={darkMode} 
                usuarioLogado={usuarioLogado} // Passado para ocultar os botões se for CLIENTE
              />
            </div>
          </>
        ) : (
          <Auditoria darkMode={darkMode} />
        )}
      </div>

      {/* Trava corrigida de cargo -> role para a Lista do LoL */}
      {usuarioLogado.role === 'ROLE_ADM' && (
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