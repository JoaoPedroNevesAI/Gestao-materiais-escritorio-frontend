import React, { useState } from 'react';
import api from '../services/api';

export default function AlertasManutencao({ darkMode, bens = [], onUpdateItem, usuarioLogado }) {
  const [loadingId, setLoadingId] = useState(null);
  const [responsaveis, setResponsaveis] = useState({});

  // Verificação robusta de permissão de Administrador
  const roleUpper = String(usuarioLogado?.role || usuarioLogado?.perfil || '').toUpperCase();
  const eAdmin = roleUpper.includes('ADM') || roleUpper.includes('ADMIN');

  // Garantia de array válido (trata array simples ou paginação { content: [...] })
  const listaBens = Array.isArray(bens) ? bens : (bens?.content || []);

  // Helper para verificar status de manutenção
  const isBemEmManutencao = (item) => {
    if (!item) return false;
    const statusUpper = String(item.status || item.statusMaterial || item.situacao || '').toUpperCase();
    const descLower = String(item.descricao || '').toLowerCase();
    return statusUpper === 'MANUTENCAO' || statusUpper === 'EM_MANUTENCAO' || descLower.includes('defeito');
  };

  // Filtra itens que precisam de atenção/manutenção
  const itensCriticos = listaBens.filter(isBemEmManutencao);

  // Atualiza responsável localmente
  const handleResponsavelChange = (id, nome) => {
    setResponsaveis(prev => ({ ...prev, [id]: nome }));
  };

  // Trata a conclusão da manutenção / retorno ao estoque (Exclusivo Administrador)
  const handleConcluirManutencao = async (item) => {
    if (!eAdmin) {
      alert("Apenas administradores podem concluir manutenções e retornar itens ao estoque.");
      return;
    }

    setLoadingId(item.id);
    const responsavelAtual = responsaveis[item.id] || item.responsavel || 'Não informado';

    // Monta o payload limpo mantendo a estrutura compatível com o backend
    const payloadAtualizado = {
      ...item,
      status: 'ATIVO',
      statusMaterial: 'ATIVO',
      situacao: 'ATIVO',
      responsavel: responsavelAtual,
      observacao: `Manutenção concluída sob responsabilidade de: ${responsavelAtual}`
    };

    try {
      let resposta = null;
      if (api && typeof api.put === 'function') {
        try {
          // Tenta endpoint /bens/
          resposta = await api.put(`/bens/${item.id}`, payloadAtualizado);
        } catch (errBens) {
          // Fallback para endpoint /materiais/ caso a rota seja do padrão Spring Boot /materiais
          resposta = await api.put(`/materiais/${item.id}`, payloadAtualizado);
        }
      }

      const itemSalvo = resposta?.data || payloadAtualizado;

      // Notifica o componente pai para atualizar o estado global
      if (onUpdateItem) {
        onUpdateItem(itemSalvo);
      }
      
      alert(`Status do item "${item.nome || item.descricao}" alterado para ATIVO com sucesso!`);
    } catch (err) {
      console.error('Erro ao atualizar status de manutenção:', err);
      
      // Fallback local caso o backend rejeite a rota em ambiente de testes
      if (onUpdateItem) {
        onUpdateItem(payloadAtualizado);
        alert(`Status atualizado localmente para ATIVO.`);
      } else {
        alert('Erro ao comunicar com o servidor. Verifique a conexão com a API.');
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
      backgroundColor: eAdmin ? '#2ecc71' : '#888',
      color: '#fff',
      border: 'none',
      padding: '7px 14px',
      borderRadius: '6px',
      cursor: eAdmin ? 'pointer' : 'not-allowed',
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
                  <span style={styles.nomeItem}>#{item.id} - {item.nome || item.descricao}</span>
                  <span style={styles.detalhe}>📍 <strong>Local:</strong> {localNome}</span>
                  {item.descricao && (
                    <span style={styles.detalhe}>📝 <strong>Problema:</strong> {item.descricao}</span>
                  )}
                </div>

                <div style={styles.acoesGroup}>
                  <input
                    type="text"
                    placeholder="Técnico/Responsável"
                    disabled={!eAdmin}
                    value={responsavelAtual}
                    onChange={(e) => handleResponsavelChange(item.id, e.target.value)}
                    style={{
                      ...styles.inputResponsavel,
                      cursor: !eAdmin ? 'not-allowed' : 'text',
                      opacity: !eAdmin ? 0.7 : 1
                    }}
                  />

                  <button
                    style={styles.btnConcluir}
                    disabled={loadingId === item.id || !eAdmin}
                    onClick={() => handleConcluirManutencao(item)}
                    title={!eAdmin ? 'Apenas administradores podem dar baixa em manutenções' : ''}
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