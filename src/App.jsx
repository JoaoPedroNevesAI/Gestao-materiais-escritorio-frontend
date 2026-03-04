import { useState, useEffect } from 'react';
import Formulario from './components/Formulario';
import TabelaEstoque from './components/TabelaEstoque';

function App() {
  const [materiais, setMateriais] = useState(() => {
    const salvo = localStorage.getItem('estoque_v2');
    return salvo ? JSON.parse(salvo) : [];
  });

  const [busca, setBusca] = useState('');

  useEffect(() => {
    localStorage.setItem('estoque_v2', JSON.stringify(materiais));
  }, [materiais]);

  const totalItens = materiais.length;
  const itensCriticos = materiais.filter(m => m.quantidade < 3).length;

  const materiaisFiltrados = materiais.filter(m => 
    m.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const adicionarMaterial = (nome, quantidade) => {
    const novo = { id: Date.now(), nome, quantidade };
    setMateriais([...materiais, novo]);
  };

  const alterarQtd = (id, delta) => {
    setMateriais(materiais.map(item => 
      item.id === id ? { ...item, quantidade: Math.max(0, item.quantidade + delta) } : item
    ));
  };

  const removerMaterial = (id) => {
    if(confirm("Deseja deletar este registro?")) {
      setMateriais(materiais.filter(i => i.id !== id));
    }
  };

  return (
    <>
      <div className="win95-container">
        <div className="window-header">
          <span className="title">📦 SISTEMA_ESTOQUE.EXE</span>
          <div className="window-controls">
            <button className="ctrl-btn">_</button>
            <button className="ctrl-btn">□</button>
            <button className="ctrl-btn close">X</button>
          </div>
        </div>

        <div className="window-body">
          <Formulario aoAdicionar={adicionarMaterial} />
          
          <div style={{ margin: '15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label>Buscar:</label>
            <input 
              type="text" 
              placeholder="Procurar item..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>

          <TabelaEstoque 
            materiais={materiaisFiltrados} 
            aoAlterar={alterarQtd} 
            aoRemover={removerMaterial} 
          />
        </div>

        <div className="status-bar">
          <div className="status-field">Total de Registros: {totalItens}</div>
          <div className="status-field" style={{ color: itensCriticos > 0 ? 'red' : 'black' }}>
            Itens Críticos: {itensCriticos}
          </div>
          <div className="status-field">SISTEMA OK</div>
        </div>
      </div>

      <div className="taskbar">
        <button className="start-button">
          <span style={{ fontSize: '16px' }}>🪟</span> 
          <strong>Iniciar</strong>
        </button>
        
        <div className="taskbar-item">
          📦 SISTEMA_ESTOQUE.EXE
        </div>

        <div className="taskbar-clock">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </>
  );
}

export default App;