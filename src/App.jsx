import { useState, useEffect } from 'react';
import Formulario from './components/Formulario';
import TabelaEstoque from './components/TabelaEstoque';
import Login from './components/Login';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [bens, setBens] = useState(() => {
    const salvo = localStorage.getItem('patrimonio_v1');
    return salvo ? JSON.parse(salvo) : [];
  });

  const [busca, setBusca] = useState('');

  useEffect(() => {
    localStorage.setItem('patrimonio_v1', JSON.stringify(bens));
  }, [bens]);

  const eAdmin = usuarioLogado?.cargo === 'ADM';

  const adicionarBem = (nome, valor, descricao, local, categoria) => {
    if (!eAdmin) {
      return toast.error("Acesso negado: Apenas administradores podem cadastrar bens.");
    }

    const novo = { 
      id: Date.now(), 
      nome, 
      valor: parseFloat(valor), 
      descricao,
      local,      
      categoria,  
      status: 'Ativo',
      cadastradoPor: usuarioLogado.nome 
    };
    
    setBens([...bens, novo]);
    toast.success(`Sucesso: ${nome} registrado no patrimônio!`);
  };

  const removerBem = (id) => {
    if (!eAdmin) {
      return toast.error("Acesso negado: Você não tem permissão para dar baixa em bens.");
    }

    if(confirm("Deseja confirmar a baixa deste patrimônio?")) {
      const bemRemovido = bens.find(b => b.id === id);
      setBens(bens.filter(b => b.id !== id));
      toast.warn(`O item "${bemRemovido.nome}" recebeu baixa do sistema.`);
    }
  };

  const materiaisFiltrados = bens.filter(b => 
    b.nome.toLowerCase().includes(busca.toLowerCase()) ||
    b.local.toLowerCase().includes(busca.toLowerCase()) ||
    b.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  if (!usuarioLogado) {
    return (
      <>
        <ToastContainer position="top-center" autoClose={3000} theme="colored" />
        <Login aoLogar={setUsuarioLogado} />
      </>
    );
  }

  return (
    <div className="app-container">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1a73e8' }}>🏛️ Gestão de Patrimônio</h1>
          <p style={{ color: '#5f6368', margin: '5px 0 0 0' }}>Painel Administrativo Web</p>
        </div>
        <div style={{ textAlign: 'right', backgroundColor: '#fff', padding: '10px 15px', borderRadius: '8px', border: '1px solid #dadce0' }}>
          <span style={{ fontSize: '14px', color: '#5f6368' }}>Usuário: </span>
          <strong style={{ color: '#202124' }}>{usuarioLogado.nome}</strong> 
          <span style={{ fontSize: '11px', color: '#1a73e8', marginLeft: '5px' }}>({usuarioLogado.cargo})</span>
          <button 
            onClick={() => { setUsuarioLogado(null); toast.info("Sessão encerrada."); }} 
            className="btn btn-danger" 
            style={{ marginLeft: '15px', padding: '5px 10px', fontSize: '12px' }}
          >
            Sair
          </button>
        </div>
      </header>

      {eAdmin ? (
        <Formulario aoAdicionar={adicionarBem} />
      ) : (
        <div className="card" style={{ borderLeft: '5px solid #fbbc04', backgroundColor: '#fff8e1' }}>
          <p style={{ margin: 0, color: '#856404' }}>
            <strong>Modo de Visualização:</strong> Você não tem permissão para cadastrar ou remover itens.
          </p>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
          <h3 style={{ margin: 0 }}>Inventário Geral</h3>
          <input 
            type="text" 
            placeholder="Filtrar por nome, setor ou categoria..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ flex: 1, maxWidth: '400px' }}
          />
        </div>

        <TabelaEstoque 
          materiais={materiaisFiltrados} 
          aoRemover={removerBem}
          podeEditar={eAdmin} 
        />
        
        <div style={{ 
          marginTop: '25px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px', 
          borderLeft: '5px solid #1a73e8',
          display: 'flex',
          justifyContent: 'space-around'
        }}>
          <div>
            <span style={{ color: '#5f6368', display: 'block', fontSize: '12px', textTransform: 'uppercase' }}>Total de Bens</span>
            <strong style={{ fontSize: '20px' }}>{bens.length} itens</strong>
          </div>
          <div style={{ borderLeft: '1px solid #dadce0' }}></div>
          <div>
            <span style={{ color: '#5f6368', display: 'block', fontSize: '12px', textTransform: 'uppercase' }}>Valor em Ativos</span>
            <strong style={{ fontSize: '20px', color: '#188038' }}>
              R$ {bens.reduce((acc, b) => acc + b.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;