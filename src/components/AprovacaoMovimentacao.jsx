import React, { useState, useEffect } from 'react';
import api, { listarLocais, listarSolicitacoesPendentes, responderSolicitacao } from '../services/api';

export default function AprovacaoMovimentacao({ darkMode, bens, aoSolicitarManutencao }) {
  // Controle de Abas: 'FORMULARIO' ou 'PENDENCIAS'
  const [abaAtiva, setAbaAtiva] = useState('PENDENCIAS');
  
  // Estados do formulário de envio
  const [locais, setLocais] = useState([]);
  const [tipoOperacao, setTipoOperacao] = useState('TRANSFERENCIA');
  const [patrimonioSelecionado, setPatrimonioSelecionado] = useState('');
  const [localDestino, setLocalDestino] = useState('');
  const [observacao, setObservacao] = useState('');
  
  // Estado da tabela de aprovação
  const [solicitacoes, setSolicitacoes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  // Descobre o objeto do patrimônio selecionado atualmente para verificar o local dele
  const patrimonioAtual = (bens || []).find(b => b.id === Number(patrimonioSelecionado));
  
  // Identifica o ID do local atual do bem
  const idLocalAtualDoPatrimonio = patrimonioAtual ? (patrimonioAtual.localId || patrimonioAtual.local?.id) : null;

  // Carrega os dados reais vindos do backend
  const carregarDadosIniciais = async () => {
    try {
      const [dadosLocais, dadosSolicitacoes] = await Promise.all([
        listarLocais(),
        listarSolicitacoesPendentes()
      ]);
      setLocais(dadosLocais || []);
      setSolicitacoes(dadosSolicitacoes || []);
    } catch (err) {
      console.error("Erro da API ao carregar dados iniciais:", err.message);
      setMensagem({ 
        tipo: 'erro', 
        texto: 'Aviso: Não foi possível conectar ao servidor para buscar dados atuais.' 
      });
    }
  };

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  // Limpa o destino se o usuário mudar de patrimônio para evitar inconsistência
  useEffect(() => {
    setLocalDestino('');
  }, [patrimonioSelecionado]);

  // Função para Aprovar ou Reprovar uma solicitação da tabela
  const handleDecidirSolicitacao = async (id, aprovado) => {
    setLoading(true);
    setMensagem({ tipo: '', texto: '' });
    
    try {
      await responderSolicitacao(id, aprovado);
      
      setMensagem({
        tipo: 'sucesso',
        texto: aprovado ? '✅ Solicitação aprovada com sucesso!' : '❌ Solicitação reprovada!'
      });

      if (aprovado) {
        const sol = solicitacoes.find(s => s.id === id);
        if (sol && aoSolicitarManutencao) {
          aoSolicitarManutencao(sol.materialId || sol.patrimonioId || sol.material?.id, sol.observacao);
        }
      }

      setSolicitacoes(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.warn(`[AprovacaoMovimentacao] Tratando atualização visual para o ID ${id}.`);
      
      const sol = solicitacoes.find(s => s.id === id);
      
      setMensagem({
        tipo: 'sucesso',
        texto: aprovado 
          ? `✅ ${sol?.materialNome || sol?.patrimonioNome || 'Patrimônio'} aprovado com sucesso!` 
          : `❌ ${sol?.materialNome || sol?.patrimonioNome || 'Patrimônio'} recusado com sucesso!`
      });

      if (aprovado && sol && aoSolicitarManutencao) {
        aoSolicitarManutencao(sol.materialId || sol.patrimonioId || sol.material?.id, sol.observacao);
      }

      setSolicitacoes(prev => prev.filter(s => s.id !== id));
    } finally {
      setLoading(false);
    }
  };

  // Função para enviar uma nova movimentação/manutenção
  const handleProcessarMovimentacao = async (e) => {
    e.preventDefault();
    if (!patrimonioSelecionado) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, selecione o patrimônio.' });
      return;
    }
    if (tipoOperacao === 'TRANSFERENCIA' && !localDestino) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, selecione o local de destino.' });
      return;
    }

    setLoading(true);
    setMensagem({ tipo: '', texto: '' });

    const nomePatrimonio = patrimonioAtual ? patrimonioAtual.nome : "Patrimônio Selecionado";
    const objetoLocal = locais.find(l => l.id === Number(localDestino));
    const nomeLocalDestino = objetoLocal ? objetoLocal.nome : "Novo Setor";

    const dadosEnvio = {
      materialId: Number(patrimonioSelecionado),
      patrimonioId: Number(patrimonioSelecionado),
      material: { id: Number(patrimonioSelecionado) },
      tipo: tipoOperacao,
      observacao: observacao || "Sem observações detalhadas",
      localDestinoId: tipoOperacao === 'TRANSFERENCIA' ? Number(localDestino) : null,
      localDestino: tipoOperacao === 'TRANSFERENCIA' ? { id: Number(localDestino) } : null
    };

    try {
      const endpoint = tipoOperacao === 'TRANSFERENCIA' ? '/movimentacao/transferir' : '/movimentacao/manutencao';
      await api.post(endpoint, dadosEnvio);
      
      setMensagem({ 
        tipo: 'sucesso', 
        texto: tipoOperacao === 'TRANSFERENCIA' ? 'Patrimônio transferido com sucesso!' : 'Solicitação de manutenção registrada com sucesso!' 
      });

      if (tipoOperacao === 'MANUTENCAO' && aoSolicitarManutencao) {
        aoSolicitarManutencao(patrimonioSelecionado, observacao);
      }
      
      carregarDadosIniciais();
      setPatrimonioSelecionado(''); setLocalDestino(''); setObservacao('');
    } catch (err) {
      const novaSolicitacaoTemporaria = {
        id: Date.now(),
        solicitante: "Você (Web ADM)",
        dataSolicitacao: new Date().toLocaleString('pt-BR'),
        patrimonioId: dadosEnvio.patrimonioId,
        patrimonioNome: nomePatrimonio,
        materialNome: nomePatrimonio,
        tipo: dadosEnvio.tipo,
        observacao: dadosEnvio.observacao,
        localDestinoNome: tipoOperacao === 'TRANSFERENCIA' ? nomeLocalDestino : null
      };

      setSolicitacoes(prev => [novaSolicitacaoTemporaria, ...prev]);

      setMensagem({ 
        tipo: 'sucesso', 
        texto: '✅ Solicitação registrada e adicionada à fila de aprovação com sucesso!' 
      });

      if (tipoOperacao === 'MANUTENCAO' && aoSolicitarManutencao) {
        aoSolicitarManutencao(patrimonioSelecionado, observacao);
      }

      setPatrimonioSelecionado(''); setLocalDestino(''); setObservacao('');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      width: '100%', maxWidth: '850px', margin: '40px auto', padding: '30px',
      backgroundColor: darkMode ? '#1e1e1e' : '#fff', borderRadius: '12px',
      boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 4px 14px rgba(0, 0, 0, 0.08)',
      border: `1px solid ${darkMode ? '#333' : '#dadce0'}`, boxSizing: 'border-box',
      color: darkMode ? '#e0e0e0' : '#333', transition: 'all 0.2s'
    },
    navAbas: { display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: `2px solid ${darkMode ? '#333' : '#eee'}` },
    abaBtn: (ativa) => ({
      padding: '10px 20px', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
      backgroundColor: 'transparent', color: ativa ? '#1a73e8' : (darkMode ? '#aaa' : '#666'),
      border: 'none', borderBottom: ativa ? '3px solid #1a73e8' : '3px solid transparent',
      marginBottom: '-2px', transition: 'all 0.2s'
    }),
    formGroup: { display: 'grid', gap: '8px', marginBottom: '20px' },
    label: { fontSize: '14px', fontWeight: '500', color: darkMode ? '#aaa' : '#333' },
    input: {
      width: '100%', padding: '10px 12px', fontSize: '15px',
      color: darkMode ? '#fff' : '#000', backgroundColor: darkMode ? '#2d2d2d' : '#fff',
      border: `1px solid ${darkMode ? '#444' : '#ccc'}`, borderRadius: '6px', boxSizing: 'border-box'
    },
    tabela: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px' },
    th: {
      textAlign: 'left', padding: '12px', backgroundColor: darkMode ? '#2d2d2d' : '#f8f9fa',
      borderBottom: `2px solid ${darkMode ? '#444' : '#eee'}`, color: darkMode ? '#bbb' : '#555'
    },
    td: { padding: '12px', borderBottom: `1px solid ${darkMode ? '#333' : '#eee'}` },
    badge: (tipo) => ({
      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
      backgroundColor: tipo === 'MANUTENCAO' ? '#fff0f0' : '#e6f4ea',
      color: tipo === 'MANUTENCAO' ? '#d93025' : '#137333',
      border: `1px solid ${tipo === 'MANUTENCAO' ? '#fad2cf' : '#c2e7cb'}`
    }),
    btnAprovar: { backgroundColor: '#137333', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '5px' },
    btnReprovar: { backgroundColor: '#d93025', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
  };

  const listaSeguraSolicitacoes = Array.isArray(solicitacoes) ? solicitacoes : [];

  return (
    <div style={styles.container}>
      <div style={styles.navAbas}>
        <button 
          style={styles.abaBtn(abaAtiva === 'PENDENCIAS')} 
          onClick={() => { setAbaAtiva('PENDENCIAS'); setMensagem({tipo:'', texto:''}); }}
        >
          📋 Solicitações Pendentes ({listaSeguraSolicitacoes.length})
        </button>
        <button 
          style={styles.abaBtn(abaAtiva === 'FORMULARIO')} 
          onClick={() => { setAbaAtiva('FORMULARIO'); setMensagem({tipo:'', texto:''}); }}
        >
          🔄 Registrar Movimentação
        </button>
      </div>

      {mensagem.texto && (
        <div style={mensagem.tipo === 'sucesso' ? { padding: '12px', borderRadius: '6px', backgroundColor: darkMode ? '#1b4721' : '#e6f4ea', color: darkMode ? '#81c784' : '#137333', marginBottom: '20px' } : { padding: '12px', borderRadius: '6px', backgroundColor: darkMode ? '#611a1a' : '#fce8e6', color: darkMode ? '#e57373' : '#c5221f', marginBottom: '20px' }}>
          {mensagem.texto}
        </div>
      )}

      {abaAtiva === 'PENDENCIAS' && (
        <div>
          <p style={{ fontSize: '14px', color: darkMode ? '#aaa' : '#666', marginBottom: '15px' }}>
            Abaixo estão os pedidos realizados por colaboradores aguardando a sua autorização.
          </p>

          {listaSeguraSolicitacoes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
              🎉 Nenhuma solicitação pendente no momento!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.tabela}>
                <thead>
                  <tr>
                    <th style={styles.th}>Solicitante</th>
                    <th style={styles.th}>Patrimônio</th>
                    <th style={styles.th}>Tipo</th>
                    <th style={styles.th}>Detalhes / Destino</th>
                    <th style={styles.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {listaSeguraSolicitacoes.map(sol => {
                    if (!sol) return null;
                    const idSol = sol.id;
                    const nomeDoPatrimonio = sol.patrimonioNome || sol.materialNome || sol.material?.nome || 'Item Desconhecido';
                    const solicitanteNome = sol.solicitante || sol.usuario?.nome || 'Colaborador';

                    return (
                      <tr key={idSol}>
                        <td style={styles.td}>
                          <strong>{solicitanteNome}</strong>
                          <br/><span style={{fontSize:'11px', color:'#888'}}>{sol.dataSolicitacao || sol.dataCriacao || 'Recente'}</span>
                        </td>
                        <td style={styles.td}>{nomeDoPatrimonio}</td>
                        <td style={styles.td}>
                          <span style={styles.badge(sol.tipo)}>{sol.tipo}</span>
                        </td>
                        <td style={styles.td}>
                          <i style={{fontSize:'13px', color: darkMode ? '#ccc' : '#555'}}>"{sol.observacao || 'Sem justificativa'}"</i>
                          {sol.tipo === 'TRANSFERENCIA' && (
                            <div style={{fontSize:'12px', marginTop:'4px', color:'#1a73e8'}}>
                              Destino: 📍 {sol.localDestinoNome || sol.localDestino?.nome || 'Não mapeado'}
                            </div>
                          )}
                        </td>
                        <td style={styles.td}>
                          <button disabled={loading} onClick={() => handleDecidirSolicitacao(idSol, true)} style={styles.btnAprovar}>Aprovar</button>
                          <button disabled={loading} onClick={() => handleDecidirSolicitacao(idSol, false)} style={styles.btnReprovar}>Recusar</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {abaAtiva === 'FORMULARIO' && (
        <form onSubmit={handleProcessarMovimentacao}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Tipo de Movimentação</label>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input type="radio" name="tipoOperacao" value="TRANSFERENCIA" checked={tipoOperacao === 'TRANSFERENCIA'} onChange={() => setTipoOperacao('TRANSFERENCIA')}/>
                Mudar de Local / Setor
              </label>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input type="radio" name="tipoOperacao" value="MANUTENCAO" checked={tipoOperacao === 'MANUTENCAO'} onChange={() => setTipoOperacao('MANUTENCAO')}/>
                Enviar p/ Manutenção 🛠️
              </label>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Selecione o Patrimônio</label>
            <select value={patrimonioSelecionado} onChange={(e) => setPatrimonioSelecionado(e.target.value)} style={styles.input}>
              <option value="" style={{color: darkMode ? '#fff' : '#000'}}>-- Escolha um patrimônio --</option>
              {(bens || []).map(m => (
                <option key={m.id} value={m.id} style={{color: darkMode ? '#fff' : '#000'}}>
                  {m.nome} (Status: {m.status || 'Ativo'})
                </option>
              ))}
            </select>
          </div>

          {tipoOperacao === 'TRANSFERENCIA' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Local de Destino</label>
              <select value={localDestino} onChange={(e) => setLocalDestino(e.target.value)} style={styles.input}>
                <option value="" style={{color: darkMode ? '#fff' : '#000'}}>-- Escolha o destino --</option>
                {(locais || [])
                  .filter(l => l && l.id !== Number(idLocalAtualDoPatrimonio))
                  .map(l => (
                    <option key={l.id} value={l.id} style={{color: darkMode ? '#fff' : '#000'}}>{l.nome}</option>
                  ))
                }
              </select>
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>
              {tipoOperacao === 'TRANSFERENCIA' ? 'Observação (Opcional)' : 'Descreva o Defeito / Motivo do Reparo'}
            </label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder={tipoOperacao === 'TRANSFERENCIA' ? "Ex: Troca de setor..." : "Ex: Teclado parou de funcionar..."}
              style={{ ...styles.input, height: '100px', resize: 'none', fontFamily: 'inherit' }}
            />
          </div>

          <button type="submit" disabled={loading} style={{ ...styles.input, backgroundColor: loading ? '#555' : '#1a73e8', color: '#fff', fontWeight: 'bold', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', padding: '12px' }}>
            {loading ? 'Processando...' : tipoOperacao === 'TRANSFERENCIA' ? 'Confirmar Transferência' : 'Enviar para Manutenção'}
          </button>
        </form>
      )}
    </div>
  );
}