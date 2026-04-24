import { useState, useEffect } from 'react';
import Formulario from './components/Formulario';
import TabelaEstoque from './components/TabelaEstoque';
import Login from './components/Login';
import { ToastContainer, toast } from 'react-toastify';
import { listarMateriais, salvarMaterial, deletarMaterial } from './services/api';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [bens, setBens] = useState([]);
  const [busca, setBusca] = useState('');

  // Carrega os dados assim que o usuário loga
  useEffect(() => {
    if (usuarioLogado) {
      listarMateriais()
        .then(setBens)
        .catch(() => toast.error("Erro ao carregar dados do servidor. Verifique se o Back-end está ligado."));
    }
  }, [usuarioLogado]);

  // ✅ SALVAR: Liberado para qualquer usuário logado
  const aoAdicionarBemNoBanco = async (material) => {
    try {
      // Adiciona o nome de quem está logado ao objeto antes de enviar, se necessário
      const materialComUsuario = { ...material, cadastradoPor: usuarioLogado.nome };
      
      const novo = await salvarMaterial(materialComUsuario);
      setBens(prev => [...prev, novo]);
      toast.success(`Sucesso: ${novo.nome} registrado!`);
    } catch (err) {
      toast.error("Erro ao salvar no servidor.");
      console.error(err);
    }
  };

  // ✅ DELETE: Liberado geral (removida a trava de eAdmin)
  const removerBem = async (id) => {
    if (confirm("Deseja confirmar a baixa deste patrimônio?")) {
      try {
        await deletarMaterial(id);

        const bemRemovido = bens.find(b => b.id === id);
        setBens(bens.filter(b => b.id !== id));

        toast.warn(`O item "${bemRemovido?.nome}" recebeu baixa.`);
      } catch (err) {
        toast.error("Erro ao remover no servidor. O Back-end pode estar bloqueando a exclusão.");
        console.error("Erro ao deletar:", err);
      }
    }
  };

  // Filtro de busca
  const materiaisFiltrados = bens.filter(b => 
    b.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    b.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

  // Se não estiver logado, mostra tela de Login
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

      {/* Formulário agora aparece para todos os logados */}
      <Formulario aoAdicionar={aoAdicionarBemNoBanco} />

      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nome ou descrição..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ padding: '10px', width: '100%', borderRadius: '8px', border: '1px solid #ddd' }}
          />
        </div>

        <TabelaEstoque
          materiais={materiaisFiltrados}
          aoRemover={removerBem}
          podeEditar={true} // Forçado como true para liberar botões
        />
      </div>
    </div>
  );
}

export default App;
