import React, { useEffect, useState } from 'react';
import { listarCategorias } from '../services/api';
import { toast } from 'react-toastify';

export default function Formulario({ aoAdicionar }) {

  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const data = await listarCategorias();
      setCategorias(data);
    } catch {
      toast.error("Erro ao carregar categorias");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fd = new FormData(e.target);
    const dadosForm = Object.fromEntries(fd);

    const material = {
      nome: dadosForm.nome,
      descricao: dadosForm.descricao,
      quantidade: parseInt(dadosForm.quantidade),
      categoriaId: parseInt(dadosForm.categoriaId),
      local: dadosForm.local || null,
      valor: dadosForm.valor ? parseFloat(dadosForm.valor) : null
    };

    aoAdicionar(material);
    e.target.reset();
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

        <select name="categoriaId" required>
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
          <option value="TI">TI</option>
        </select>

        <textarea 
          name="descricao" 
          placeholder="Descrição" 
          style={{ gridColumn: 'span 2' }} 
        />

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