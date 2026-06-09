import React, { useEffect, useState } from 'react';
// Importamos o 'api' padrão para fazer os posts de criação rápida
import api, { listarCategorias, listarLocais } from '../services/api'; 

export default function Formulario({ aoAdicionar, bemParaEditar, cancelarEdicao, darkMode }) { 
  const [categorias, setCategorias] = useState([]);
  const [locais, setLocais] = useState([]); 
  
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

  // Função para recarregar as listas do zero
  const atualizarListas = () => {
    listarCategorias()
      .then(dados => setCategorias(dados))
      .catch(err => console.error("Erro ao buscar categorias no formulário:", err));

    listarLocais()
      .then(dados => setLocais(dados))
      .catch(err => console.error("Erro ao buscar locais no formulário:", err));
  };

  useEffect(() => {
    atualizarListas();
  }, []);

  useEffect(() => {
    if (bemParaEditar) {
      setFormData({
        nome: bemParaEditar.nome || '',
        descricao: bemParaEditar.descricao || '',
        quantidade: bemParaEditar.quantidade || '',
        categoriaId: bemParaEditar.categoria?.id || '',
        localId: bemParaEditar.local?.id || '', 
        valor: bemParaEditar.valor || '',
        imagemUrl: bemParaEditar.imagemUrl || '',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- FUNÇÕES DE CRIAÇÃO RÁPIDA ---
  const handleCriarCategoriaRapida = async () => {
    const nomeCat = prompt("Digite o nome da nova Categoria (Ex: Eletrônicos, Móveis):");
    if (!nomeCat || nomeCat.trim() === "") return;

    try {
      await api.post('/categoria', { nome: nomeCat });
      alert("Categoria criada com sucesso!");
      atualizarListas(); // Atualiza o select automaticamente
    } catch (err) {
      console.error(err);
      alert("Erro ao criar categoria. Veja se a rota está certa ou se o Spring barrou.");
    }
  };

  const handleCriarLocalRapido = async () => {
    const nomeLoc = prompt("Digite o nome do novo Local (Ex: Sala 103, Laboratório 2):");
    if (!nomeLoc || nomeLoc.trim() === "") return;

    try {
      await api.post('/local', { nome: nomeLoc });
      alert("Local criado com sucesso!");
      atualizarListas(); // Atualiza o select automaticamente
    } catch (err) {
      console.error(err);
      alert("Erro ao criar local. Verifique os logs do console.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // CORREÇÃO: Montando o objeto exatamente como a classe MaterialRequest exige no Spring
    const materialFormatado = {
      id: bemParaEditar?.id || null, 
      nome: formData.nome,
      descricao: formData.descricao,
      quantidade: parseInt(formData.quantidade) || 0,
      valor: formData.valor ? parseFloat(formData.valor) : 0.0, 
      imagemUrl: formData.imagemUrl || '',
      dataAquisicao: formData.dataAquisicao,
      dataLimiteManutencao: formData.dataLimiteManutencao,
      
      // Enviando os IDs numéricos soltos na raiz para passar pelo @NotNull
      categoriaId: formData.categoriaId ? parseInt(formData.categoriaId) : null,
      localId: formData.localId ? parseInt(formData.localId) : null,

      // Mantidos aqui em paralelo caso a entidade exija herança reversa no salvamento direto
      categoria: formData.categoriaId ? { id: parseInt(formData.categoriaId) } : null,
      local: formData.localId ? { id: parseInt(formData.localId) } : null
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
      fontSize: '14px',
      width: '100%',
      boxSizing: 'border-box'
    },
    label: {
      fontSize: '12px',
      color: darkMode ? '#aaa' : '#666',
      fontWeight: '500'
    },
    flexContainer: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      width: '100%'
    },
    btnMais: {
      padding: '10px 14px',
      backgroundColor: '#1a73e8',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '16px'
    }
  };

  return (
    <section style={styles.card}>
      <h3 style={{ marginTop: 0, color: '#1a73e8', marginBottom: '20px' }}>
        {bemParaEditar ? '✏️ Editar Bem Patrimonial' : '🏛️ Cadastrar Novo Bem Patrimonial'}
      </h3>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        
        {/* Nome */}
        <div style={{ gridColumn: 'span 2' }}>
          <input 
            name="nome" 
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome do Bem (Ex: Cadeira Gamer)"
            required 
            style={styles.input} 
          />
        </div>

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

        {/* Categoria com botão + */}
        <div style={styles.flexContainer}>
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
          <button type="button" onClick={handleCriarCategoriaRapida} title="Adicionar nova categoria" style={styles.btnMais}>+</button>
        </div>

        {/* Local com botão + */}
        <div style={styles.flexContainer}>
          <select 
            name="localId" 
            value={formData.localId} 
            onChange={handleChange} 
            required
            style={styles.input}
          >
            <option value="">Selecione um local</option>
            {locais.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.nome}</option>
            ))}
          </select>
          <button type="button" onClick={handleCriarLocalRapido} title="Adicionar novo local" style={styles.btnMais}>+</button>
        </div>

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
        <div style={{ gridColumn: 'span 2' }}>
          <textarea 
            name="descricao" 
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descrição / Estado de conservação do bem"
            style={{ ...styles.input, height: '80px', resize: 'vertical' }} 
          />
        </div>

        {/* URL da Imagem */}
        <div style={{ gridColumn: 'span 2' }}>
          <input 
            name="imagemUrl"
            value={formData.imagemUrl}
            onChange={handleChange}
            placeholder="URL da imagem (opcional)"
            style={styles.input}
          />
        </div>

        {/* Preview da Imagem */}
        {formData.imagemUrl && (
          <div style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '5px' }}>
            <img 
              src={formData.imagemUrl} 
              alt="Preview" 
              onError={(e) => e.target.style.display = 'none'}
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