import React, { useState, useEffect } from 'react';
import api, { 
  listarLocais, 
  listarSolicitacoesPendentes, 
  responderSolicitacao, 
  solicitarMovimentacao 
} from '../services/api';

export default function AprovacaoMovimentacao({ darkMode, bens, aoSolicitarManutencao, aoAtualizarDados, usuarioLogado }) {
  const eAdmin = usuarioLogado?.role && String(usuarioLogado.role).includes('ADM');

  // Se for admin, inicia na aba de pendências. Se for colaborador, abre no formulário.
  const [abaAtiva, setAbaAtiva] = useState(eAdmin ? 'PENDENCIAS' : 'FORMULARIO');
  
  // Estados do formulário
  const [locais, setLocais] = useState([]);
  const [tipoOperacao, setTipoOperacao] = useState('TRANSFERENCIA');
  const [patrimonioSelecionado, setPatrimonioSelecionado] = useState('');
  const [localDestino, setLocalDestino] = useState('');
  const [observacao, setObservacao] = useState('');
  
  // Estado da tabela de aprovação
  const [solicitacoes, setSolicitacoes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  // Patrimônio selecionado no formulário
  const patrimonioAtual = (bens || []).find(b => b.id === Number(patrimonioSelecionado));
  const idLocalAtualDoPatrimonio = patrimonioAtual ? (patrimonioAtual.localId || patrimonioAtual.local?.id) : null;

  // Buscar dados reais do backend
  const carregarDadosIniciais = async () => {
    setLoading(true);
    try {
      const [dadosLocais, dadosSolicitacoes] = await Promise.all([
        listarLocais(),
        eAdmin ? listarSolicitacoesPendentes() : Promise.resolve([])
      ]);
      setLocais(Array.isArray(dadosLocais) ? dadosLocais : []);
      setSolicitacoes(Array.isArray(dadosSolicitacoes) ? dadosSolicitacoes : []);
    } catch (err) {
      console.error("Erro ao carregar dados do servidor:", err);
      setMensagem({ 
        tipo: 'erro', 
        texto: 'Erro ao conectar com o servidor. Verifique se a API Spring Boot está online.' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosIniciais();
  }, [eAdmin]);

  useEffect(() => {
    setLocalDestino('');
  }, [patrimonioSelecionado]);

  // Aprovar ou Reprovar solicitação (Ação exclusiva do Administrador)
  const handleDecidirSolicitacao = async (id, aprovado) => {
    setLoading(true);
    setMensagem({ tipo: '', texto: '' });
    
    try {
      await responderSolicitacao(id, aprovado);
      
      setMensagem({
        tipo: 'sucesso',
        texto: aprovado ? '✅ Solicitação aprovada com sucesso!' : '❌ Solicitação recusada com sucesso!'
      });

      // Apenas aciona manutenção secundária se for efetivamente APROVADO
      if (aprovado) {
        const sol = solicitacoes.find(s => s.id === id);
        if (sol && aoSolicitarManutencao) {
          const matId = sol.materialId || sol.patrimonioId || sol.material?.id || sol.patrimonio?.id;
          aoSolicitarManutencao(matId, sol.observacao);
        }
      }

      await carregarDadosIniciais();
      if (aoAtualizarDados) aoAtualizarDados();

    } catch (err) {
      console.error("Erro ao processar solicitação:", err);
      setMensagem({
        tipo: 'erro',
        texto: `Falha ao ${aprovado ? 'aprovar' : 'recusar'} a solicitação: ${err.response?.data?.message || err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Enviar solicitação para o backend (Livre para Colaborador e ADM)
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

    const payload = {
      patrimonioId: Number(patrimonioSelecionado),
      materialId: Number(patrimonioSelecionado),
      tipo: tipoOperacao,
      observacao: observacao || "Sem observações detalhadas",
      localDestinoId: tipoOperacao === 'TRANSFERENCIA' ? Number(localDestino) : null
    };

    try {
      await solicitarMovimentacao(payload);
      
      setMensagem({ 
        tipo: 'sucesso', 
        texto: tipoOperacao === 'TRANSFERENCIA' 
          ? '✅ Solicitação de transferência gravada com sucesso! Aguardando aprovação do Administrador.' 
          : '✅ Solicitação de manutenção gravada com sucesso! Aguardando aprovação do Administrador.' 
      });

      if (tipoOperacao === 'MANUTENCAO' && aoSolicitarManutencao) {
        aoSolicitarManutencao(patrimonioSelecionado, observacao);
      }
      
      setPatrimonioSelecionado(''); 
      setLocalDestino(''); 
      setObservacao('');

      await carregarDadosIniciais();

    } catch (err) {
      console.error("Erro ao registrar movimentação:", err);
      setMensagem({ 
        tipo: 'erro', 
        texto: `Não foi possível salvar: ${err.response?.data?.message || 'Servidor indisponível ou rota não autenticada.'}` 
      });
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

  return (
    <div style={styles.container}>
      <div style={styles.navAbas}>
        {eAdmin && (
          <button 
            style={styles.abaBtn(abaAtiva === 'PENDENCIAS')} 
            onClick={() => { setAbaAtiva('PENDENCIAS'); setMensagem({tipo:'', texto:''}); }}
          >
            📋 Solicitações Pendentes ({solicitacoes.length})
          </button>
        )}
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

      {abaAtiva === 'PENDENCIAS' && eAdmin && (
        <div>
          <p style={{ fontSize: '14px', color: darkMode ? '#aaa' : '#666', marginBottom: '15px' }}>
            Abaixo estão os pedidos realizados por colaboradores aguardando a sua autorização.
          </p>

          {loading && solicitacoes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Carregando pendências do banco...</div>
          ) : solicitacoes.length === 0 ? (
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
                  {solicitacoes.map(sol => {
                    if (!sol) return null;
                    const idSol = sol.id || Math.random();

                    const solicitanteNome = typeof sol.usuario === 'object' && sol.usuario !== null
                      ? (sol.usuario.nome || sol.usuario.username || sol.usuario.email)
                      : typeof sol.solicitante === 'object' && sol.solicitante !== null
                      ? (sol.solicitante.nome || sol.solicitante.username)
                      : (sol.usuario || sol.solicitante || sol.usuarioNome || 'Colaborador');

                    const nomeDoPatrimonio = typeof sol.patrimonio === 'object' && sol.patrimonio !== null
                      ? sol.patrimonio.nome
                      : typeof sol.material === 'object' && sol.material !== null
                      ? sol.material.nome
                      : (sol.patrimonioNome || sol.materialNome || `Patrimônio #${sol.patrimonioId || sol.materialId || idSol}`);

                    const destinoNome = typeof sol.localDestino === 'object' && sol.localDestino !== null
                      ? sol.localDestino.nome
                      : (sol.localDestinoNome || sol.localDestino || 'Não informado');

                    const tipoMov = typeof sol.tipo === 'string' ? sol.tipo : 'TRANSFERENCIA';

                    return (
                      <tr key={idSol}>
                        <td style={styles.td}>
                          <strong>{String(solicitanteNome)}</strong>
                          <br/>
                          <span style={{fontSize:'11px', color:'#888'}}>
                            {sol.dataSolicitacao || sol.dataCriacao || 'Recente'}
                          </span>
                        </td>
                        <td style={styles.td}>{String(nomeDoPatrimonio)}</td>
                        <td style={styles.td}>
                          <span style={styles.badge(tipoMov)}>{String(tipoMov)}</span>
                        </td>
                        <td style={styles.td}>
                          <i style={{fontSize:'13px', color: darkMode ? '#ccc' : '#555'}}>
                            "{sol.observacao || 'Sem justificativa'}"
                          </i>
                          {tipoMov === 'TRANSFERENCIA' && (
                            <div style={{fontSize:'12px', marginTop:'4px', color:'#1a73e8'}}>
                              Destino: 📍 {String(destinoNome)}
                            </div>
                          )}
                        </td>
                        <td style={styles.td}>
                          <button disabled={loading} onClick={() => handleDecidirSolicitacao(idSol, true)} style={styles.btnAprovar}>
                            {loading ? '...' : 'Aprovar'}
                          </button>
                          <button disabled={loading} onClick={() => handleDecidirSolicitacao(idSol, false)} style={styles.btnReprovar}>
                            {loading ? '...' : 'Recusar'}
                          </button>
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
            {loading ? 'Enviando...' : tipoOperacao === 'TRANSFERENCIA' ? 'Solicitar Transferência' : 'Solicitar Manutenção'}
          </button>
        </form>
      )}
    </div>
  );
}