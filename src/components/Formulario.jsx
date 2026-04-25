// Importa hooks do React
import React, { useEffect, useState } from 'react';

// Função que busca categorias da API
import { listarCategorias } from '../services/api';

// Componente recebe uma função "aoAdicionar"
// (provavelmente adiciona o material na lista ou manda pro backend)
export default function Formulario({ aoAdicionar }) {

  // Estado para preview da imagem (URL digitada)
  const [preview, setPreview] = useState('');

  // Estado para armazenar categorias vindas da API
  const [categorias, setCategorias] = useState([]);

  // Executa quando o componente é montado
  useEffect(() => {
    // Busca categorias e salva no estado
    listarCategorias().then(setCategorias);
  }, []); // [] = roda só uma vez

  // Função ao enviar o formulário
  const handleSubmit = (e) => {
    e.preventDefault(); // Evita reload da página

    // Captura dados do formulário
    const fd = new FormData(e.target);

    // Converte para objeto JS
    const dadosForm = Object.fromEntries(fd);

    // Monta objeto do material
    const material = {
      nome: dadosForm.nome,
      descricao: dadosForm.descricao,

      // Converte string → número inteiro
      quantidade: parseInt(dadosForm.quantidade),

      // Se tiver categoria, converte para número, senão null
      categoriaId: dadosForm.categoriaId 
        ? parseInt(dadosForm.categoriaId) 
        : null,

      // Se vazio → null
      local: dadosForm.local || null,

      // Converte para decimal
      valor: dadosForm.valor 
        ? parseFloat(dadosForm.valor) 
        : null,

      // URL da imagem opcional
      imagemUrl: dadosForm.imagemUrl || null
    };

    // Envia o material para o componente pai
    aoAdicionar(material);

    // Limpa formulário
    e.target.reset();

    // Limpa preview da imagem
    setPreview('');
  };

  return (
    <section className="card">
      <h3>Cadastrar Novo Bem Patrimonial</h3>

      <form 
        onSubmit={handleSubmit} 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '15px' 
        }}
      >
        
        {/* Nome ocupa 2 colunas */}
        <input 
          name="nome" 
          placeholder="Nome do Bem"
          required 
          style={{ gridColumn: 'span 2' }} 
        />

        {/* Quantidade */}
        <input 
          name="quantidade" 
          type="number" 
          placeholder="Quantidade" 
          required 
        />

        {/* Valor */}
        <input 
          name="valor" 
          type="number" 
          step="0.01"
          placeholder="Valor (R$)" 
        />

        {/* Select dinâmico de categorias */}
        <select name="categoriaId">
          <option value="">Selecione uma categoria</option>

          {/* Renderiza categorias vindas da API */}
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.nome}
            </option>
          ))}
        </select>

        {/* Local fixo */}
        <select name="local">
          <option value="">Local (Opcional)</option>
          <option value="Recepção">Recepção</option>
          <option value="Escritório">Escritório</option>
          <option value="TI">Departamento de TI</option>
        </select>

        {/* Descrição ocupa 2 colunas */}
        <textarea 
          name="descricao" 
          placeholder="Descrição"
          style={{ gridColumn: 'span 2', padding: '10px' }} 
        />

        {/* Campo de URL da imagem */}
        <input 
          name="imagemUrl"
          placeholder="URL da imagem"
          style={{ gridColumn: 'span 2' }}

          // Atualiza preview em tempo real
          onChange={(e) => setPreview(e.target.value)}
        />

        {/* Se existir preview, mostra imagem */}
        {preview && (
          <div style={{ gridColumn: 'span 2', textAlign: 'center' }}>
            <img 
              src={preview}
              alt="Preview"
              style={{ width: '120px', borderRadius: '8px' }}
            />
          </div>
        )}

        {/* Botão */}
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ gridColumn: 'span 2' }}
        >
          Registrar Patrimônio
        </button>
      </form>
    </section>
  );
}