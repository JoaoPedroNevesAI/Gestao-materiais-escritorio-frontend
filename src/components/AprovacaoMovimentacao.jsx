import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Sua instância do Axios

export default function AprovacaoMovimentacao() {
  // Estados para os campos do formulário
  const [materiais, setMateriais] = useState([]);
  const [locais, setLocais] = useState([]);
  
  const [materialSelecionado, setMaterialSelecionado] = useState('');
  const [localDestino, setLocalDestino] = useState('');
  const [observacao, setObservacao] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  // Carrega os materiais e locais disponíveis assim que a tela abre
  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [resMateriais, resLocais] = await Promise.all([
          api.get('/api/material'), // Rota de listar materiais da doc
          api.get('/api/local')     // Rota de locais (subentendido na doc)
        ]);
        setMateriais(resMateriais.data);
        setLocais(resLocais.data);
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

    // Monta o objeto exatamente como o Back-end do João Pedro espera
    const dadosTransferencia = {
      materialId: Number(materialSelecionado),
      localDestinoId: Number(localDestino),
      observacao: observacao
    };

    try {
      // Endpoint exato da documentação do Back-end
      await api.post('/api/movimentacao/transferir', dadosTransferencia);
      
      setMensagem({ tipo: 'sucesso', texto: 'Material transferido com sucesso!' });
      
      // Limpa os campos após o sucesso
      setMaterialSelecionado('');
      setLocalDestino('');
      setObservacao('');
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao realizar a transferência. Verifique os dados.' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        📦 Transferência de Materiais (Movimentação)
      </h2>

      {mensagem.texto && (
        <div className={`p-3 rounded mb-4 ${mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleTransferir} className="space-y-4">
        {/* Select de Materiais */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o Material</label>
          <select
            value={materialSelecionado}
            onChange={(e) => setMaterialSelecionado(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="">-- Escolha um material --</option>
            {materiais.map(m => (
              <option key={m.id} value={m.id}>{m.nome} (Qtd: {m.quantidade})</option>
            ))}
          </select>
        </div>

        {/* Select de Destino */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Local de Destino</label>
          <select
            value={localDestino}
            onChange={(e) => setLocalDestino(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="">-- Escolha o destino --</option>
            {locais.map(l => (
              <option key={l.id} value={l.id}>{l.nome}</option>
            ))}
          </select>
        </div>

        {/* Campo de Observação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observação (Opcional)</label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Ex: Transferência para manutenção, troca de setor..."
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-black h-24 resize-none"
          />
        </div>

        {/* Botão de Envio */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white p-2.5 rounded font-medium transition-colors ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Processando...' : 'Confirmar Transferência'}
        </button>
      </form>
    </div>
  );
}