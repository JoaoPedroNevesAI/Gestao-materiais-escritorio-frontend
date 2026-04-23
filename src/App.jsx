import { useState, useEffect } from 'react';
import Formulario from './components/Formulario';
import TabelaEstoque from './components/TabelaEstoque';
import Login from './components/Login';
import ListaAcessos from './components/ListaAcessos';
import { ToastContainer, toast } from 'react-toastify';
import { listarMateriais, salvarMaterial, deletarMaterial } from './services/api';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [bens, setBens] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (usuarioLogado) {
      listarMateriais()
        .then(setBens)
        .catch(() => toast.error("Erro ao carregar dados do servidor."));
    }
  }, [usuarioLogado]);

  const eAdmin = usuarioLogado?.cargo === 'ADM';

  // ✅ AGORA SALVA NO BACKEND
  const aoAdicionarBemNoBanco = async (material) => {
    try {
      const novo = await salvarMaterial(material);
      setBens(prev => [...prev, novo]);
      toast.success(`Sucesso: ${novo.nome} registrado!`);
    } catch (err) {
      toast.error("Erro ao salvar no servidor.");
    }
  };

  // ✅ DELETE NO BACKEND
  const removerBem = async (id) => {
    if (!eAdmin) {
      return toast.error("Acesso negado: Você não tem permissão.");
    }

    if (confirm("Deseja confirmar a baixa deste patrimônio?")) {
      try {
        await deletarMaterial(id);

        const bemRemovido = bens.find(b => b.id === id);
        setBens(bens.filter(b => b.id !== id));

        toast.warn(`O item "${bemRemovido?.nome}" recebeu baixa.`);
      } catch {
        toast.error("Erro ao remover no servidor.");
      }
    }
  };

  const materiaisFiltrados = bens.filter(b => 
    b.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    b.descricao?.toLowerCase().includes(busca.toLowerCase())
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
          <span>Usuário: </span>
          <strong>{usuarioLogado.nome}</strong>
          <span> ({usuarioLogado.cargo})</span>

          <button
            onClick={() => {
              setUsuarioLogado(null);
              toast.info("Sessão encerrada.");
            }}
            className="btn btn-danger"
            style={{ marginLeft: '10px' }}
          >
            Sair
          </button>
        </div>
      </header>

      {eAdmin && (
        <Formulario aoAdicionar={aoAdicionarBemNoBanco} />
      )}

      <div className="card">
        <input
          type="text"
          placeholder="Buscar..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <TabelaEstoque
          materiais={materiaisFiltrados}
          aoRemover={removerBem}
          podeEditar={eAdmin}
          usuarioLogado={usuarioLogado}
        />
      </div>
    </div>
  );
}

export default App;