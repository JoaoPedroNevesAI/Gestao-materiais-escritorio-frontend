import React, { useEffect, useState } from 'react';
import { listarCategorias } from '../services/api';

export default function Formulario({ aoAdicionar, bemParaEditar, cancelarEdicao, darkMode }) { 
  const [categorias, setCategorias] = useState([]);
  
  // Lista de locais mapeada de acordo com as constantes ou enums aceitos no seu Backend Java
  const [locais] = useState([
    { valorJava: 'RECP', nomeExibicao: 'Recepção' },
    { valorJava: 'ESCR', nomeExibicao: 'Escritório' },
    { valorJava: 'TI', nomeExibicao: 'Departamento de TI' }
  ]);
  
  // Estado único para todos os campos do formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    quantidade: '',
    categoriaId: '',
    local: '', // Ajustado para corresponder a propriedade String/Enum do backend
    valor: '',
    imagemUrl: '',
    dataAquisicao: '',
    dataLimiteManutencao: ''
  });

  // Carrega categorias ao iniciar
  useEffect(() => {
    listarCategorias()
      .then(dados => setCategorias(dados))
      .catch(err => console.error("Erro ao buscar categorias no formulário:", err));
  }, []);

  // Monitora se há um bem selecionado para editar e preenche o form
  useEffect(() => {
    if (bemParaEditar) {
      setFormData({
        nome: bemParaEditar.nome || '',
        descricao: bemParaEditar.descricao || '',
        quantidade: bemParaEditar.quantidade || '',
        // Extrai o ID do sub-objeto 'categoria' que vem do Java
        categoriaId: bemParaEditar.categoria?.id || '',
        local: bemParaEditar.local || '',
        valor: bemParaEditar.valor || '',
        imagemUrl: bemParaEditar.imagemUrl || '',
        // Formata data de forma segura para o padrão do input HTML (YYYY-MM-DD)
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
      local: '', valor: '', imagemUrl: '', dataAquisicao: '', dataLimiteManutencao: ''
    });
  };

  // Atualiza o estado dinamicamente conforme o usuário digita
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Remonta o objeto no formato exato que as entidades JPA e Controllers do Spring esperam
    const materialFormatado = {
      id: bemParaEditar?.id || null, // Garante o ID original se for uma edição
      nome: formData.nome,
      descricao: formData.descricao,
      quantidade: parseInt(formData.quantidade) || 0,
      valor: formData.valor ? parseFloat(formData.valor) : null,
      local: formData.local || null,
      imagemUrl: formData.imagemUrl || '',
      dataAquisicao: formData.dataAquisicao,
      dataLimiteManutencao: formData.dataLimiteManutencao,
      // O segredo do relacionamento ManyToOne do Spring Boot: passar o sub-objeto com ID
      categoria: formData.categoriaId ? { id: parseInt(formData.categoriaId) } : null
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
      outline: 'none',
      fontSize: '14px'
    },
    label: {
      fontSize: '12px',
      color: darkMode ? '#aaa' : '#666',
      fontWeight: '500'
    }
  };

  return (
    <section style={styles.card}>
      <h3 style={{ marginTop: 0, color: '#1a73e8', marginBottom: '20px' }}>
        {bemParaEditar ? '✏️ Editar Bem Patrimonial' : '🏛️ Cadastrar Novo Bem Patrimonial'}
      </h3>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        
        {/* Nome */}
        <input 
          name="nome" 
          value={formData.nome}
          onChange={handleChange}
          placeholder="Nome do Bem (Ex: Cadeira Gamer)"
          required 
          style={{ ...styles.input, gridColumn: 'span 2' }} 
        />

        {/* Quantidade */}
        <input 
          name="quantidade" 
          type="number" 
          value={formData.quantidade}
          onChange={handleChange}
          placeholder="Quantidade" 
          required 
          style={styles.input}
        />

        {/* Valor */}
        <input 
          name="valor" 
          type="number" 
          step="0.01"
          value={formData.valor}
          onChange={handleChange}
          placeholder="Valor (R$)" 
          style={styles.input}
        />

        {/* Categoria */}
        <select 
          name="categoriaId" 
          value={formData.categoriaId} 
          onChange={handleChange} 
          required
          style={styles.input}
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nome}</option>
          ))}
        </select>

        {/* Local */}
        <select 
          name="local" 
          value={formData.local} 
          onChange={handleChange} 
          required
          style={styles.input}
        >
          <option value="">Selecione um local</option>
          {locais.map(loc => (
            <option key={loc.valorJava} value={loc.valorJava}>{loc.nomeExibicao}</option>
          ))}
        </select>

        {/* Data de Aquisição */}
        <div style={{ display: 'grid', gap: '5px' }}>
          <label style={styles.label}>Data de Aquisição</label>
          <input 
            name="dataAquisicao" 
            type="date" 
            value={formData.dataAquisicao} 
            onChange={handleChange} 
            required 
            style={styles.input} 
          />
        </div>

        {/* Limite para Manutenção */}
        <div style={{ display: 'grid', gap: '5px' }}>
          <label style={styles.label}>Limite para Manutenção</label>
          <input 
            name="dataLimiteManutencao" 
            type="date" 
            value={formData.dataLimiteManutencao} 
            onChange={handleChange} 
            required 
            style={styles.input} 
          />
        </div>

        {/* Descrição */}
        <textarea 
          name="descricao" 
          value={formData.descricao}
          onChange={handleChange}
          placeholder="Descrição / Estado de conservação do bem"
          style={{ ...styles.input, gridColumn: 'span 2', height: '80px', resize: 'vertical' }} 
        />

        {/* URL da Imagem */}
        <input 
          name="imagemUrl"
          value={formData.imagemUrl}
          onChange={handleChange}
          placeholder="URL da imagem (opcional)"
          style={{ ...styles.input, gridColumn: 'span 2' }}
        />

        {/* Preview da Imagem */}
        {formData.imagemUrl && (
          <div style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '5px' }}>
            <img 
              src={formData.imagemUrl} 
              alt="Preview" 
              onError={(e) => e.target.style.display = 'none'}
              onLoad={(e) => e.target.style.display = 'inline-block'}
              style={{ width: '120px', maxHeight: '120px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${darkMode ? '#444' : '#eee'}` }} 
            />
          </div>
        )}

        {/* Botão de Envio Principal */}
        <button 
          type="submit" 
          style={{ 
            gridColumn: 'span 2', 
            padding: '12px', 
            fontWeight: 'bold', 
            fontSize: '16px',
            backgroundColor: '#1a73e8',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            marginTop: '5px'
          }}
        >
          {bemParaEditar ? 'Salvar Alterações' : 'Registrar Patrimônio'}
        </button>

        {/* Botão Cancelar Edição */}
        {bemParaEditar && (
          <button 
            type="button" 
            onClick={cancelarEdicao}
            style={{ 
              gridColumn: 'span 2', 
              padding: '10px', 
              backgroundColor: 'transparent',
              border: '1px solid #ff4d4f',
              borderRadius: '8px',
              color: '#ff4d4f',
              fontWeight: '500',
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