import React, { useState, useEffect } from 'react';

export default function ImagemAutenticada({ url, alt, darkMode, style }) {
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!url) {
      setErro(true);
    } else {
      setErro(false);
    }
  }, [url]);

  // Aplica o novo design system de 8px arredondado por padrão
  const estiloFinal = {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '8px', 
    display: 'block',
    ...style
  };

  // Fallback Premium: Em vez de um SVG cru com texto, geramos um container estilizado com um ícone de caixa/patrimônio
  if (erro || !url) {
    return (
      <div 
        style={{
          ...estiloFinal,
          backgroundColor: darkMode ? '#2d2d2d' : '#f1f3f4',
          border: `1px solid ${darkMode ? '#444' : '#dadce0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          color: darkMode ? '#888' : '#aaa',
          boxSizing: 'border-box'
        }}
        title={alt || "Item sem imagem"}
      >
        📦
      </div>
    );
  }

  return (
    <img 
      src={url} 
      alt={alt} 
      style={{
        ...estiloFinal,
        border: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`
      }} 
      onError={() => setErro(true)} 
    />
  );
}