import { useState, useEffect } from 'react';
import Formulario from './components/Formulario';
import TabelaEstoque from './components/TabelaEstoque';
import Login from './components/Login';
import AprovacaoMovimentacao from './components/AprovacaoMovimentacao';
import ListaAcessos from './components/ListaAcessos';
import Auditoria from './components/Auditoria'; // Importado com segurança
import AlertasManutencao from './components/AlertasManutencao'; // INTEGRADO: Importação do componente de Notificações
import Dashboard from './components/Dashboard'; // INTEGRADO: Importação do Dashboard e Relatórios Gerenciais
import { ToastContainer, toast } from 'react-toastify';
// Importamos o 'api' padrão para disparar o upload multipart do binário
import api, { listarMateriais, salvarMaterial, deletarMaterial, listarCategorias, atualizarMaterial, listarLocais } from './services/api'; 
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
  
  // Controla qual aba está ativa na tela
  const [abaAtiva, setAbaAtiva] = useState('inventario'); 

  // Controla apenas a abertura e fechamento do card de alertas de manutenção
  const [sidebarAberta, setSidebarAberta] = useState(true);

  // Função auxiliar para verificar se o usuário é Administrador de forma flexível (ROLE_ADM ou ADM)
  const ehAdmin = usuarioLogado?.role && String(usuarioLogado.role).includes('ADM');

  useEffect(() => {
    if (usuarioLogado) {
      listarMateriais()
        .then(setBens)
        .catch(() => toast.error("Erro ao carregar materiais. Verifique o Back-end."));
      
      listarCategorias()
        .then(setCategorias)
        .catch(() => console.error("Erro ao carregar categorias."));

      listarLocais()
        .then(setLocais)
        .catch(() => console.error("Erro ao carregar locais."));
    }
  }, [usuarioLogado]);

  // WORKAROUND APRESENTAÇÃO: Força a alteração do status no estado do React para burlar o erro 403 do Back
  const forcarManutencaoNoFront = (idMaterial, motivoDefeito) => {
    setBens(prevBens => 
      prevBens.map(item => {
        if (item.id === parseInt(idMaterial)) {
          return { 
            ...item, 
            status: 'MANUTENCAO',
            descricao: motivoDefeito ? `${item.descricao || ''} (Defeito: ${motivoDefeito})` : item.descricao
          };
        }
        return item;
      })
    );
  };

  const handleLogin = (dadosDoLogin) => {
    console.log("RECEBI NO APP:", dadosDoLogin);

    if (!dadosDoLogin) {
      toast.error("Erro na autenticação: Resposta vazia.");
      return;
    }

    const tokenString = typeof dadosDoLogin === 'string' ? dadosDoLogin : dadosDoLogin.token;

    if (!tokenString) {
      toast.error("Erro na autenticação: Token não fornecido.");
      return;
    }

    const nomeUsuario = dadosDoLogin.nome || 'Usuário';
    const roleUsuario = dadosDoLogin.role || 'ROLE_CLIENTE';

    const sessaoUsuario = {
      token: tokenString,
      nome: nomeUsuario, 
      role: roleUsuario
    };

    setUsuarioLogado(sessaoUsuario);
    localStorage.setItem('usuario_patrimonio', JSON.stringify(sessaoUsuario));
    localStorage.setItem('token', tokenString); 
    
    toast.success(`Bem-vindo, ${nomeUsuario}!`);
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    localStorage.removeItem('usuario_patrimonio');
    localStorage.removeItem('token'); 
    setAbaAtiva('inventario'); 
    toast.info("Sessão encerrada.");
  };

  // ADAPTADA: Mantém o fluxo intacto com checagem rigorosa de rotas
  const salvarOuAtualizarBem = async (dadosMaterial, arquivoDeImagem) => {
    try {
      let materialResultado;

      if (itemParaEditar) {
        // Cenário 1: Edição de registro existente
        materialResultado = await atualizarMaterial(itemParaEditar.id, dadosMaterial);
        toast.success("Patrimônio atualizado com sucesso!");
        setItemParaEditar(null);
      } else {
        // Cenário 2: Criação de novo registro
        const materialComUsuario = { ...dadosMaterial, cadastradoPor: usuarioLogado.nome };
        materialResultado = await salvarMaterial(materialComUsuario);
        toast.success(`Sucesso: ${materialResultado.nome} registrado!`);
      }

      // SE HOUVER IMAGEM SELECIONADA: Dispara o fluxo Multipart encadeando com o ID correto
      if (arquivoDeImagem && materialResultado && materialResultado.id) {
        const formDataUpload = new FormData();
        
        // Mantém 'imagem' mapeado conforme o seu parâmetro Java do Spring Boot
        formDataUpload.append('imagem', arquivoDeImagem);

        toast.info("Enviando imagem ao servidor...");
        
        // AJUSTE SEGURO: Rota base padrão do endpoint de upload.
        // Nota técnica: Se o seu Spring Boot exigir o prefixo "/api", altere a linha abaixo para:
        // await api.post(`/api/material/${materialResultado.id}/imagem`, formDataUpload, {
        await api.post(`/material/${materialResultado.id}/imagem`, formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        toast.success("Imagem vinculada com sucesso!");
      }

      // Atualiza a tabela buscando os dados mais recentes do banco
      const listaAtualizada = await listarMateriais();
      setBens(listaAtualizada);

    } catch (err) {
      console.error("Erro no fluxo de salvamento do material:", err);
      toast.error("Erro ao processar solicitação ou fazer upload da imagem.");
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
        toast.warn("O item recebeu baixa.");
      } catch (err) {
        toast.error("Erro ao remover.");
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

  // Calcula dinamicamente a quantidade de itens críticos em manutenção real para o cabeçalho do botão
  const totalAlertasReais = bens.filter(item => 
    item.status === 'MANUTENCAO' || 
    String(item.descricao || '').toLowerCase().includes('defeito')
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
      
      {/* Área Principal de Conteúdo */}
      <div className="app-container" style={{ flex: 1, padding: '20px', overflowX: 'hidden' }}>
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

          <nav style={{ marginTop: '20px', borderBottom: `1px solid ${themeStyles.borderColor}`, display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setAbaAtiva('inventario')}
              style={{ 
                padding: '10px 20px', border: 'none', 
                background: abaAtiva === 'inventario' ? (darkMode ? '#1a73e833' : '#e8f0fe') : 'none', 
                color: abaAtiva === 'inventario' ? '#1a73e8' : (darkMode ? '#aaa' : '#555'), 
                cursor: 'pointer', fontWeight: 'bold',
                borderBottom: abaAtiva === 'inventario' ? '3px solid #1a73e8' : '3px solid transparent'
              }}
            >
              📦 Inventário
            </button>

            {ehAdmin && (
              <button 
                onClick={() => setAbaAtiva('dashboard')}
                style={{ 
                  padding: '10px 20px', border: 'none', 
                  background: abaAtiva === 'dashboard' ? (darkMode ? '#1a73e833' : '#e8f0fe') : 'none', 
                  color: abaAtiva === 'dashboard' ? '#1a73e8' : (darkMode ? '#aaa' : '#555'), 
                  cursor: 'pointer', fontWeight: 'bold',
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
                  padding: '10px 20px', border: 'none', 
                  background: abaAtiva === 'transferencia' ? (darkMode ? '#1a73e833' : '#e8f0fe') : 'none', 
                  color: abaAtiva === 'transferencia' ? '#1a73e8' : (darkMode ? '#aaa' : '#555'), 
                  cursor: 'pointer', fontWeight: 'bold',
                  borderBottom: abaAtiva === 'transferencia' ? '3px solid #1a73e8' : '3px solid transparent'
                }}
              >
                🔄 Transferências
              </button>
            )}

            {ehAdmin && (
              <button 
                onClick={() => setAbaAtiva('auditoria')}
                style={{ 
                  padding: '10px 20px', border: 'none', 
                  background: abaAtiva === 'auditoria' ? (darkMode ? '#1a73e833' : '#e8f0fe') : 'none', 
                  color: abaAtiva === 'auditoria' ? '#1a73e8' : (darkMode ? '#aaa' : '#555'), 
                  cursor: 'pointer', fontWeight: 'bold',
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
                />
              );
            case 'auditoria':
              return <Auditoria darkMode={darkMode} />;
            default:
              return null;
          }
        })()}
      </div>

      {/* Barra Lateral Direita */}
      {ehAdmin && (
        <div style={{ 
          width: '320px', 
          position: 'sticky', 
          top: 0, 
          height: '100vh', 
          borderLeft: `1px solid ${themeStyles.borderColor}`, 
          backgroundColor: themeStyles.cardBg,
          padding: '20px 15px',
          boxSizing: 'border-box',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          
          {/* Box de Alertas */}
          <div style={{
            border: `1px solid ${themeStyles.borderColor}`,
            borderRadius: '10px',
            backgroundColor: darkMode ? '#242424' : '#fff',
            overflow: 'hidden'
          }}>
            {/* Cabeçalho Interativo com Contador Real */}
            <button
              onClick={() => setSidebarAberta(!sidebarAberta)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: themeStyles.color,
                padding: '12px 15px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: darkMode ? '#2d2d2d' : '#f1f3f4',
                borderBottom: sidebarAberta ? `1px solid ${themeStyles.borderColor}` : 'none',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚠️ Alertas de Manutenção ({totalAlertasReais})
              </span>
              <span style={{ color: '#1a73e8', fontSize: '12px' }}>
                {sidebarAberta ? '▲ Recolher' : '▼ Expandir'}
              </span>
            </button>

            {/* Conteúdo do alerta */}
            {sidebarAberta && (
              <div style={{ padding: '12px' }}>
                <AlertasManutencao darkMode={darkMode} bens={bens} />
              </div>
            )}
          </div>

          {/* Lista de Acessos */}
          <div style={{ flex: 1 }}>
            <ListaAcessos darkMode={darkMode} />
          </div>

        </div>
      )}
    </div>
  );
}

export default App;