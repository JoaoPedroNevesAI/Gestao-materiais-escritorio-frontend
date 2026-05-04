import React, { useEffect, useState } from 'react';
import { listarCategorias } from '../services/api';

export default function Formulario({ aoAdicionar, bemParaEditar, cancelarEdicao, darkMode }) { 
  const [categorias, setCategorias] = useState([]);
  const [locais, setLocais] = useState([]);
  
  // Estado único para todos os campos do formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    quantidade: '',
    categoriaId: '',
    localId: '',
    valor: '',
    imagemUrl: '',
    dataAquisicao: '',
    dataLimiteManutencao: ''
  });

  // Carrega categorias e locais ao iniciar
  useEffect(() => {
    listarCategorias().then(setCategorias);
    
    setLocais([
      { id: 1, nome: 'Recepção' },
      { id: 2, nome: 'Escritório' },
      { id: 3, nome: 'Departamento de TI' }
    ]);
  }, []);

  // Monitora se há um bem para editar e preenche o form
  useEffect(() => {
    if (bemParaEditar) {
      setFormData({
        nome: bemParaEditar.nome || '',
        descricao: bemParaEditar.descricao || '',
        quantidade: bemParaEditar.quantidade || '',
        categoriaId: bemParaEditar.categoriaId || '',
        localId: bemParaEditar.localId || '',
        valor: bemParaEditar.valor || '',
        imagemUrl: bemParaEditar.imagemUrl || '',
        // Formata data para o padrão do input (YYYY-MM-DD)
        dataAquisicao: bemParaEditar.dataAquisicao ? bemParaEditar.dataAquisicao.split('T')[0] : '',
        dataLimiteManutencao: bemParaEditar.dataLimiteManutencao ? bemParaEditar.dataLimiteManutencao.split('T')[0] : ''
      });
    } else {
      limparCampos();
    }
  }, [bemParaEditar]);

  const limparCampos = () => {
    setFormData({
      nome: '', descricao: '', quantidade: '', categoriaId: '',
      localId: '', valor: '', imagemUrl: '', dataAquisicao: '', dataLimiteManutencao: ''
    });
  };

  // Atualiza o estado conforme o usuário digita
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Converte os valores necessários antes de enviar
    const materialFormatado = {
      ...formData,
      quantidade: parseInt(formData.quantidade),
      categoriaId: formData.categoriaId ? parseInt(formData.categoriaId) : null,
      localId: formData.localId ? parseInt(formData.localId) : null,
      valor: formData.valor ? parseFloat(formData.valor) : null,
      // Se estiver editando, envia o ID original junto
      id: bemParaEditar?.id 
    };

    aoAdicionar(materialFormatado);
    if (!bemParaEditar) limparCampos();
  };

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

  return (
    <section style={styles.card}>
      <h3 style={{ marginTop: 0, color: '#1a73e8' }}>
        {bemParaEditar ? '✏️ Editar Bem Patrimonial' : '🏛️ Cadastrar Novo Bem Patrimonial'}
      </h3>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <input 
          name="nome" 
          value={formData.nome}
          onChange={handleChange}
          placeholder="Nome do Bem (Ex: Cadeira Gamer)"
          required 
          style={{ ...styles.input, gridColumn: 'span 2' }} 
        />

        <input 
          name="quantidade" 
          type="number" 
          value={formData.quantidade}
          onChange={handleChange}
          placeholder="Quantidade" 
          required 
          style={styles.input}
        />

        <input 
          name="valor" 
          type="number" 
          step="0.01"
          value={formData.valor}
          onChange={handleChange}
          placeholder="Valor (R$)" 
          style={styles.input}
        />

        <select name="categoriaId" value={formData.categoriaId} onChange={handleChange} style={styles.input}>
          <option value="">Selecione uma categoria</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nome}</option>
          ))}
        </select>

        <select name="localId" value={formData.localId} onChange={handleChange} style={styles.input}>
          <option value="">Selecione um local</option>
          {locais.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.nome}</option>
          ))}
        </select>

        <div style={{ display: 'grid', gap: '5px' }}>
          <label style={styles.label}>Data de Aquisição</label>
          <input name="dataAquisicao" type="date" value={formData.dataAquisicao} onChange={handleChange} required style={styles.input} />
        </div>

        <div style={{ display: 'grid', gap: '5px' }}>
          <label style={styles.label}>Limite para Manutenção</label>
          <input name="dataLimiteManutencao" type="date" value={formData.dataLimiteManutencao} onChange={handleChange} required style={styles.input} />
        </div>

        <textarea 
          name="descricao" 
          value={formData.descricao}
          onChange={handleChange}
          placeholder="Descrição / Estado do bem"
          style={{ ...styles.input, gridColumn: 'span 2', height: '80px', resize: 'vertical' }} 
        />

        <input 
          name="imagemUrl"
          value={formData.imagemUrl}
          onChange={handleChange}
          placeholder="URL da imagem"
          style={{ ...styles.input, gridColumn: 'span 2' }}
        />

        {formData.imagemUrl && (
          <div style={{ gridColumn: 'span 2', textAlign: 'center' }}>
            <img 
              src={formData.imagemUrl} 
              alt="Preview" 
              onError={(e) => e.target.style.display = 'none'}
              onLoad={(e) => e.target.style.display = 'inline-block'}
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
          {bemParaEditar ? 'Salvar Alterações' : 'Registrar Patrimônio'}
        </button>

        {bemParaEditar && (
          <button 
            type="button" 
            onClick={cancelarEdicao}
            style={{ 
              gridColumn: 'span 2', 
              padding: '8px', 
              backgroundColor: 'transparent',
              border: '1px solid #ff4d4f',
              borderRadius: '8px',
              color: '#ff4d4f',
              cursor: 'pointer'
            }}
          >
            Cancelar Edição
          </button>
        )}
      </form>
    </section>
  );
}