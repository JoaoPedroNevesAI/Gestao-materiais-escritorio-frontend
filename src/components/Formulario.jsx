import React, { useEffect, useState } from 'react';
import { listarCategorias } from '../services/api';

export default function Formulario({ aoAdicionar, darkMode }) { // Recebendo a prop darkMode
  const [preview, setPreview] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [locais, setLocais] = useState([]);

  useEffect(() => {
    listarCategorias().then(setCategorias);
    
    setLocais([
      { id: 1, nome: 'Recepção' },
      { id: 2, nome: 'Escritório' },
      { id: 3, nome: 'Departamento de TI' }
    ]);
  }, []);

  // Estilos dinâmicos para o Dark Mode
  const styles = {
    card: {
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
      color: darkMode ? '#e0e0e0' : '#333',
      padding: '20px',
      borderRadius: '12px',
      border: `1px solid ${darkMode ? '#333' : '#ddd'}`,
      marginBottom: '25px',
      transition: 'all 0.2s'
    },
    input: {
      backgroundColor: darkMode ? '#2d2d2d' : '#fff',
      color: darkMode ? '#fff' : '#333',
      border: `1px solid ${darkMode ? '#444' : '#ccc'}`,
      padding: '10px',
      borderRadius: '6px',
      outline: 'none'
    },
    label: {
      fontSize: '12px',
      color: darkMode ? '#aaa' : '#666'
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
      categoriaId: dadosForm.categoriaId ? parseInt(dadosForm.categoriaId) : null,
      localId: dadosForm.localId ? parseInt(dadosForm.localId) : null, 
      valor: dadosForm.valor ? parseFloat(dadosForm.valor) : null,
      imagemUrl: dadosForm.imagemUrl || null,
      dataAquisicao: dadosForm.dataAquisicao,
      dataLimiteManutencao: dadosForm.dataLimiteManutencao
    };

    aoAdicionar(material);
    e.target.reset();
    setPreview('');
  };

  return (
    <section style={styles.card}>
      <h3 style={{ marginTop: 0, color: darkMode ? '#1a73e8' : '#1a73e8' }}>
        🏛️ Cadastrar Novo Bem Patrimonial
      </h3>

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
          placeholder="Nome do Bem (Ex: Cadeira Gamer)"
          required 
          style={{ ...styles.input, gridColumn: 'span 2' }} 
        />

        <input 
          name="quantidade" 
          type="number" 
          placeholder="Quantidade" 
          required 
          style={styles.input}
        />

        <input 
          name="valor" 
          type="number" 
          step="0.01"
          placeholder="Valor (R$)" 
          style={styles.input}
        />

        <select name="categoriaId" style={styles.input}>
          <option value="">Selecione uma categoria</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nome}</option>
          ))}
        </select>

        <select name="localId" style={styles.input}>
          <option value="">Selecione um local</option>
          {locais.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.nome}</option>
          ))}
        </select>

        <div style={{ display: 'grid', gap: '5px' }}>
          <label style={styles.label}>Data de Aquisição</label>
          <input name="dataAquisicao" type="date" required style={styles.input} />
        </div>

        <div style={{ display: 'grid', gap: '5px' }}>
          <label style={styles.label}>Limite para Manutenção</label>
          <input name="dataLimiteManutencao" type="date" required style={styles.input} />
        </div>

        <textarea 
          name="descricao" 
          placeholder="Descrição / Estado do bem"
          style={{ ...styles.input, gridColumn: 'span 2', height: '80px', resize: 'vertical' }} 
        />

        <input 
          name="imagemUrl"
          placeholder="URL da imagem"
          style={{ ...styles.input, gridColumn: 'span 2' }}
          onChange={(e) => setPreview(e.target.value)}
        />

        {preview && (
          <div style={{ gridColumn: 'span 2', textAlign: 'center' }}>
            <img 
              src={preview} 
              alt="Preview" 
              style={{ width: '120px', borderRadius: '8px', border: `1px solid ${darkMode ? '#444' : '#eee'}` }} 
            />
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ 
            gridColumn: 'span 2', 
            padding: '12px', 
            fontWeight: 'bold', 
            fontSize: '16px',
            backgroundColor: '#1a73e8',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Registrar Patrimônio
        </button>
      </form>
    </section>
  );
}