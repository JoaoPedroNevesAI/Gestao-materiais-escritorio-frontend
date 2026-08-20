import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

export default function QrCodeBotao({ item }) {
  const [aberto, setAberto] = useState(false);

  // Pente fino no payload: extrai o nome do local se for um objeto, e padroniza para o sistema de patrimônio
  const nomeLocal = item.local?.nome || item.local || 'Não informado';
  const valorQR = `SISTEMA PATRIMÔNIO WEB\nID: ${item.id}\nItem: ${item.nome}\nLocal: ${nomeLocal}`;

  return (
    <>
      {/* Botão de Gatilho com Design Modernizado */}
      <button 
        onClick={() => setAberto(true)}
        style={{ 
          padding: '6px 12px', 
          fontSize: '12px', 
          fontWeight: '600',
          background: '#2d2d2d', 
          color: '#e0e0e0',
          border: '1px solid #444', 
          borderRadius: '6px', 
          cursor: 'pointer',
          width: '95px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'all 0.2s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
        onMouseEnter={(e) => e.target.style.background = '#3d3d3d'}
        onMouseLeave={(e) => e.target.style.background = '#2d2d2d'}
      >
        🖼️ QR
      </button>

      {/* MODAL OVERLAY */}
      {aberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* CARD DO MODAL */}
          <div style={{
            position: 'relative',
            background: '#1e1e1e',
            padding: '35px 25px 25px 25px', // Um pouco mais de respiro no topo para o X
            borderRadius: '16px',
            border: '1px solid #333',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
            minWidth: '240px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* BOTÃO "X" PARA FECHAR (Pedido pelo João) */}
            <button
              onClick={() => setAberto(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '14px',
                background: 'transparent',
                border: 'none',
                color: '#888',
                fontSize: '18px',
                cursor: 'pointer',
                fontWeight: 'bold',
                padding: '4px',
                transition: 'color 0.2s',
                lineHeight: '1'
              }}
              onMouseEnter={(e) => e.target.style.color = '#e57373'}
              onMouseLeave={(e) => e.target.style.color = '#888'}
            >
              ✕
            </button>

            {/* CONTAINER BRANCO PARA O QR CODE DESTACAR */}
            <div style={{
              background: '#fff',
              padding: '12px',
              borderRadius: '12px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              display: 'inline-block'
            }}>
              <QRCodeSVG value={valorQR} size={150} fgColor="#111111" />
            </div>

            {/* DETALHES DO ITEM */}
            <h4 style={{ 
              fontSize: '15px', 
              margin: '16px 0 4px 0', 
              fontWeight: '600', 
              color: '#fff',
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {item.nome}
            </h4>
            
            <span style={{ 
              fontSize: '12px', 
              color: '#aaa',
              background: '#2d2d2d',
              padding: '3px 10px',
              borderRadius: '4px',
              fontWeight: '500',
              marginTop: '4px'
            }}>
              ID: {item.id}
            </span>

            {/* BOTÃO SECUNDÁRIO DE FECHAR EMBAIXO */}
            <button
              onClick={() => setAberto(false)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '10px 0',
                background: '#333', // Mudado de vermelho para cinza escuro para deixar o visual mais sóbrio e Premium
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#444'}
              onMouseLeave={(e) => e.target.style.background = '#333'}
            >
              Fechar Janela
            </button>
          </div>
        </div>
      )}
    </>
  );
}