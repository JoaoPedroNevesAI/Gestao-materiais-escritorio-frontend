import React, { useState, useEffect } from 'react';

export default function ImagemAutenticada({ url, alt, darkMode, style }) {
  const [erro, setErro] = useState(false);

  // Tratamento da URL para preview local (blob/base64) e uploads vindos do Spring Boot
  const formatarUrl = (caminho) => {
    if (!caminho) return null;

    // Se já for preview local temporário (blob), base64 ou URL absoluta, mantém intacto
    if (
      caminho.startsWith('blob:') ||
      caminho.startsWith('data:') ||
      caminho.startsWith('http://') ||
      caminho.startsWith('https://')
    ) {
      return caminho;
    }

    // Se for apenas o nome da foto ou caminho relativo salvo no banco (ex: /uploads/imagem.jpg)
    const baseUrl = 'http://localhost:8080';
    return `${baseUrl}${caminho.startsWith('/') ? '' : '/'}${caminho}`;
  };

  const urlFinal = formatarUrl(url);

  // Reseta o estado de erro sempre que a prop 'url' for alterada
  useEffect(() => {
    setErro(false);
  }, [url]);

  const estiloFinal = {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '8px',
    display: 'block',
    boxSizing: 'border-box',
    ...style
  };

  // Fallback visual caso ocorra erro no carregamento ou a URL seja inválida
  if (erro || !urlFinal) {
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
          color: darkMode ? '#888' : '#aaa'
        }}
        title={alt || 'Sem imagem cadastrada'}
      >
        📦
      </div>
    );
  }

  return (
    <img
      key={urlFinal} // A chave força a montagem da nova tag img ao editar, limpando o cache interno do React
      src={urlFinal}
      alt={alt || 'Patrimônio'}
      style={{
        ...estiloFinal,
        border: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`
      }}
      onError={() => setErro(true)}
    />
  );
}