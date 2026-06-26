import React from 'react';

export default function AlertasManutencao({ darkMode, bens = [] }) {
  // Filtra de forma real os materiais vindos do estado global do App
  const itensCriticos = bens.filter(item => 
    item.status === 'MANUTENCAO' || 
    item.situacao === 'MANUTENCAO' || 
    String(item.descricao || '').toLowerCase().includes('defeito')
  );

  const styles = {
    container: {
      color: darkMode ? '#e6a23c' : '#856404',
    },
    lista: {
      margin: 0,
      paddingLeft: '15px',
      fontSize: '13px',
      listStyleType: 'disc'
    },
    item: {
      marginBottom: '8px',
      lineHeight: '1.4'
    },
    vazio: {
      margin: 0,
      fontSize: '13px',
      color: darkMode ? '#aaa' : '#666',
      textAlign: 'center',
      padding: '10px 0'
    }
  };

  return (
    <div style={styles.container}>
      {itensCriticos.length === 0 ? (
        <p style={styles.vazio}>✅ Nenhum património em manutenção.</p>
      ) : (
        <ul style={styles.lista}>
          {itensCriticos.map(item => (
            <li key={item.id} style={styles.item}>
              <strong>{item.nome}</strong> 
              {item.local?.nome && <span> - {item.local.nome}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}