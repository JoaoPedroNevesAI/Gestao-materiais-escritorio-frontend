import React, { useState } from 'react';

export default function Dashboard({ bens = [], categorias = [], locais = [], darkMode }) {
  // Estados para Filtros Dinâmicos no Relatório
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [busca, setBusca] = useState('');

  // Garantia de segurança contra arrays nulos/undefined
  const listaBens = Array.isArray(bens) ? bens : [];
  const listaCategorias = Array.isArray(categorias) ? categorias : [];
  const listaLocais = Array.isArray(locais) ? locais : [];

  // 1. Totalizadores Absolutos
  const totalItens = listaBens.reduce((acc, b) => acc + (parseInt(b.quantidade) || 0), 0);
  
  const emManutencao = listaBens
    .filter(b => b.status === 'MANUTENCAO' || String(b.descricao || '').toLowerCase().includes('defeito'))
    .reduce((acc, b) => acc + (parseInt(b.quantidade) || 0), 0);

  const totalLocais = listaLocais.length;

  const valorTotalEstimado = listaBens.reduce((acc, b) => {
    const qtd = parseInt(b.quantidade) || 0;
    const precoUnitario = parseFloat(b.valor) || 0.0;
    return acc + (qtd * precoUnitario);
  }, 0);

  // 2. Aplicação de Filtros na Tabela Analítica
  const bensFiltrados = listaBens.filter(b => {
    const idCat = b.categoria?.id || b.categoriaId;
    const idLoc = b.local?.id || b.localId;
    const nomeMat = String(b.nome || '').toLowerCase();

    const bateCategoria = !filtroCategoria || Number(idCat) === Number(filtroCategoria);
    const bateLocal = !filtroLocal || Number(idLoc) === Number(filtroLocal);
    const bateStatus = !filtroStatus || b.status === filtroStatus;
    const bateBusca = !busca || nomeMat.includes(busca.toLowerCase());

    return bateCategoria && bateLocal && bateStatus && bateBusca;
  });

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
      borderRadius: '16px',
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
      border: `1px solid ${darkMode ? '#333' : '#dadce0'}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      textAlign: 'center'
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
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '10px'
    },
    gridGraficos: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '20px'
    },
    barraGraficoContainer: { display: 'grid', gap: '14px', marginTop: '10px' },
    barraLinha: { display: 'flex', alignItems: 'center', gap: '15px' },
    barraLabel: {
      width: '120px', fontSize: '13px', textAlign: 'right',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500'
    },
    barraTrilho: {
      flex: 1, backgroundColor: darkMode ? '#2d2d2d' : '#f1f3f4',
      height: '14px', borderRadius: '8px', overflow: 'hidden'
    },
    barraPreenchida: { backgroundColor: '#1a73e8', height: '100%', borderRadius: '8px', transition: 'width 0.4s ease-out' },
    filtrosBarra: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '12px',
      marginBottom: '20px'
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
    tabelaRelatorio: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '13.5px' },
    th: {
      borderBottom: `2px solid ${darkMode ? '#333' : '#eee'}`,
      padding: '12px 10px', textAlign: 'left', color: darkMode ? '#aaa' : '#555',
      fontWeight: '600', fontSize: '12px', textTransform: 'uppercase'
    },
    td: { borderBottom: `1px solid ${darkMode ? '#2d2d2d' : '#eee'}`, padding: '12px 10px', color: darkMode ? '#e0e0e0' : '#444' },
    btnExportar: {
      backgroundColor: '#1a73e8', color: '#fff', border: 'none', padding: '8px 16px',
      borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
    }
  };

  return (
    <div style={styles.container}>
      {/* CARD INDICADORES (KPIs) */}
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
          <span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>Locais Cadastrados</span>
          <p style={styles.cardNumero}>{totalLocais}</p>
        </div>
        <div style={styles.card}>
          <span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>Avaliação Total de Ativos</span>
          <p style={{ ...styles.cardNumero, color: '#2ecc71' }}>
            {valorTotalEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      {/* GRÁFICOS DE DISTRIBUIÇÃO */}
      <div style={styles.gridGraficos}>
        {/* Distribuição por Categoria */}
        <div style={styles.secao}>
          <h3 style={styles.tituloSecao}>📊 Distribuição por Categoria</h3>
          <div style={styles.barraGraficoContainer}>
            {listaCategorias.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#888', textAlign: 'center' }}>Nenhuma categoria cadastrada.</p>
            ) : (
              listaCategorias.map(cat => {
                const qtdNaCategoria = listaBens
                  .filter(b => (b.categoria?.id || b.categoriaId) === cat.id)
                  .reduce((acc, b) => acc + (parseInt(b.quantidade) || 0), 0);

                const porcentagem = totalItens > 0 ? (qtdNaCategoria / totalItens) * 100 : 0;

                return (
                  <div key={cat.id} style={styles.barraLinha}>
                    <div style={styles.barraLabel}>{cat.nome}</div>
                    <div style={styles.barraTrilho}>
                      <div style={{ ...styles.barraPreenchida, width: `${porcentagem}%` }} />
                    </div>
                    <div style={{ width: '35px', fontSize: '13px', fontWeight: '700' }}>{qtdNaCategoria}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Distribuição por Local */}
        <div style={styles.secao}>
          <h3 style={styles.tituloSecao}>📍 Distribuição por Local</h3>
          <div style={styles.barraGraficoContainer}>
            {listaLocais.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#888', textAlign: 'center' }}>Nenhum local cadastrado.</p>
            ) : (
              listaLocais.map(loc => {
                const qtdNoLocal = listaBens
                  .filter(b => (b.local?.id || b.localId) === loc.id)
                  .reduce((acc, b) => acc + (parseInt(b.quantidade) || 0), 0);

                const porcentagem = totalItens > 0 ? (qtdNoLocal / totalItens) * 100 : 0;

                return (
                  <div key={loc.id} style={styles.barraLinha}>
                    <div style={styles.barraLabel}>{loc.nome}</div>
                    <div style={styles.barraTrilho}>
                      <div style={{ ...styles.barraPreenchida, width: `${porcentagem}%`, backgroundColor: '#34a853' }} />
                    </div>
                    <div style={{ width: '35px', fontSize: '13px', fontWeight: '700' }}>{qtdNoLocal}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RELATÓRIO GERENCIAL ANALÍTICO COM FILTROS */}
      <div style={styles.secao}>
        <div style={styles.tituloSecao}>
          <span>📜 Relatório Gerencial Analítico de Ativos ({bensFiltrados.length})</span>
          <button style={styles.btnExportar} onClick={() => window.print()}>
            🖨️ Imprimir Relatório
          </button>
        </div>

        {/* BARRA DE FILTROS */}
        <div style={styles.filtrosBarra}>
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={styles.inputFiltro}
          />
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} style={styles.inputFiltro}>
            <option value="">Todas as Categorias</option>
            {listaCategorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <select value={filtroLocal} onChange={(e) => setFiltroLocal(e.target.value)} style={styles.inputFiltro}>
            <option value="">Todos os Locais</option>
            {listaLocais.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </select>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={styles.inputFiltro}>
            <option value="">Todos os Status</option>
            <option value="ATIVO">Ativo</option>
            <option value="MANUTENCAO">Manutenção</option>
          </select>
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
              {bensFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ ...styles.td, textAlign: 'center', color: '#888', padding: '20px' }}>
                    Nenhum registro encontrado para consolidação gerencial.
                  </td>
                </tr>
              ) : (
                bensFiltrados.map(b => {
                  const nomeCat = b.categoria?.nome || listaCategorias.find(c => c.id === b.categoriaId)?.nome || 'Geral';
                  const nomeLoc = b.local?.nome || listaLocais.find(l => l.id === b.localId)?.nome || 'Não definido';
                  const isManutencao = b.status === 'MANUTENCAO';

                  return (
                    <tr key={b.id}>
                      <td style={styles.td}>#{b.id}</td>
                      <td style={styles.td}><strong>{b.nome}</strong></td>
                      <td style={styles.td}>{nomeCat}</td>
                      <td style={styles.td}>{nomeLoc}</td>
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
                          backgroundColor: isManutencao ? '#ff4d4f22' : '#2ecc7122',
                          color: isManutencao ? '#ff4d4f' : '#2ecc71',
                          border: isManutencao ? '1px solid #ff4d4f33' : '1px solid #2ecc7133'
                        }}>
                          {isManutencao ? 'MANUTENÇÃO' : 'ATIVO'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}