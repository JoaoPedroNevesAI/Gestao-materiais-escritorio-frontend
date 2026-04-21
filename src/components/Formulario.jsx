import React, { useEffect, useState } from 'react';
import { listarCategorias } from '../services/api';

export default function Formulario({ aoAdicionar }) {

  const [preview, setPreview] = useState('');
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    listarCategorias().then(setCategorias);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const fd = new FormData(e.target);
    const dadosForm = Object.fromEntries(fd);

    const material = {
      nome: dadosForm.nome,
      descricao: dadosForm.descricao,
      quantidade: parseInt(dadosForm.quantidade),
      categoriaId: dadosForm.categoriaId ? parseInt(dadosForm.categoriaId) : null,
      local: dadosForm.local || null,
      valor: dadosForm.valor ? parseFloat(dadosForm.valor) : null,
      imagemUrl: dadosForm.imagemUrl || null
    };

    aoAdicionar(material);

    e.target.reset();
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
        
        <input 
          name="nome" 
          placeholder="Nome do Bem"
          required 
          style={{ gridColumn: 'span 2' }} 
        />

        <input 
          name="quantidade" 
          type="number" 
          placeholder="Quantidade" 
          required 
        />

        <input 
          name="valor" 
          type="number" 
          step="0.01"
          placeholder="Valor (R$)" 
        />

        <select name="categoriaId">
          <option value="">Selecione uma categoria</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.nome}
            </option>
          ))}
        </select>

        <select name="local">
          <option value="">Local (Opcional)</option>
          <option value="Recepção">Recepção</option>
          <option value="Escritório">Escritório</option>
          <option value="TI">Departamento de TI</option>
        </select>

        <textarea 
          name="descricao" 
          placeholder="Descrição"
          style={{ gridColumn: 'span 2', padding: '10px' }} 
        />

        <input 
          name="imagemUrl"
          placeholder="URL da imagem"
          style={{ gridColumn: 'span 2' }}
          onChange={(e) => setPreview(e.target.value)}
        />

        {preview && (
          <div style={{ gridColumn: 'span 2', textAlign: 'center' }}>
            <img 
              src={preview}
              alt="Preview"
              style={{ width: '120px', borderRadius: '8px' }}
            />
          </div>
        )}

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
