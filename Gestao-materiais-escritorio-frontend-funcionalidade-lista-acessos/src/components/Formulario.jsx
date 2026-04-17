import React from 'react';

export default function Formulario({ aoAdicionar }) {

  const handleSubmit = (e) => {
    e.preventDefault();

    const fd = new FormData(e.target);
    const dadosForm = Object.fromEntries(fd);

    const material = {
      nome: dadosForm.nome,
      descricao: dadosForm.descricao,
      quantidade: parseInt(dadosForm.quantidade),
      categoria: dadosForm.categoria || null,
      local: dadosForm.local || null,
      valor: dadosForm.valor ? parseFloat(dadosForm.valor) : null
    };

    if (aoAdicionar) {
      aoAdicionar(material);
    }

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
          placeholder="Nome do Bem (Ex: Notebook Dell)" 
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

        <select name="categoria">
          <option value="">Categoria (Opcional)</option>
          <option value="Informática">Informática</option>
          <option value="Mobiliário">Mobiliário</option>
          <option value="Eletrodomésticos">Eletrodomésticos</option>
        </select>

        <select name="local">
          <option value="">Local (Opcional)</option>
          <option value="Recepção">Recepção</option>
          <option value="Escritório">Escritório</option>
          <option value="TI">Departamento de TI</option>
        </select>

        <textarea 
          name="descricao" 
          placeholder="Descrição / Especificações Técnicas" 
          style={{ 
            gridColumn: 'span 2', 
            padding: '10px' 
          }} 
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