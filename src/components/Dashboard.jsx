import React from 'react';

export default function Dashboard({ bens, categorias, locais, darkMode }) {
  // 1. Totalizadores Absolutos baseados na quantidade real em estoque
  const totalItens = bens.reduce((acc, b) => acc + (parseInt(b.quantidade) || 0), 0);
  
  // 2. Filtro dinâmico de manutenção somando as quantidades dos itens afetados
  const emManutencao = bens
    .filter(b => b.status === 'MANUTENCAO' || String(b.descricao).toLowerCase().includes('defeito'))
    .reduce((acc, b) => acc + (parseInt(b.quantidade) || 0), 0);

  const totalLocais = locais.length || 0;

  // PENTE FINO: Cálculo real baseado no preço unitário vindo do banco de dados Java
  const valorTotalEstimado = bens.reduce((acc, b) => {
    const qtd = parseInt(b.quantidade) || 0;
    const precoUnitario = parseFloat(b.valor) || 0.0;
    return acc + (qtd * precoUnitario);
  }, 0);

  const styles = {
    container: {
      padding: '10px 0',
      display: 'grid',
      gap: '25px',
      color: darkMode ? '#e0e0e0' : '#333',
      fontFamily: 'system-ui, sans-serif'
    },
    gridCards: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '20px'
    },
    card: {
      padding: '22px',
      borderRadius: '16px', // Ajustado para o novo padrão de curvas do layout
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
      border: `1px solid ${darkMode ? '#333' : '#dadce0'}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      textAlign: 'center',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    cardNumero: {
      fontSize: '26px',
      fontWeight: '700',
      margin: '10px 0 0 0',
      color: '#1a73e8',
      letterSpacing: '-0.5px'
    },
    secao: {
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
      padding: '25px',
      borderRadius: '16px',
      border: `1px solid ${darkMode ? '#333' : '#dadce0'}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
    },
    tituloSecao: {
      margin: '0 0 20px 0',
      color: '#1a73e8',
      fontSize: '16px',
      fontWeight: '700',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    barraGraficoContainer: {
      display: 'grid',
      gap: '16px',
      marginTop: '15px'
    },
    barraLinha: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    barraLabel: {
      width: '130px',
      fontSize: '13.5px',
      textAlign: 'right',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontWeight: '500'
    },
    barraTrilho: {
      flex: 1,
      backgroundColor: darkMode ? '#2d2d2d' : '#f1f3f4',
      height: '14px',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    barraPreenchida: {
      backgroundColor: '#1a73e8',
      height: '100%',
      borderRadius: '8px',
      transition: 'width 0.4s ease-out'
    },
    tabelaRelatorio: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '10px',
      fontSize: '13.5px'
    },
    th: {
      borderBottom: `2px solid ${darkMode ? '#333' : '#eee'}`,
      padding: '12px 10px',
      textAlign: 'left',
      color: darkMode ? '#aaa' : '#555',
      fontWeight: '600',
      fontSize: '12px',
      textTransform: 'uppercase'
    },
    td: {
      borderBottom: `1px solid ${darkMode ? '#2d2d2d' : '#eee'}`,
      padding: '12px 10px',
      color: darkMode ? '#e0e0e0' : '#444'
    },
    btnExportar: {
      backgroundColor: '#137333',
      color: '#fff',
      border: 'none',
      padding: '10px 18px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '13px',
      boxShadow: '0 2px 6px rgba(19,115,51,0.2)',
      transition: 'background 0.2s'
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
          <span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>Volume de Patrimônios</span>
          <p style={styles.cardNumero}>{totalItens}</p>
        </div>
        <div style={styles.card}>
          <span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>Unidades em Manutenção 🛠️</span>
          <p style={{ ...styles.cardNumero, color: emManutencao > 0 ? '#ff4d4f' : '#1a73e8' }}>{emManutencao}</p>
        </div>
        <div style={styles.card}>
          <span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>Locais Atendidos</span>
          <p style={styles.cardNumero}>{totalLocais}</p>
        </div>
        <div style={styles.card}>
          <span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>Avaliação Total de Ativos</span>
          <p style={{ ...styles.cardNumero, color: '#2ecc71' }}>
            {valorTotalEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      {/* GRÁFICO DE DISTRIBUIÇÃO POR CATEGORIAS */}
      <div style={styles.secao}>
        <h3 style={styles.tituloSecao}>📊 Distribuição Volumétrica por Categoria</h3>
        <div style={styles.barraGraficoContainer}>
          {categorias.map(cat => {
            // PENTE FINO: Contagem baseada na soma real das quantidades físicas e não no tamanho do array
            const qtdNaCategoria = bens
              .filter(b => b.categoria?.id === cat.id)
              .reduce((acc, b) => acc + (parseInt(b.quantidade) || 0), 0);

            const porcentagem = totalItens > 0 ? (qtdNaCategoria / totalItens) * 100 : 0;

            return (
              <div key={cat.id} style={styles.barraLinha}>
                <div style={styles.barraLabel}>{cat.nome}</div>
                <div style={styles.barraTrilho}>
                  <div style={{ ...styles.barraPreenchida, width: `${porcentagem}%` }} />
                </div>
                <div style={{ width: '40px', fontSize: '13px', fontWeight: '700', textAlign: 'left', paddingLeft: '5px' }}>
                  {qtdNaCategoria}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RELATÓRIO GERENCIAL ANALÍTICO */}
      <div style={styles.secao}>
        <div style={styles.tituloSecao}>
          <span>📜 Relatório Gerencial Analítico de Ativos</span>
          <button 
            onClick={handleImprimirRelatorio} 
            style={styles.btnExportar}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0f5b27'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#137333'}
          >
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
                <th style={styles.th}>Valor Unitário</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bens.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ ...styles.td, textAlign: 'center', color: '#888', py: '20px' }}>
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
                    <td style={styles.td}>{b.quantidade || 0}</td>
                    <td style={styles.td}>
                      {(parseFloat(b.valor) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: b.status === 'MANUTENCAO' ? '#ff4d4f22' : '#2ecc7122',
                        color: b.status === 'MANUTENCAO' ? '#ff4d4f' : '#2ecc71',
                        border: b.status === 'MANUTENCAO' ? '1px solid #ff4d4f33' : '1px solid #2ecc7133'
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