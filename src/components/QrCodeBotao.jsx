import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

export default function QrCodeBotao({ item }) {
  const [aberto, setAberto] = useState(false);

  // O texto que o QR Code vai conter (ex: ID e Nome do item)
  const valorQR = `ID: ${item.id} | Nome: ${item.nome} | Local: ${item.localId}`;

  return (
    <div style={{ display: 'inline-block' }}>
      <button 
        onClick={() => setAberto(!aberto)}
        style={{ background: '#eee', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
      >
        🖼️ QR
      </button>

      {aberto && (
        <div style={{ position: 'absolute', zIndex: 10, background: 'white', padding: '10px', border: '1px solid #000', borderRadius: '8px' }}>
          <QRCodeSVG value={valorQR} size={128} />
          <p style={{ fontSize: '10px', margin: '5px 0 0' }}>{item.nome}</p>
          <button onClick={() => setAberto(false)} style={{ fontSize: '10px', width: '100%' }}>Fechar</button>
        </div>
      )}
    </div>
  );
}