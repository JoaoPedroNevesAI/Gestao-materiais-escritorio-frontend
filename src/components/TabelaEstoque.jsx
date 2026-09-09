import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import ImagemAutenticada from './ImagemAutenticada';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8080';

export default function TabelaEstoque({ 
  patrimonios = [], // Renomeado de materiais para patrimonios
  aoRemover, 
  aoEditar, 
  darkMode, 
  usuarioLogado 
}) {
  const [qrVisivel, setQrVisivel] = useState(null);

  // Verificação de permissões do usuário
  const podeEditar = usuarioLogado?.role && String(usuarioLogado.role).includes('ADM');

  const formatarValor = (valor) => {
    if (valor == null || valor === '') return '0,00';
    const num = Number(valor);
    if (isNaN(num)) return '0,00';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const tratarItemParaEdicao = (item) => {
    const itemFormatado = { ...item };

    if (itemFormatado.dataAquisicao && typeof itemFormatado.dataAquisicao === 'string') {
      itemFormatado.dataAquisicao = itemFormatado.dataAquisicao.split('T')[0];
    }

    const prazo = itemFormatado.prazoManutencao || itemFormatado.prazoLimiteManutencao;
    if (prazo && typeof prazo === 'string') {
      itemFormatado.prazoManutencao = prazo.split('T')[0];
    }

    aoEditar(itemFormatado);
  };

  const estiloImagem = {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '8px',
    display: 'block',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  };

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontFamily: 'system-ui, sans-serif' }}>
        <thead>
          <tr style={{ borderBottom: darkMode ? '2px solid #333' : '2px solid #eee', textAlign: 'left', color: darkMode ? '#aaa' : '#5f6368', fontSize: '14px' }}>
            <th style={{ padding: '14px 12px' }}>Imagem</th>
            <th style={{ padding: '14px 12px' }}>Patrimônio / Descrição</th>
            <th style={{ padding: '14px 12px' }}>Categoria</th>
            <th style={{ padding: '14px 12px' }}>Local</th>
            <th style={{ padding: '14px 12px' }}>Valor</th>
            {podeEditar && <th style={{ textAlign: 'center', padding: '14px 12px' }}>Ações</th>}
          </tr>
        </thead>

        <tbody>
          {patrimonios.length === 0 ? (
            <tr>
              <td 
                colSpan={podeEditar ? 6 : 5} 
                style={{ textAlign: 'center', padding: '40px', color: '#777', fontSize: '15px' }}
              >
                Nenhum patrimônio encontrado.
              </td>
            </tr>
          ) : (
            patrimonios.map(item => {
              // Mapeamento flexível das propriedades trazidas pelo backend
              const nomeDaImagem = item.imagem || item.foto || item.imagemUrl || item.caminhoImagem;
              const urlCompletaImagem = nomeDaImagem 
                ? (nomeDaImagem.startsWith('http') ? nomeDaImagem : `${API_URL}/uploads/${nomeDaImagem}`)
                : null;

              const nomeCategoria = item.categoria?.nome || item.categoria || 'Geral';
              const nomeLocal = item.local?.nome || item.local || '—';

              return (
                <tr 
                  key={item.id} 
                  style={{ 
                    borderBottom: darkMode ? '1px solid #2d2d2d' : '1px solid #f0f0f0',
                    transition: 'background-color 0.2s',
                    color: darkMode ? '#e0e0e0' : '#333'
                  }}
                >
                  <td style={{ padding: '12px' }}>
                    <ImagemAutenticada 
                      url={urlCompletaImagem}
                      alt={item.nome || 'Patrimônio'}
                      darkMode={darkMode}
                      style={estiloImagem}
                    />
                  </td>

                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '600', color: '#1a73e8', fontSize: '15px' }}>
                      {item.nome || 'Sem nome'}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: darkMode ? '#aaa' : '#5f6368', 
                      marginTop: '4px',
                      maxWidth: '280px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.descricao || "Sem descrição adicional"}
                    </div>
                  </td>

                  <td style={{ padding: '12px' }}>
                    <span style={{
                      backgroundColor: darkMode ? '#1a73e822' : '#e8f0fe',
                      color: '#1a73e8',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase'
                    }}>
                      {nomeCategoria}
                    </span>
                  </td>

                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {nomeLocal}
                  </td>

                  <td style={{ padding: '12px', fontWeight: '600', fontSize: '14px' }}>
                    R$ {formatarValor(item.valor)}
                  </td>

                  {podeEditar && (
                    <td style={{ textAlign: 'center', position: 'relative', padding: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                        
                        {/* Botão QR */}
                        <button 
                          onClick={() => setQrVisivel(qrVisivel === item.id ? null : item.id)}
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px', 
                            fontWeight: '500',
                            backgroundColor: darkMode ? '#2d2d2d' : '#f1f3f4',
                            border: darkMode ? '1px solid #444' : '1px solid #dadce0',
                            color: darkMode ? '#fff' : '#3c4043',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            width: '100px',
                            transition: 'all 0.2s'
                          }}
                        >
                          🖼️ QR
                        </button>

                        {/* Botão Dar Baixa */}
                        <button 
                          onClick={() => aoRemover(item.id)}
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: darkMode ? '#3c1e1e' : '#fce8e6',
                            border: darkMode ? '1px solid #662525' : '1px solid #fad2cf',
                            color: darkMode ? '#ff9999' : '#c5221f',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            width: '100px',
                            transition: 'all 0.2s'
                          }}
                        >
                          Dar Baixa
                        </button>

                        {/* Botão Editar */}
                        <button 
                          onClick={() => tratarItemParaEdicao(item)}
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px', 
                            fontWeight: '600',
                            backgroundColor: darkMode ? '#4d3b00' : '#fff3cd',
                            border: darkMode ? '1px solid #665200' : '1px solid #ffeeba',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: darkMode ? '#ffeb99' : '#856404',
                            width: '100px',
                            transition: 'all 0.2s'
                          }}
                        >
                          ✏️ Editar
                        </button>

                      </div>

                      {/* POPUP DO QR CODE */}
                      {qrVisivel === item.id && (
                        <div style={{ 
                          position: 'absolute', 
                          top: '50%',
                          right: '105%',
                          transform: 'translateY(-50%)',
                          zIndex: 110, 
                          background: darkMode ? '#2d2d2d' : '#fff', 
                          padding: '16px 12px 12px 12px', 
                          border: darkMode ? '1px solid #444' : '1px solid #dadce0', 
                          borderRadius: '12px', 
                          boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.25)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          minWidth: '130px'
                        }}>
                          <button 
                            onClick={() => setQrVisivel(null)}
                            title="Fechar QR Code"
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '6px',
                              background: 'transparent',
                              border: 'none',
                              color: darkMode ? '#aaa' : '#5f6368',
                              fontSize: '16px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              padding: '2px',
                              lineHeight: '1',
                              transition: 'color 0.2s'
                            }}
                          >
                            &times;
                          </button>

                          <div style={{ 
                            marginTop: '6px',
                            background: '#fff', 
                            padding: '6px',
                            borderRadius: '6px'
                          }}>
                            <QRCodeSVG 
                              value={`PATRIMONIO_ID: ${item.id}\nNOME: ${item.nome || ''}\nLOCAL: ${nomeLocal}`} 
                              size={115} 
                            />
                          </div>
                          
                          <div style={{ 
                            fontSize: '11px', 
                            marginTop: '8px', 
                            color: darkMode ? '#e0e0e0' : '#3c4043', 
                            fontWeight: '600' 
                          }}>
                            ID: {item.id}
                          </div>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}