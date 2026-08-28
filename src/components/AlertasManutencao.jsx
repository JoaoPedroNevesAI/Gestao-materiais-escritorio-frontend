import React, { useState } from 'react';
import api from '../services/api';

export default function AlertasManutencao({ darkMode, bens = [], onUpdateItem }) {
  const [loadingId, setLoadingId] = useState(null);
  const [responsaveis, setResponsaveis] = useState({});

  // Garantia de array válido
  const listaBens = Array.isArray(bens) ? bens : [];

  // Filtra itens que precisam de atenção/manutenção
  const itensCriticos = listaBens.filter(item => 
    item.status === 'MANUTENCAO' || 
    item.situacao === 'MANUTENCAO' || 
    String(item.descricao || '').toLowerCase().includes('defeito')
  );

  // Atualiza responsável localmente
  const handleResponsavelChange = (id, nome) => {
    setResponsaveis(prev => ({ ...prev, [id]: nome }));
  };

  // Trata a conclusão da manutenção / retorno ao estoque
  const handleConcluirManutencao = async (item) => {
    setLoadingId(item.id);
    const responsavelAtual = responsaveis[item.id] || item.responsavel || 'Não informado';

    try {
      // Tenta atualizar no backend via API se a rota existir
      if (api && typeof api.put === 'function') {
        await api.put(`/bens/${item.id}`, {
          ...item,
          status: 'ATIVO',
          situacao: 'ATIVO',
          observacao: `Manutenção concluída sob responsabilidade de: ${responsavelAtual}`
        });
      }

      // Notifica o componente pai para atualizar a lista global
      if (onUpdateItem) {
        onUpdateItem({ ...item, status: 'ATIVO', situacao: 'ATIVO' });
      } else {
        alert(`Status do item "${item.nome}" alterado para ATIVO com sucesso!`);
      }
    } catch (err) {
      console.error('Erro ao atualizar status de manutenção:', err);
      // Fallback local caso o backend ainda não tenha o endpoint 100% pronto
      if (onUpdateItem) {
        onUpdateItem({ ...item, status: 'ATIVO', situacao: 'ATIVO' });
      }
    } finally {
      setLoadingId(null);
    }
  };

  const styles = {
    container: {
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
      padding: '20px',
      borderRadius: '16px',
      border: `1px solid ${darkMode ? '#333' : '#dadce0'}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      fontFamily: 'system-ui, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      borderBottom: `1px solid ${darkMode ? '#333' : '#eee'}`,
      paddingBottom: '10px'
    },
    titulo: {
      margin: 0,
      fontSize: '16px',
      fontWeight: '700',
      color: darkMode ? '#ff4d4f' : '#d93025',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    grid: {
      display: 'grid',
      gap: '12px'
    },
    cardItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '14px',
      borderRadius: '10px',
      backgroundColor: darkMode ? '#2d2d2d' : '#fcf8e3',
      border: `1px solid ${darkMode ? '#444' : '#faebcc'}`,
      color: darkMode ? '#e0e0e0' : '#8a6d3b'
    },
    infoGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    nomeItem: {
      fontWeight: '700',
      fontSize: '14px',
      color: darkMode ? '#fff' : '#333'
    },
    detalhe: {
      fontSize: '12px',
      opacity: 0.85
    },
    acoesGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap'
    },
    inputResponsavel: {
      padding: '6px 10px',
      borderRadius: '6px',
      border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
      color: darkMode ? '#fff' : '#333',
      fontSize: '12px',
      outline: 'none',
      width: '150px'
    },
    btnConcluir: {
      backgroundColor: '#2ecc71',
      color: '#fff',
      border: 'none',
      padding: '7px 14px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 'bold',
      transition: 'background-color 0.2s'
    },
    vazio: {
      margin: 0,
      fontSize: '13px',
      color: darkMode ? '#aaa' : '#666',
      textAlign: 'center',
      padding: '15px 0'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.titulo}>🛠️ Gestão de Alertas e Manutenção ({itensCriticos.length})</h3>
      </div>

      {itensCriticos.length === 0 ? (
        <p style={styles.vazio}>✅ Todos os patrimônios estão operacionais e em bom estado.</p>
      ) : (
        <div style={styles.grid}>
          {itensCriticos.map(item => {
            const localNome = item.local?.nome || item.localNome || 'Local não informado';
            const responsavelAtual = responsaveis[item.id] ?? (item.responsavel || '');

            return (
              <div key={item.id} style={styles.cardItem}>
                <div style={styles.infoGroup}>
                  <span style={styles.nomeItem}>#{item.id} - {item.nome}</span>
                  <span style={styles.detalhe}>📍 <strong>Local:</strong> {localNome}</span>
                  {item.descricao && (
                    <span style={styles.detalhe}>📝 <strong>Problema:</strong> {item.descricao}</span>
                  )}
                </div>

                <div style={styles.acoesGroup}>
                  <input
                    type="text"
                    placeholder="Técnico/Responsável"
                    value={responsavelAtual}
                    onChange={(e) => handleResponsavelChange(item.id, e.target.value)}
                    style={styles.inputResponsavel}
                  />

                  <button
                    style={styles.btnConcluir}
                    disabled={loadingId === item.id}
                    onClick={() => handleConcluirManutencao(item)}
                  >
                    {loadingId === item.id ? 'Salvando...' : '✓ Retornar ao Estoque'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}