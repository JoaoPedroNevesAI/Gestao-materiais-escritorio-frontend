import React, { useState, useEffect } from 'react';
import { buscarLogsAuditoria } from '../services/api'; // Chamada ajustada no nosso service front-end

export default function Auditoria({ darkMode }) {
  const [logs, setLogs] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarLogsAuditoria()
      .then(dados => {
        // Garante que as ações mais recentes (timestamps maiores) fiquem sempre no topo da tabela
        const dadosOrdenados = [...dados].sort((a, b) => {
          return new Date(b.data || b.timestamp) - new Date(a.data || a.timestamp);
        });
        setLogs(dadosOrdenados);
        setCarregando(false);
      })
      .catch(err => {
        console.error("Erro ao carregar logs de auditoria:", err);
        setCarregando(false);
      });
  }, []);

  // Helper para formatar a data vinda do banco de dados ou do localStorage
  const formatarData = (dataString) => {
    if (!dataString) return '—';
    try {
      const data = new Date(dataString);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dataString;
    }
  };

  // Helper para definir as cores e textos das tags baseado na ação do banco (CREATE, UPDATE, DELETE)
  const obterEstiloTag = (acao) => {
    const acaoNormalizada = acao ? acao.toUpperCase() : '';

    if (acaoNormalizada.includes('CADAS') || acaoNormalizada.includes('CREAT')) {
      return {
        bg: darkMode ? '#1b4721' : '#e6f4ea',
        texto: darkMode ? '#81c784' : '#137333',
        label: 'Criado'
      };
    }
    if (acaoNormalizada.includes('BAIXA') || acaoNormalizada.includes('DELET') || acaoNormalizada.includes('REMOV')) {
      return {
        bg: darkMode ? '#611a1a' : '#fce8e6',
        texto: darkMode ? '#e57373' : '#c5221f',
        label: 'Removido'
      };
    }
    // Default / Edições / Movimentações
    return {
      bg: darkMode ? '#533f03' : '#fef7e0',
      texto: darkMode ? '#ffd54f' : '#b06000',
      label: 'Editado'
    };
  };

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
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={{ 
        color: '#1a73e8', 
        paddingBottom: '12px', 
        marginTop: 0, 
        borderBottom: `2px solid ${darkMode ? '#333' : '#e8f0fe'}`,
        fontSize: '16px',
        fontWeight: '700'
      }}>
        📜 Registro de Auditoria (Logs de Atividades)
      </h3>
      
      <div style={{ overflowX: 'auto', marginTop: '15px' }}>
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
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '24px', ...styles.subText }}>
                  Nenhum evento registrado na base de segurança.
                </td>
              </tr>
            ) : (
              logs.map(log => {
                const configTag = obterEstiloTag(log.acao);
                return (
                  <tr key={log.id} style={styles.row}>
                    {/* Usuário Responsável */}
                    <td style={{ padding: '14px 10px' }}>
                      <strong>{log.usuario || log.usuarioNome || 'Sistema'}</strong>
                    </td>
                    
                    {/* Badge de Ação Corporativa */}
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
                      <span style={{ fontWeight: '500' }}>{log.item || 'Item não identificado'}</span>
                      {log.detalhe && <span style={styles.subText}> — {log.detalhe}</span>}
                    </td>
                    
                    {/* Timestamp do Evento */}
                    <td style={{ padding: '14px 10px', ...styles.subText }}>
                      {formatarData(log.data || log.timestamp)}
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