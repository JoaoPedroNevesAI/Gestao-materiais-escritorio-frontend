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

  const estiloPadrao = style || {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '6px',
    display: 'block'
  };

  if (erro || !url) {
    return (
      <img 
        src={"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'><rect width='50' height='50' fill='%23" + (darkMode ? "222222" : "f0f0f0") + "'/><text x='50%25' y='55%25' font-family='Arial' font-size='10' fill='%23888888' dominant-baseline='middle' text-anchor='middle'>Sem Foto</text></svg>"}
        alt={alt}
        style={estiloPadrao}
      />
    );
  }

  return (
    <img 
      src={url} 
      alt={alt} 
      style={estiloPadrao} 
      onError={() => setErro(true)} 
    />
  );
}