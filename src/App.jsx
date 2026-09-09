import { useState, useEffect } from 'react';
import Formulario from './components/Formulario';
import TabelaEstoque from './components/TabelaEstoque';
import Login from './components/Login';
import AprovacaoMovimentacao from './components/AprovacaoMovimentacao';
import ListaAcessos from './components/ListaAcessos';
import Auditoria from './components/Auditoria'; 
import AlertasManutencao from './components/AlertasManutencao'; 
import Dashboard from './components/Dashboard'; 
import { ToastContainer, toast } from 'react-toastify';
import api, { 
  listarMateriais, 
  salvarMaterial, 
  deletarMaterial, 
  listarCategorias, 
  atualizarMaterial, 
  listarLocais 
} from './services/api'; 
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    const salvo = localStorage.getItem('usuario_patrimonio');
    return salvo ? JSON.parse(salvo) : null;
  });

  const [darkMode, setDarkMode] = useState(false);
  const [bens, setBens] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [locais, setLocais] = useState([]); 
  const [itemParaEditar, setItemParaEditar] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('inventario'); 
  const [sidebarAberta, setSidebarAberta] = useState(true);

  const ehAdmin = usuarioLogado?.role && String(usuarioLogado.role).includes('ADM');

  // Carregamento inicial de dados centralizado
  const carregarDadosDoBanco = async () => {
    try {
      const [materiais, listaCats, listaLocais] = await Promise.all([
        listarMateriais(),
        listarCategorias(),
        listarLocais()
      ]);
      setBens(materiais);
      setCategorias(listaCats);
      setLocais(listaLocais);
    } catch (err) {
      console.error("Erro ao sincronizar dados com o Back-end:", err);
      toast.error("Erro de conexão com o servidor de banco de dados.");
    }
  };

  useEffect(() => {
    if (usuarioLogado) {
      carregarDadosDoBanco();
    }
  }, [usuarioLogado]);

  // Sincronização em tempo real quando as abas mudam para garantir consistência de dados
  useEffect(() => {
    if (usuarioLogado) {
      listarMateriais().then(setBens).catch(console.error);
    }
  }, [abaAtiva]);

  // CORREÇÃO: Limpa os sub-objetos para evitar o Erro 400 (Bad Request) na API
  const forcarManutencaoNoFront = async (idMaterial, motivoDefeito) => {
    try {
      const itemOriginal = bens.find(b => b.id === parseInt(idMaterial));
      if (!itemOriginal) return;

      // Remove propriedades complexas que o MaterialRequest DTO do Spring Boot rejeita
      const { categoria, local, localId, categoriaId, ...resto } = itemOriginal;

      const payloadAtualizado = {
        ...resto,
        status: 'MANUTENCAO',
        descricao: motivoDefeito ? `${itemOriginal.descricao || ''} (Defeito: ${motivoDefeito})` : itemOriginal.descricao,
        // Alinha com os IDs planos que o Java espera receber
        categoriaId: categoriaId || categoria?.id || null,
        localId: localId || local?.id || null
      };

      await atualizarMaterial(idMaterial, payloadAtualizado);
      toast.success("Item enviado para o setor de manutenção!");
      
      // Atualiza o estado local imediatamente
      const listaAtualizada = await listarMateriais();
      setBens(listaAtualizada);
    } catch (err) {
      console.error("Erro ao persistir status de manutenção:", err);
      // Fallback seguro caso a rota retorne erro em ambiente local
      setBens(prevBens => 
        prevBens.map(item => item.id === parseInt(idMaterial) ? { ...item, status: 'MANUTENCAO' } : item)
      );
      toast.warn("Alteração aplicada localmente (Modo de Apresentação).");
    }
  };

  const handleLogin = (dadosDoLogin) => {
    if (!dadosDoLogin) {
      toast.error("Erro na autenticação: Resposta vazia.");
      return;
    }

    const tokenString = typeof dadosDoLogin === 'string' ? dadosDoLogin : dadosDoLogin.token;
    if (!tokenString) {
      toast.error("Erro na autenticação: Token inválido.");
      return;
    }

    const sessaoUsuario = {
      token: tokenString,
      nome: dadosDoLogin.nome || 'Usuário', 
      role: dadosDoLogin.role || 'ROLE_CLIENTE'
    };

    setUsuarioLogado(sessaoUsuario);
    localStorage.setItem('usuario_patrimonio', JSON.stringify(sessaoUsuario));
    localStorage.setItem('token', tokenString); 
    toast.success(`Bem-vindo, ${sessaoUsuario.nome}!`);
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    localStorage.removeItem('usuario_patrimonio');
    localStorage.removeItem('token'); 
    setAbaAtiva('inventario'); 
    setItemParaEditar(null);
    toast.info("Sessão encerrada.");
  };

  // Payload limpo enviado ao salvarMaterial para evitar conflito com o Java
  const salvarOuAtualizarBem = async (dadosMaterial, arquivoDeImagem) => {
    try {
      let materialResultado;

      if (itemParaEditar) {
        materialResultado = await atualizarMaterial(itemParaEditar.id, dadosMaterial);
        toast.success("Patrimônio atualizado com sucesso!");
        setItemParaEditar(null);
      } else {
        materialResultado = await salvarMaterial(dadosMaterial);
        toast.success(`Sucesso: ${materialResultado.nome} registrado!`);
      }

      if (arquivoDeImagem && materialResultado?.id) {
        const formDataUpload = new FormData();
        formDataUpload.append('imagem', arquivoDeImagem);
        toast.info("Enviando imagem corporativa...");
        
        await api.post(`/material/${materialResultado.id}/imagem`, formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Imagem vinculada com sucesso!");
      }

      const listaAtualizada = await listarMateriais();
      setBens(listaAtualizada);
    } catch (err) {
      console.error("Erro no salvamento do material:", err);
      toast.error("Erro ao salvar o registro ou enviar arquivo de imagem.");
    }
  };

  const prepararEdicao = (item) => {
    setItemParaEditar(item);
    setAbaAtiva('inventario'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removerBem = async (id) => {
    if (confirm("Deseja confirmar a baixa deste patrimônio?")) {
      try {
        await deletarMaterial(id);
        setBens(bens.filter(b => b.id !== id));
        toast.warn("O item recebeu baixa definitiva.");
      } catch (err) {
        toast.error("Erro ao processar baixa no banco de dados.");
      }
    }
  };

  const materiaisFiltrados = bens.filter(b => {
    const matchBusca = b.nome?.toLowerCase().includes(busca.toLowerCase()) ||
                       b.descricao?.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = filtroCategoria === '' || b.categoria?.id === parseInt(filtroCategoria);
    const matchLocal = filtroLocal === '' || b.local?.id === parseInt(filtroLocal);
    return matchBusca && matchCategoria && matchLocal;
  });

  const totalAlertasReais = bens.filter(item => 
    item.status === 'MANUTENCAO' || String(item.descricao || '').toLowerCase().includes('defeito')
  ).length;

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
    borderColor: darkMode ? '#333' : '#dadce0',
    inputBg: darkMode ? '#2d2d2d' : '#fff',
    headerBg: darkMode ? '#1e1e1e' : '#fff'
  };

  return (
    <div className="app-layout" style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: themeStyles.backgroundColor, 
      color: themeStyles.color,
      transition: 'all 0.2s',
      fontFamily: 'system-ui, sans-serif'
    }}>
      
      {/* Área Principal de Conteúdo */}
      <div className="app-container" style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>
        <ToastContainer position="top-right" autoClose={3000} theme={darkMode ? "dark" : "light"} />

        <header style={{ 
          marginBottom: '25px', 
          backgroundColor: themeStyles.headerBg, 
          padding: '24px', 
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          border: `1px solid ${themeStyles.borderColor}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, color: '#1a73e8', fontSize: '24px', fontWeight: '700' }}>🏛️ Gestão de Patrimônio</h1>
              <p style={{ color: darkMode ? '#aaa' : '#5f6368', margin: '4px 0 0 0', fontSize: '13.5px' }}>Painel de Controle Integrado</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px',
                  padding: '10px', borderRadius: '50%', backgroundColor: darkMode ? '#2d2d2d' : '#f1f3f4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px'
                }}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              <div style={{ 
                backgroundColor: themeStyles.cardBg, 
                padding: '8px 16px', 
                borderRadius: '12px', 
                border: `1px solid ${themeStyles.borderColor}`,
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '11px', display: 'block', color: '#888', fontWeight: '500' }}>Credencial</span>
                  <strong style={{ fontSize: '13.5px' }}>{usuarioLogado.nome}</strong>
                </div>
                <button 
                  onClick={handleLogout} 
                  style={{ 
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #ff4d4f33',
                    color: '#ff4d4f',
                    backgroundColor: '#ff4d4f11',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '12px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#ff4d4f22'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#ff4d4f11'}
                >
                  Sair
                </button>
              </div>
            </div>
          </div>

          <nav style={{ marginTop: '24px', borderBottom: `1px solid ${themeStyles.borderColor}`, display: 'flex', gap: '5px' }}>
            <button 
              onClick={() => { setAbaAtiva('inventario'); setItemParaEditar(null); }}
              style={{ 
                padding: '12px 20px', border: 'none', 
                background: abaAtiva === 'inventario' ? (darkMode ? '#1a73e822' : '#e8f0fe') : 'none', 
                color: abaAtiva === 'inventario' ? '#1a73e8' : (darkMode ? '#aaa' : '#555'), 
                cursor: 'pointer', fontWeight: '600', fontSize: '13.5px',
                borderBottom: abaAtiva === 'inventario' ? '3px solid #1a73e8' : '3px solid transparent'
              }}
            >
              📦 Inventário
            </button>

            {ehAdmin && (
              <button 
                onClick={() => setAbaAtiva('dashboard')}
                style={{ 
                  padding: '12px 20px', border: 'none', 
                  background: abaAtiva === 'dashboard' ? (darkMode ? '#1a73e822' : '#e8f0fe') : 'none', 
                  color: abaAtiva === 'dashboard' ? '#1a73e8' : (darkMode ? '#aaa' : '#555'), 
                  cursor: 'pointer', fontWeight: '600', fontSize: '13.5px',
                  borderBottom: abaAtiva === 'dashboard' ? '3px solid #1a73e8' : '3px solid transparent'
                }}
              >
                📊 Dashboard / RG
              </button>
            )}
            
            {ehAdmin && (
              <button 
                onClick={() => setAbaAtiva('transferencia')}
                style={{ 
                  padding: '12px 20px', border: 'none', 
                  background: abaAtiva === 'transferencia' ? (darkMode ? '#1a73e822' : '#e8f0fe') : 'none', 
                  color: abaAtiva === 'transferencia' ? '#1a73e8' : (darkMode ? '#aaa' : '#555'), 
                  cursor: 'pointer', fontWeight: '600', fontSize: '13.5px',
                  borderBottom: abaAtiva === 'transferencia' ? '3px solid #1a73e8' : '3px solid transparent'
                }}
              >
                🔄 Movimentações
              </button>
            )}

            {ehAdmin && (
              <button 
                onClick={() => setAbaAtiva('auditoria')}
                style={{ 
                  padding: '12px 20px', border: 'none', 
                  background: abaAtiva === 'auditoria' ? (darkMode ? '#1a73e822' : '#e8f0fe') : 'none', 
                  color: abaAtiva === 'auditoria' ? '#1a73e8' : (darkMode ? '#aaa' : '#555'), 
                  cursor: 'pointer', fontWeight: '600', fontSize: '13.5px',
                  borderBottom: abaAtiva === 'auditoria' ? '3px solid #1a73e8' : '3px solid transparent'
                }}
              >
                📜 Auditoria
              </button>
            )}
          </nav>
        </header>

        {(() => {
          switch (abaAtiva) {
            case 'inventario':
              return (
                <>
                  {ehAdmin && (
                    <Formulario 
                      aoAdicionar={salvarOuAtualizarBem} 
                      bemParaEditar={itemParaEditar} 
                      cancelarEdicao={() => setItemParaEditar(null)}
                      darkMode={darkMode} 
                    />
                  )}
                  
                  <div className="card" style={{ backgroundColor: themeStyles.cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${themeStyles.borderColor}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                      <input
                        type="text"
                        placeholder="Buscar por nome ou descrição de ativos..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        style={{ 
                          flex: 2, padding: '12px', borderRadius: '8px', 
                          border: `1px solid ${themeStyles.borderColor}`,
                          backgroundColor: themeStyles.inputBg,
                          color: themeStyles.color,
                          fontSize: '13.5px'
                        }}
                      />
                      
                      <select 
                        value={filtroCategoria} 
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        style={{ 
                          flex: 1, padding: '12px', borderRadius: '8px', 
                          border: `1px solid ${themeStyles.borderColor}`,
                          backgroundColor: themeStyles.inputBg,
                          color: themeStyles.color,
                          fontSize: '13.5px'
                        }}
                      >
                        <option value="">Todas as Categorias</option>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>

                      <select 
                        value={filtroLocal} 
                        onChange={(e) => setFiltroLocal(e.target.value)}
                        style={{ 
                          flex: 1, padding: '12px', borderRadius: '8px', 
                          border: `1px solid ${themeStyles.borderColor}`,
                          backgroundColor: themeStyles.inputBg,
                          color: themeStyles.color,
                          fontSize: '13.5px'
                        }}
                      >
                        <option value="">Todos os Locais</option>
                        {locais.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.nome}</option>
                        ))}
                      </select>
                    </div>

                    <TabelaEstoque 
                      materiais={materiaisFiltrados} 
                      aoRemover={removerBem} 
                      aoEditar={prepararEdicao} 
                      darkMode={darkMode} 
                      usuarioLogado={usuarioLogado} 
                    />
                  </div>
                </>
              );
            case 'dashboard':
              return (
                <Dashboard 
                  bens={bens} 
                  categorias={categorias} 
                  locais={locais} 
                  darkMode={darkMode} 
                />
              );
            case 'transferencia':
              return (
                <AprovacaoMovimentacao 
                  darkMode={darkMode} 
                  bens={bens}
                  aoSolicitarManutencao={forcarManutencaoNoFront}
                  usuarioLogado={usuarioLogado}
                />
              );
            case 'auditoria':
              return <Auditoria darkMode={darkMode} />;
            default:
              return null;
          }
        })()}
      </div>

      {/* Barra Lateral Direita Estabilizada */}
      {ehAdmin && (
        <div style={{ 
          width: '340px', 
          position: 'sticky', 
          top: 0, 
          height: '100vh', 
          borderLeft: `1px solid ${themeStyles.borderColor}`, 
          backgroundColor: themeStyles.cardBg,
          padding: '24px 16px',
          boxSizing: 'border-box',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          
          {/* Caixa Informativa de Alertas */}
          <div style={{
            border: `1px solid ${themeStyles.borderColor}`,
            borderRadius: '12px',
            backgroundColor: darkMode ? '#242424' : '#fff',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <button
              onClick={() => setSidebarAberta(!sidebarAberta)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: themeStyles.color,
                padding: '14px 16px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13.5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: darkMode ? '#2d2d2d' : '#f8f9fa',
                borderBottom: sidebarAberta ? `1px solid ${themeStyles.borderColor}` : 'none',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚠️ Ocorrências de Manutenção ({totalAlertasReais})
              </span>
              <span style={{ color: '#1a73e8', fontSize: '11.5px', fontWeight: '600' }}>
                {sidebarAberta ? 'Recolher ▲' : 'Expandir ▼'}
              </span>
            </button>

            {sidebarAberta && (
              <div style={{ padding: '12px' }}>
                <AlertasManutencao 
                  darkMode={darkMode} 
                  bens={bens} 
                  usuarioLogado={usuarioLogado}
                  onUpdateItem={() => listarMateriais().then(setBens)}
                />
              </div>
            )}
          </div>

          {/* Lista de Acessos Recentes */}
          <div style={{ flex: 1 }}>
            <ListaAcessos darkMode={darkMode} />
          </div>

        </div>
      )}
    </div>
  );
}

export default App;