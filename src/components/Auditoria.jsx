import React, { useState, useEffect } from 'react';

export default function Auditoria() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Aqui buscaremos os logs do backend no futuro
    // fetch('http://localhost:8080/api/auditoria').then(...)
    
    // MOCK: Dados de exemplo para você ver como fica
    setLogs([
      { id: 1, usuario: 'Luiz', acao: 'Cadastrou', item: 'Monitor Dell', data: '29/04/2026 14:00' },
      { id: 2, usuario: 'João Backend', acao: 'Moveu', item: 'Cadeira Gamer', detalhe: 'TI -> Recepção', data: '29/04/2026 15:30' },
      { id: 3, usuario: 'Admin', acao: 'Baixa (Exclusão)', item: 'Teclado Antigo', data: '29/04/2026 16:45' }
    ]);
  }, []);

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <h3 style={{ borderBottom: '2px solid #1a73e8', paddingBottom: '10px' }}>
        📜 Registro de Auditoria (Logs do Sistema)
      </h3>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ textAlign: 'left', backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '10px' }}>Usuário</th>
            <th style={{ padding: '10px' }}>Ação</th>
            <th style={{ padding: '10px' }}>Item</th>
            <th style={{ padding: '10px' }}>Data/Hora</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}><strong>{log.usuario}</strong></td>
              <td style={{ padding: '10px' }}>
                <span style={{ 
                  padding: '3px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  backgroundColor: log.acao.includes('Cadastrou') ? '#d4edda' : '#fff3cd' 
                }}>
                  {log.acao}
                </span>
              </td>
              <td style={{ padding: '10px' }}>
                {log.item} {log.detalhe && <small style={{ color: '#666' }}>({log.detalhe})</small>}
              </td>
              <td style={{ padding: '10px', fontSize: '13px', color: '#666' }}>{log.data}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}