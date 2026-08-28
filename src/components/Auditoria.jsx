import React, { useState, useEffect } from 'react';
import { buscarLogsAuditoria } from '../services/api';

export default function Auditoria({ darkMode }) {
  const [logs, setLogs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  
  // Filtros locais
  const [busca, setBusca] = useState('');
  const [filtroAcao, setFiltroAcao] = useState('');

  const carregarLogs = async () => {
    setCarregando(true);
    setErro(false);
    try {
      const dados = await buscarLogsAuditoria();
      const lista = Array.isArray(dados) ? dados : (dados?.content || []);
      
      // Garante que as ações mais recentes fiquem no topo
      const dadosOrdenados = [...lista].sort((a, b) => {
        const dataA = new Date(a.data || a.timestamp || a.createdAt || 0);
        const dataB = new Date(b.data || b.timestamp || b.createdAt || 0);
        return dataB - dataA;
      });

      setLogs(dadosOrdenados);
    } catch (err) {
      console.error("Erro ao carregar logs de auditoria:", err);
      setErro(true);
      setLogs([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarLogs();
  }, []);

  // Helper para formatar a data
  const formatarData = (dataString) => {
    if (!dataString) return '—';
    try {
      const data = new Date(dataString);
      if (isNaN(data.getTime())) return String(dataString);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return String(dataString);
    }
  };

  // Helper para tags de ação
  const obterEstiloTag = (acao) => {
    const acaoStr = String(acao || '').toUpperCase();

    if (acaoStr.includes('CADAS') || acaoStr.includes('CREAT') || acaoStr.includes('INSER')) {
      return {
        bg: darkMode ? '#1b4721' : '#e6f4ea',
        texto: darkMode ? '#81c784' : '#137333',
        label: 'Criado'
      };
    }
    if (acaoStr.includes('BAIXA') || acaoStr.includes('DELET') || acaoStr.includes('REMOV') || acaoStr.includes('EXCLU')) {
      return {
        bg: darkMode ? '#611a1a' : '#fce8e6',
        texto: darkMode ? '#e57373' : '#c5221f',
        label: 'Removido'
      };
    }
    return {
      bg: darkMode ? '#533f03' : '#fef7e0',
      texto: darkMode ? '#ffd54f' : '#b06000',
      label: acaoStr ? acaoStr : 'Editado'
    };
  };

  // Filtragem local
  const logsFiltrados = logs.filter(log => {
    const usuarioNome = typeof log.usuario === 'object' && log.usuario !== null
      ? (log.usuario.nome || log.usuario.username || log.usuario.email)
      : String(log.usuario || log.usuarioNome || 'Sistema');

    const itemNome = typeof log.item === 'object' && log.item !== null
      ? (log.item.nome || log.item.descricao)
      : typeof log.patrimonio === 'object' && log.patrimonio !== null
      ? log.patrimonio.nome
      : String(log.item || log.patrimonio || log.itemNome || '');

    const acaoStr = String(log.acao || '').toLowerCase();
    const termoBusca = busca.toLowerCase();

    const bateBusca = !busca || usuarioNome.toLowerCase().includes(termoBusca) || itemNome.toLowerCase().includes(termoBusca);
    const bateAcao = !filtroAcao || acaoStr.includes(filtroAcao.toLowerCase());

    return bateBusca && bateAcao;
  });

  const styles = {
    card: {
      marginTop: '25px',
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
      padding: '24px',
      borderRadius: '16px',
      color: darkMode ? '#e0e0e0' : '#333',
      border: `1px solid ${darkMode ? '#333' : '#ddd'}`,
      transition: 'all 0.2s',
      fontFamily: 'system-ui, sans-serif'
    },
    headerTitle: {
      color: '#1a73e8',
      paddingBottom: '12px',
      marginTop: 0,
      borderBottom: `2px solid ${darkMode ? '#333' : '#e8f0fe'}`,
      fontSize: '16px',
      fontWeight: '700',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '10px'
    },
    filtros: {
      display: 'flex',
      gap: '12px',
      marginTop: '15px',
      marginBottom: '15px',
      flexWrap: 'wrap'
    },
    inputFiltro: {
      padding: '8px 12px',
      borderRadius: '8px',
      border: `1px solid ${darkMode ? '#444' : '#ccc'}`,
      backgroundColor: darkMode ? '#2d2d2d' : '#fff',
      color: darkMode ? '#fff' : '#333',
      fontSize: '13px',
      outline: 'none'
    },
    headerTable: {
      textAlign: 'left',
      backgroundColor: darkMode ? '#2d2d2d' : '#f8f9fa',
      color: darkMode ? '#aaa' : '#555',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '600'
    },
    row: {
      borderBottom: `1px solid ${darkMode ? '#2d2d2d' : '#f5f5f5'}`,
      fontSize: '13.5px'
    },
    subText: {
      color: darkMode ? '#aaa' : '#666',
      fontSize: '12.5px'
    },
    btnRecarregar: {
      backgroundColor: '#1a73e8', color: '#fff', border: 'none',
      padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
      fontSize: '12px', fontWeight: 'bold'
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.headerTitle}>
        <span>📜 Registro de Auditoria (Logs de Atividades)</span>
        <button style={styles.btnRecarregar} onClick={carregarLogs} disabled={carregando}>
          {carregando ? 'Atualizando...' : '🔄 Atualizar Logs'}
        </button>
      </div>

      {/* Barra de Filtros */}
      <div style={styles.filtros}>
        <input
          type="text"
          placeholder="Buscar responsável ou item..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ ...styles.inputFiltro, flex: 1, minWidth: '200px' }}
        />
        <select value={filtroAcao} onChange={(e) => setFiltroAcao(e.target.value)} style={styles.inputFiltro}>
          <option value="">Todas as Ações</option>
          <option value="creat">Criado / Cadastro</option>
          <option value="edit">Editado / Alteração</option>
          <option value="delet">Removido / Baixa</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={styles.headerTable}>
              <th style={{ padding: '12px 10px' }}>Responsável</th>
              <th style={{ padding: '12px 10px' }}>Ação Realizada</th>
              <th style={{ padding: '12px 10px' }}>Patrimônio Afetado</th>
              <th style={{ padding: '12px 10px' }}>Data / Hora</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '24px', ...styles.subText }}>
                  Carregando trilha de auditoria do banco de dados...
                </td>
              </tr>
            ) : erro ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#d93025' }}>
                  ⚠️ Não foi possível conectar ao serviço de auditoria ou a rota não está ativa na API.
                </td>
              </tr>
            ) : logsFiltrados.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '24px', ...styles.subText }}>
                  Nenhum evento de auditoria encontrado.
                </td>
              </tr>
            ) : (
              logsFiltrados.map((log, index) => {
                const idLog = log.id || `log-${index}`;
                const configTag = obterEstiloTag(log.acao);

                // Tratamento anti-crash para usuário e item
                const usuarioNome = typeof log.usuario === 'object' && log.usuario !== null
                  ? (log.usuario.nome || log.usuario.username || log.usuario.email)
                  : (log.usuario || log.usuarioNome || 'Sistema');

                const itemNome = typeof log.item === 'object' && log.item !== null
                  ? (log.item.nome || log.item.descricao)
                  : typeof log.patrimonio === 'object' && log.patrimonio !== null
                  ? log.patrimonio.nome
                  : (log.item || log.patrimonio || log.itemNome || 'Item não identificado');

                return (
                  <tr key={idLog} style={styles.row}>
                    {/* Usuário Responsável */}
                    <td style={{ padding: '14px 10px' }}>
                      <strong>{String(usuarioNome)}</strong>
                    </td>
                    
                    {/* Badge de Ação */}
                    <td style={{ padding: '14px 10px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: configTag.bg,
                        color: configTag.texto
                      }}>
                        {configTag.label}
                      </span>
                    </td>
                    
                    {/* Descrição do Ativo Modificado */}
                    <td style={{ padding: '14px 10px' }}>
                      <span style={{ fontWeight: '500' }}>{String(itemNome)}</span>
                      {log.detalhe && <span style={styles.subText}> — {String(log.detalhe)}</span>}
                    </td>
                    
                    {/* Timestamp do Evento */}
                    <td style={{ padding: '14px 10px', ...styles.subText }}>
                      {formatarData(log.data || log.timestamp || log.createdAt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}