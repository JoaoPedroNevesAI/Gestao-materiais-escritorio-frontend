import React, { useState, useEffect } from 'react';
import { buscarLogsAuditoria } from '../services/api'; // Certifique-se de exportar essa função no seu api.js

export default function Auditoria({ darkMode }) {
  const [logs, setLogs] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarLogsAuditoria()
      .then(dados => {
        setLogs(dados);
        setCarregando(false);
      })
      .catch(err => {
        console.error("Erro ao carregar logs de auditoria:", err);
        setCarregando(false);
      });
  }, []);

  // Helper para formatar a data vinda do banco de dados
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

  // Helper para definir as cores das tags baseado na ação do banco (CREATE, UPDATE, DELETE)
  const obterEstiloTag = (acao) => {
    const acaoNormalizada = acao ? acao.toUpperCase() : '';

    if (acaoNormalizada.includes('CADAS') || acaoNormalizada.includes('CREAT')) {
      return {
        bg: darkMode ? '#1b4721' : '#d4edda',
        texto: darkMode ? '#81c784' : '#155724'
      };
    }
    if (acaoNormalizada.includes('BAIXA') || acaoNormalizada.includes('DELET') || acaoNormalizada.includes('REMOV')) {
      return {
        bg: darkMode ? '#611a1a' : '#f8d7da',
        texto: darkMode ? '#e57373' : '#721c24'
      };
    }
    // Default / Edições / Movimentações
    return {
      bg: darkMode ? '#533f03' : '#fff3cd',
      texto: darkMode ? '#ffd54f' : '#856404'
    };
  };

  const styles = {
    card: {
      marginTop: '20px',
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
      padding: '20px',
      borderRadius: '12px',
      color: darkMode ? '#e0e0e0' : '#333',
      border: `1px solid ${darkMode ? '#333' : '#ddd'}`,
      transition: 'all 0.2s'
    },
    headerTable: {
      textAlign: 'left',
      backgroundColor: darkMode ? '#2d2d2d' : '#f8f9fa',
      color: darkMode ? '#aaa' : '#555'
    },
    row: {
      borderBottom: `1px solid ${darkMode ? '#333' : '#eee'}`
    },
    subText: {
      color: darkMode ? '#888' : '#666',
      fontSize: '12px'
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={{ borderBottom: '2px solid #1a73e8', paddingBottom: '10px', marginTop: 0 }}>
        📜 Registro de Auditoria (Logs do Sistema)
      </h3>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={styles.headerTable}>
            <th style={{ padding: '12px' }}>Usuário</th>
            <th style={{ padding: '12px' }}>Ação</th>
            <th style={{ padding: '12px' }}>Item Impactado</th>
            <th style={{ padding: '12px' }}>Data / Hora</th>
          </tr>
        </thead>
        <tbody>
          {carregando ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '20px', ...styles.subText }}>
                Carregando registros de auditoria do banco...
              </td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '20px', ...styles.subText }}>
                Nenhum log de auditoria encontrado.
              </td>
            </tr>
          ) : (
            logs.map(log => {
              const coresTag = obterEstiloTag(log.acao);
              return (
                <tr key={log.id} style={styles.row}>
                  {/* Usuário que executou */}
                  <td style={{ padding: '12px' }}>
                    <strong>{log.usuario || log.usuarioNome || 'Sistema'}</strong>
                  </td>
                  
                  {/* Badge da Ação */}
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      backgroundColor: coresTag.bg,
                      color: coresTag.texto
                    }}>
                      {log.acao || 'Operação'}
                    </span>
                  </td>
                  
                  {/* Nome do Item e Detalhes Adicionais se houver */}
                  <td style={{ padding: '12px' }}>
                    {log.item || 'Item não especificado'} 
                    {log.detalhe && <span style={styles.subText}> ({log.detalhe})</span>}
                  </td>
                  
                  {/* Data formatada */}
                  <td style={{ padding: '12px', ...styles.subText }}>
                    {formatarData(log.data || log.timestamp)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}