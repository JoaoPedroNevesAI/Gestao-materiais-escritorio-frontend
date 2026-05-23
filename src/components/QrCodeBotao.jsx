import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

export default function QrCodeBotao({ item }) {
  const [aberto, setAberto] = useState(false);

  // Corrigido para item.local (conforme mapeado no seu backend)
  const valorQR = `ID: ${item.id} | Nome: ${item.nome} | Local: ${item.local || 'Não informado'}`;

  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <button 
        onClick={() => setAberto(!aberto)}
        style={{ 
          padding: '5px 10px', 
          fontSize: '12px', 
          background: '#eee', 
          border: '1px solid #ccc', 
          borderRadius: '4px', 
          cursor: 'pointer',
          width: '95px'
        }}
      >
        {aberto ? '👁️ Fechar' : '🖼️ QR'}
      </button>

      {aberto && (
        <div style={{ 
          position: 'absolute', 
          bottom: '35px', 
          right: '50%',
          transform: 'translateX(50%)',
          zIndex: 100, 
          background: 'white', 
          padding: '10px', 
          border: '1px solid #dadce0', 
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          textAlign: 'center'
        }}>
          <QRCodeSVG value={valorQR} size={120} />
          <p style={{ fontSize: '11px', margin: '8px 0 0', fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap' }}>
            {item.nome}
          </p>
          <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>ID: {item.id}</div>
        </div>
      )}
    </div>
  );
}