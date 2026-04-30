import React, { useState, useEffect } from 'react';

export default function Auditoria({ darkMode }) { // Recebendo a prop darkMode
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // MOCK: Dados de exemplo
    setLogs([
      { id: 1, usuario: 'Luiz', acao: 'Cadastrou', item: 'Monitor Dell', data: '29/04/2026 14:00' },
      { id: 2, usuario: 'João Backend', acao: 'Moveu', item: 'Cadeira Gamer', detalhe: 'TI -> Recepção', data: '29/04/2026 15:30' },
      { id: 3, usuario: 'Admin', acao: 'Baixa (Exclusão)', item: 'Teclado Antigo', data: '29/04/2026 16:45' }
    ]);
  }, []);

  // Estilos baseados no tema
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
            <th style={{ padding: '12px' }}>Item</th>
            <th style={{ padding: '12px' }}>Data/Hora</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} style={styles.row}>
              <td style={{ padding: '12px' }}><strong>{log.usuario}</strong></td>
              <td style={{ padding: '12px' }}>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  // Cores de fundo adaptativas para as etiquetas
                  backgroundColor: log.acao.includes('Cadastrou') 
                    ? (darkMode ? '#1b4721' : '#d4edda') 
                    : (darkMode ? '#533f03' : '#fff3cd'),
                  color: log.acao.includes('Cadastrou')
                    ? (darkMode ? '#81c784' : '#155724')
                    : (darkMode ? '#ffd54f' : '#856404')
                }}>
                  {log.acao}
                </span>
              </td>
              <td style={{ padding: '12px' }}>
                {log.item} {log.detalhe && <span style={styles.subText}>({log.detalhe})</span>}
              </td>
              <td style={{ padding: '12px', ...styles.subText }}>{log.data}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}