import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import ImagemAutenticada from './ImagemAutenticada'; 

export default function TabelaEstoque({ materiais, aoRemover, aoEditar, darkMode, usuarioLogado }) {

  const [qrVisivel, setQrVisivel] = useState(null);
  const podeEditar = usuarioLogado?.role && String(usuarioLogado.role).includes('ADM');

  const formatarValor = (valor) => {
    if (valor == null) return '0,00';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const estiloImagem = {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '6px',
    display: 'block'
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
      <thead>
        <tr style={{ borderBottom: darkMode ? '2px solid #333' : '2px solid #eee', textAlign: 'left' }}>
          <th style={{ padding: '12px' }}>Imagem</th>
          <th style={{ padding: '12px' }}>Nome / Descrição</th>
          <th style={{ padding: '12px' }}>Categoria</th>
          <th style={{ padding: '12px' }}>Local</th>
          <th style={{ padding: '12px' }}>Valor</th>
          {podeEditar && <th style={{ textAlign: 'center', padding: '12px' }}>Ações</th>}
        </tr>
      </thead>

      <tbody>
        {materiais.length === 0 ? (
          <tr>
            <td 
              colSpan={podeEditar ? 6 : 5} 
              style={{ textAlign: 'center', padding: '30px', color: '#999' }}
            >
              Nenhum património encontrado.
            </td>
          </tr>
        ) : (
          materiais.map(item => {
            const nomeDaImagem = item.imagem || item.foto;
            
            // ATENÇÃO: Montamos a URL limpa na raiz do servidor para o navegador baixar direto
            const urlCompletaImagem = nomeDaImagem 
              ? `http://localhost:8080/imagens_cadastradas/${nomeDaImagem}` 
              : null;

            return (
              <tr 
                key={item.id} 
                style={{ borderBottom: darkMode ? '1px solid #2d2d2d' : '1px solid #f0f0f0' }}
              >
                <td style={{ padding: '12px' }}>
                  <ImagemAutenticada 
                    url={urlCompletaImagem}
                    alt={item.nome || 'Património'}
                    darkMode={darkMode}
                    style={estiloImagem}
                  />
                </td>

                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: '600', color: '#1a73e8' }}>
                    {item.nome || 'Sem nome'}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: darkMode ? '#aaa' : '#5f6368', 
                    marginTop: '4px' 
                  }}>
                    {item.descricao || "Sem descrição adicional"}
                  </div>
                </td>

                <td style={{ padding: '12px' }}>
                  <span style={{
                    backgroundColor: darkMode ? '#1a73e822' : '#e8f0fe',
                    color: '#1a73e8',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {item.categoria?.nome || 'Geral'}
                  </span>
                </td>

                <td style={{ padding: '12px' }}>
                  {item.local?.nome || '—'}
                </td>

                <td style={{ padding: '12px', fontWeight: '500' }}>
                  R$ {formatarValor(item.valor)}
                </td>

                {podeEditar && (
                  <td style={{ textAlign: 'center', position: 'relative', padding: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                      
                      <button 
                        onClick={() => setQrVisivel(qrVisivel === item.id ? null : item.id)}
                        style={{ 
                          padding: '5px 10px', 
                          fontSize: '12px', 
                          backgroundColor: darkMode ? '#2d2d2d' : '#f8f9fa',
                          border: darkMode ? '1px solid #444' : '1px solid #ddd',
                          color: darkMode ? '#fff' : '#333',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          width: '95px'
                        }}
                      >
                        🖼️ QR
                      </button>

                      <button 
                        className="btn btn-danger" 
                        onClick={() => aoRemover(item.id)}
                        style={{ 
                          padding: '5px 10px', 
                          fontSize: '12px',
                          width: '95px' 
                        }}
                      >
                        Dar Baixa
                      </button>

                      <button 
                        onClick={() => aoEditar(item)}
                        style={{ 
                          padding: '5px 10px', 
                          fontSize: '12px', 
                          backgroundColor: darkMode ? '#4d3b00' : '#fff3cd',
                          border: darkMode ? '1px solid #665200' : '1px solid #ffeeba',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: darkMode ? '#ffeb99' : '#856404',
                          width: '95px'
                        }}
                      >
                        ✏️ Editar
                      </button>

                    </div>

                    {qrVisivel === item.id && (
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '50px', 
                        right: '55%', 
                        transform: 'translateX(50%)',
                        zIndex: 100, 
                        background: 'white', 
                        padding: '10px', 
                        border: '1px solid #dadce0', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                      }}>
                        <QRCodeSVG 
                          value={`PATRIMONIO_ID: ${item.id}\nNOME: ${item.nome}\nLOCAL: ${item.local?.nome || 'Não Informado'}`} 
                          size={110} 
                        />
                        <div style={{ fontSize: '9px', marginTop: '5px', color: '#666' }}>ID: {item.id}</div>
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
  );
}