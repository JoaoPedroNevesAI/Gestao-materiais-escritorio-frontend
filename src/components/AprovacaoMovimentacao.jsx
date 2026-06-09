import React, { useState, useEffect } from 'react';
import api, { listarMateriais, listarLocais } from '../services/api';

export default function AprovacaoMovimentacao() {
  // Estados para os campos do formulário
  const [materiais, setMateriais] = useState([]);
  const [locais, setLocais] = useState([]);
  
  const [materialSelecionado, setMaterialSelecionado] = useState('');
  const [localDestino, setLocalDestino] = useState('');
  const [observacao, setObservacao] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  // Carrega os materiais e locais disponíveis usando os serviços limpos
  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [dadosMateriais, dadosLocais] = await Promise.all([
          listarMateriais(),
          listarLocais()
        ]);
        setMateriais(dadosMateriais || []);
        setLocais(dadosLocais || []);
      } catch (err) {
        console.error("Erro ao carregar dados iniciais", err);
      }
    };
    buscarDados();
  }, []);

  // Função para enviar a transferência para o Back-end
  const handleTransferir = async (e) => {
    e.preventDefault();
    
    if (!materialSelecionado || !localDestino) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, selecione o material e o local de destino.' });
      return;
    }

    setLoading(true);
    setMensagem({ tipo: '', texto: '' });

    const dadosTransferencia = {
      materialId: Number(materialSelecionado),
      localDestinoId: Number(localDestino),
      observacao: observacao
    };

    try {
      await api.post('/movimentacao/transferir', dadosTransferencia);
      
      setMensagem({ tipo: 'sucesso', texto: 'Material transferido com sucesso!' });
      
      // Limpa os campos após o sucesso
      setMaterialSelecionado('');
      setLocalDestino('');
      setObservacao('');
      
      // Atualiza a lista de materiais para recalcular as quantidades na tela
      const novosMateriais = await listarMateriais();
      setMateriais(novosMateriais || []);
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao realizar a transferência. Verifique os dados.' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Objetos de estilo inline para substituir completamente o Tailwind e garantir o visual correto
  const styles = {
    container: {
      width: '100%',
      maxWidth: '600px',
      margin: '40px auto',
      padding: '30px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
      border: '1px solid #dadce0',
      boxSizing: 'border-box'
    },
    titulo: {
      color: '#1a73e8',
      fontSize: '22px',
      fontWeight: 'bold',
      margin: '0 0 25px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    formGroup: {
      display: 'grid',
      gap: '8px',
      marginBottom: '20px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      fontSize: '15px',
      color: '#000',
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      borderRadius: '6px',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      fontSize: '15px',
      color: '#000',
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      borderRadius: '6px',
      boxSizing: 'border-box',
      outline: 'none',
      height: '100px',
      resize: 'none',
      fontFamily: 'inherit'
    },
    botao: {
      width: '100%',
      padding: '12px',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#fff',
      backgroundColor: loading ? '#max-w-2xl' : '#1a73e8',
      border: 'none',
      borderRadius: '6px',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.2s',
      marginTop: '10px'
    },
    mensagemSucesso: {
      padding: '12px',
      borderRadius: '6px',
      backgroundColor: '#e6f4ea',
      color: '#137333',
      border: '1px solid #c2e7cb',
      marginBottom: '20px',
      fontWeight: '500'
    },
    mensagemErro: {
      padding: '12px',
      borderRadius: '6px',
      backgroundColor: '#fce8e6',
      color: '#c5221f',
      border: '1px solid #fad2cf',
      marginBottom: '20px',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>
        📦 Transferência de Materiais (Movimentação)
      </h2>

      {mensagem.texto && (
        <div style={mensagem.tipo === 'sucesso' ? styles.mensagemSucesso : styles.mensagemErro}>
          {mensagem.tipo === 'sucesso' ? '✅ ' : '❌ '}
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleTransferir}>
        {/* Select de Materiais */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Selecione o Material</label>
          <select
            value={materialSelecionado}
            onChange={(e) => setMaterialSelecionado(e.target.value)}
            style={styles.input}
          >
            <option value="">-- Escolha um material --</option>
            {materiais.map(m => (
              <option key={m.id} value={m.id}>{m.nome} (Qtd: {m.quantidade || 0})</option>
            ))}
          </select>
        </div>

        {/* Select de Destino */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Local de Destino</label>
          <select
            value={localDestino}
            onChange={(e) => setLocalDestino(e.target.value)}
            style={styles.input}
          >
            <option value="">-- Escolha o destino --</option>
            {locais.map(l => (
              <option key={l.id} value={l.id}>{l.nome}</option>
            ))}
          </select>
        </div>

        {/* Campo de Observação */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Observação (Opcional)</label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Ex: Transferência para manutenção, troca de setor..."
            style={styles.textarea}
          />
        </div>

        {/* Botão de Envio */}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.botao,
            backgroundColor: loading ? '#b8b8b8' : '#1a73e8'
          }}
        >
          {loading ? 'Processando...' : 'Confirmar Transferência'}
        </button>
      </form>
    </div>
  );
}