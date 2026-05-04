import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // Lembra de rodar: npm install qrcode.react

// Componente recebe:
// - materiais: lista de itens do estoque
// - aoRemover: função para remover item
// - aoEditar: função para carregar dados no formulário (NOVO)
// - podeEditar: controla se mostra ações (permissão)
export default function TabelaEstoque({ materiais, aoRemover, aoEditar, podeEditar }) {

  // Estado para controlar qual QR Code está aberto
  const [qrVisivel, setQrVisivel] = useState(null);

  // Função para formatar valor monetário
  const formatarValor = (valor) => {
    if (valor == null) return '—';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  return (
    <table>
      {/* Cabeçalho */}
      <thead>
        <tr>
          <th>Imagem</th>
          <th>Nome / Descrição</th>
          <th>Categoria</th>
          <th>Local</th>
          <th>Valor</th>
          {/* Só mostra coluna de ações se tiver permissão */}
          {podeEditar && <th style={{ textAlign: 'center' }}>Ações</th>}
        </tr>
      </thead>

      <tbody>
        {/* Se não tiver itens */}
        {materiais.length === 0 ? (
          <tr>
            <td 
              colSpan={podeEditar ? 6 : 5} 
              style={{ textAlign: 'center', padding: '20px', color: '#999' }}
            >
              Nenhum patrimônio encontrado.
            </td>
          </tr>
        ) : (
          // Renderiza cada item
          materiais.map(item => {
            return (
              <tr key={item.id}>
                {/* Imagem */}
                <td>
                  {item.imagemUrl ? (
                    <img 
                      src={item.imagemUrl}
                      alt={item.nome}
                      onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                      style={{ 
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '6px'
                      }}
                    />
                  ) : '—'}
                </td>

                {/* Nome + descrição */}
                <td>
                  <div style={{ fontWeight: '600', color: '#1a73e8' }}>
                    {item.nome || 'Sem nome'}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#5f6368', 
                    marginTop: '4px' 
                  }}>
                    {item.descricao || "Sem descrição adicional"}
                  </div>
                </td>

                {/* Categoria */}
                <td>
                  <span style={{
                    backgroundColor: '#e8f0fe',
                    color: '#1a73e8',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {item.categoria?.nome || '—'}
                  </span>
                </td>

                {/* Local */}
                <td>
                  {item.local || '—'}
                </td>

                {/* Valor */}
                <td style={{ fontWeight: '500' }}>
                  R$ {formatarValor(item.valor)}
                </td>

                {/* Ações */}
                {podeEditar && (
                  <td style={{ textAlign: 'center', position: 'relative' }}>
                    
                    {/* BOTÃO EDITAR (Adicionado para funcionar com o Form) */}
                    <button 
                      onClick={() => aoEditar(item)}
                      style={{ 
                        padding: '5px 10px', 
                        fontSize: '12px', 
                        marginRight: '5px',
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffeeba',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#856404'
                      }}
                    >
                      ✏️ Editar
                    </button>

                    {/* BOTÃO QR CODE */}
                    <button 
                      onClick={() => setQrVisivel(qrVisivel === item.id ? null : item.id)}
                      style={{ 
                        padding: '5px 10px', 
                        fontSize: '12px', 
                        marginRight: '5px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      🖼️ QR
                    </button>

                    {/* Janela flutuante do QR Code */}
                    {qrVisivel === item.id && (
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '40px', 
                        right: '50%', 
                        transform: 'translateX(50%)',
                        zIndex: 100, 
                        background: 'white', 
                        padding: '10px', 
                        border: '1px solid #dadce0', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                      }}>
                        <QRCodeSVG 
                          value={`PATRIMONIO_ID: ${item.id}\nNOME: ${item.nome}\nLOCAL: ${item.local}`} 
                          size={110} 
                        />
                        <div style={{ fontSize: '9px', marginTop: '5px', color: '#666' }}>ID: {item.id}</div>
                      </div>
                    )}

                    <button 
                      className="btn btn-danger" 
                      onClick={() => aoRemover(item.id)}
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      Dar Baixa
                    </button>
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