import React from 'react';

export default function Dashboard({ bens, categorias, locais, darkMode }) {
  // Cálculos dinâmicos baseados no estado real do sistema
  const totalItens = bens.length;
  const emManutencao = bens.filter(b => b.status === 'MANUTENCAO' || String(b.descricao).toLowerCase().includes('defeito')).length;
  const totalCategorias = categorias.length || 0;
  const totalLocais = locais.length || 0;

  // Simulação de valor estimado para encorpar o relatório gerencial
  const valorTotalEstimado = bens.reduce((acc, b) => acc + (b.quantidade || 1) * 150, 0);

  const styles = {
    container: {
      padding: '10px 0',
      display: 'grid',
      gap: '25px',
      color: darkMode ? '#e0e0e0' : '#333'
    },
    gridCards: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px'
    },
    card: {
      padding: '20px',
      borderRadius: '12px',
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
      border: `1px solid ${darkMode ? '#333' : '#dadce0'}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      textAlign: 'center'
    },
    cardNumero: {
      fontSize: '28px',
      fontWeight: 'bold',
      margin: '10px 0 0 0',
      color: '#1a73e8'
    },
    secao: {
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
      padding: '25px',
      borderRadius: '12px',
      border: `1px solid ${darkMode ? '#333' : '#dadce0'}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    },
    tituloSecao: {
      margin: '0 0 20px 0',
      color: '#1a73e8',
      fontSize: '18px',
      fontWeight: 'bold',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    barraGraficoContainer: {
      display: 'grid',
      gap: '15px',
      marginTop: '15px'
    },
    barraLinha: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    barraLabel: {
      width: '120px',
      fontSize: '14px',
      textAlign: 'right',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    barraTrilho: {
      flex: 1,
      backgroundColor: darkMode ? '#333' : '#eee',
      height: '16px',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    barraPreenchida: {
      backgroundColor: '#1a73e8',
      height: '100%',
      borderRadius: '8px',
      transition: 'width 0.5s ease-in-out'
    },
    tabelaRelatorio: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '10px',
      fontSize: '14px'
    },
    th: {
      borderBottom: `2px solid ${darkMode ? '#444' : '#ddd'}`,
      padding: '12px 8px',
      textAlign: 'left',
      color: '#1a73e8'
    },
    td: {
      borderBottom: `1px solid ${darkMode ? '#333' : '#eee'}`,
      padding: '12px 8px'
    },
    btnExportar: {
      backgroundColor: '#137333',
      color: '#fff',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '13px'
    }
  };

  const handleImprimirRelatorio = () => {
    window.print();
  };

  return (
    <div style={styles.container}>
      {/* CARD INDICADORES (DASHBOARD) */}
      <div style={styles.gridCards}>
        <div style={styles.card}>
          <span style={{ fontSize: '14px', color: '#888' }}>Total Patrimônios</span>
          <p style={styles.cardNumero}>{totalItens}</p>
        </div>
        <div style={styles.card}>
          <span style={{ fontSize: '14px', color: '#888' }}>Em Manutenção 🛠️</span>
          <p style={{ ...styles.cardNumero, color: emManutencao > 0 ? '#ff4d4f' : '#1a73e8' }}>{emManutencao}</p>
        </div>
        <div style={styles.card}>
          <span style={{ fontSize: '14px', color: '#888' }}>Locais Atendidos</span>
          <p style={styles.cardNumero}>{totalLocais}</p>
        </div>
        <div style={styles.card}>
          <span style={{ fontSize: '14px', color: '#888' }}>Avaliação de Ativos</span>
          <p style={{ ...styles.cardNumero, color: '#137333' }}>R$ {valorTotalEstimado},00</p>
        </div>
      </div>

      {/* GRÁFICO DE DISTRIBUIÇÃO POR CATEGORIAS (CSS PURO) */}
      <div style={styles.secao}>
        <h3 style={styles.tituloSecao}>📊 Distribuição Volumétrica por Categoria</h3>
        <div style={styles.barraGraficoContainer}>
          {categorias.map(cat => {
            const qtdNaCategoria = bens.filter(b => b.categoria?.id === cat.id).length;
            const porcentagem = totalItens > 0 ? (qtdNaCategoria / totalItens) * 100 : 0;

            return (
              <div key={cat.id} style={styles.barraLinha}>
                <div style={styles.barraLabel}>{cat.nome}</div>
                <div style={styles.barraTrilho}>
                  <div style={{ ...styles.barraPreenchida, width: `${porcentagem || 5}%` }} />
                </div>
                <div style={{ width: '40px', fontSize: '14px', fontWeight: 'bold' }}>{qtdNaCategoria}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RELATÓRIO GERENCIAL ANALÍTICO */}
      <div style={styles.secao}>
        <div style={styles.tituloSecao}>
          <span>📜 Relatório Gerencial Analítico de Ativos</span>
          <button onClick={handleImprimirRelatorio} style={styles.btnExportar}>
            🖨️ Emitir Relatório (PDF)
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.tabelaRelatorio}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Patrimônio</th>
                <th style={styles.th}>Categoria</th>
                <th style={styles.th}>Localização</th>
                <th style={styles.th}>Qtd</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bens.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: '#888' }}>
                    Nenhum registro encontrado para consolidação gerencial.
                  </td>
                </tr>
              ) : (
                bens.map(b => (
                  <tr key={b.id}>
                    <td style={styles.td}>#{b.id}</td>
                    <td style={styles.td}><strong>{b.nome}</strong></td>
                    <td style={styles.td}>{b.categoria?.nome || 'Geral'}</td>
                    <td style={styles.td}>{b.local?.nome || 'Não definido'}</td>
                    <td style={styles.td}>{b.quantidade || 1}</td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: b.status === 'MANUTENCAO' ? '#ff4d4f22' : '#13733322',
                        color: b.status === 'MANUTENCAO' ? '#ff4d4f' : '#137333'
                      }}>
                        {b.status === 'MANUTENCAO' ? 'MANUTENÇÃO' : 'ATIVO'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}