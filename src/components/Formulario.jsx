import React, { useEffect, useState } from 'react';
import api, { listarCategorias, listarLocais } from '../services/api'; 

export default function Formulario({ aoAdicionar, bemParaEditar, cancelarEdicao, darkMode }) { 
  const [categorias, setCategorias] = useState([]);
  const [locais, setLocais] = useState([]); 
  
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    quantidade: '',
    categoriaId: '',
    localId: '', 
    valor: '',
    dataAquisicao: '',
    dataLimiteManutencao: '' 
  });

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
      const formatarDataSegura = (dataRaw) => {
        if (!dataRaw) return '';
        
        if (typeof dataRaw === 'string' && dataRaw.includes('T')) {
          return dataRaw.split('T')[0];
        }
        
        if (typeof dataRaw === 'string' && dataRaw.includes('/')) {
          const partes = dataRaw.split('/');
          if (partes.length === 3) {
            if (partes[2].length === 4) {
              return `${partes[2]}-${partes[1]}-${partes[0]}`; 
            }
          }
        }
        
        return String(dataRaw).substring(0, 10);
      };

      // Mapeia variações de propriedades vindas do banco
      const dataAquisicaoBanco = bemParaEditar.dataAquisicao || bemParaEditar.data_aquisicao || '';
      const dataManutencaoBanco = 
        bemParaEditar.dataLimiteManutencao || 
        bemParaEditar.prazoManutencao || 
        bemParaEditar.prazoLimiteManutencao || 
        bemParaEditar.data_limite_manutencao ||
        '';

      setFormData({
        nome: bemParaEditar.nome || '',
        descricao: bemParaEditar.descricao || '',
        quantidade: bemParaEditar.quantidade || '',
        categoriaId: bemParaEditar.categoria?.id || bemParaEditar.categoriaId || '',
        localId: bemParaEditar.local?.id || bemParaEditar.localId || '', 
        valor: bemParaEditar.valor || '',
        dataAquisicao: formatarDataSegura(dataAquisicaoBanco),
        dataLimiteManutencao: formatarDataSegura(dataManutencaoBanco)
      });
      
      const nomeImagem = bemParaEditar.imagem || bemParaEditar.foto;
      setImagePreview(nomeImagem ? `http://localhost:8080/uploads/${nomeImagem}` : '');
      setImagemArquivo(null);
    } else {
      limparCampos();
    }
  }, [bemParaEditar]);

  const limparCampos = () => {
    setFormData({
      nome: '', descricao: '', quantidade: '', categoriaId: '',
      localId: '', valor: '', dataAquisicao: '', dataLimiteManutencao: ''
    });
    setImagemArquivo(null);
    setImagePreview('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagemArquivo(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleCriarCategoriaRapida = async () => {
    const nomeCat = prompt("Digite o nome da nova Categoria:");
    if (!nomeCat || nomeCat.trim() === "") return;
    try {
      await api.post('/categoria', { nome: nomeCat });
      alert("Categoria criada com sucesso!");
      atualizarListas();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar categoria.");
    }
  };

  const handleCriarLocalRapido = async () => {
    const nomeLoc = prompt("Digite o nome do novo Local:");
    if (!nomeLoc || nomeLoc.trim() === "") return;
    try {
      await api.post('/local', { nome: nomeLoc });
      alert("Local criado com sucesso!");
      atualizarListas();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar local.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Recupera o nome do arquivo atual para não perder a referência caso o usuário não envie uma nova foto
    const nomeImagemAtual = bemParaEditar?.imagem || bemParaEditar?.foto || null;

    const materialFormatado = {
      id: bemParaEditar?.id || null, 
      nome: formData.nome,
      descricao: formData.descricao,
      quantidade: parseInt(formData.quantidade) || 0,
      valor: formData.valor ? parseFloat(formData.valor) : 0.0, 
      dataAquisicao: formData.dataAquisicao,
      dataLimiteManutencao: formData.dataLimiteManutencao,
      prazoManutencao: formData.dataLimiteManutencao,
      
      // SOLUÇÃO DO BUG DA IMAGEM: Mantém a string da imagem antiga se nenhuma nova for selecionada
      imagem: imagemArquivo ? null : nomeImagemAtual,
      foto: imagemArquivo ? null : nomeImagemAtual,

      categoriaId: formData.categoriaId ? parseInt(formData.categoriaId) : null,
      localId: formData.localId ? parseInt(formData.localId) : null,
      categoria: formData.categoriaId ? { id: parseInt(formData.categoriaId) } : null,
      local: formData.localId ? { id: parseInt(formData.localId) } : null
    };

    aoAdicionar(materialFormatado, imagemArquivo);
    if (!bemParaEditar) limparCampos();
  };

  const styles = {
    card: {
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
      color: darkMode ? '#e0e0e0' : '#333',
      padding: '24px',
      borderRadius: '16px', 
      border: `1px solid ${darkMode ? '#333' : '#dadce0'}`,
      marginBottom: '25px',
      transition: 'all 0.2s',
      fontFamily: 'system-ui, sans-serif',
      boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
    },
    input: {
      backgroundColor: darkMode ? '#2d2d2d' : '#fff',
      color: darkMode ? '#fff' : '#333',
      border: `1px solid ${darkMode ? '#444' : '#ccc'}`,
      padding: '12px',
      borderRadius: '8px',
      outline: 'none',
      fontSize: '14px',
      width: '100%',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s'
    },
    label: {
      fontSize: '12px',
      color: darkMode ? '#aaa' : '#666',
      fontWeight: '600',
      marginBottom: '2px'
    },
    flexContainer: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      width: '100%'
    },
    btnMais: {
      padding: '11px 14px',
      backgroundColor: '#1a73e8',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '16px',
      boxShadow: '0 2px 4px rgba(26,115,232,0.2)'
    }
  };

  return (
    <section style={styles.card}>
      <h3 style={{ marginTop: 0, color: '#1a73e8', marginBottom: '22px', fontSize: '18px', fontWeight: '700' }}>
        {bemParaEditar ? '✏️ Editar Registro de Patrimônio' : '🏛️ Cadastrar Novo Patrimônio'}
      </h3>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        
        {/* Nome */}
        <div style={{ gridColumn: 'span 2' }}>
          <input 
            name="nome" 
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome do Patrimônio"
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
          placeholder="Quantidade de Itens" 
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
          placeholder="Valor Unitário de Aquisição (R$)" 
          style={styles.input}
        />

        {/* Categoria */}
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
          <button type="button" onClick={handleCriarCategoriaRapida} style={styles.btnMais}>+</button>
        </div>

        {/* Local */}
        <div style={styles.flexContainer}>
          <select 
            name="localId" 
            value={formData.localId} 
            onChange={handleChange} 
            required
            style={styles.input}
          >
            <option value="">Selecione o local de alocação</option>
            {locais.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.nome}</option>
            ))}
          </select>
          <button type="button" onClick={handleCriarLocalRapido} style={styles.btnMais}>+</button>
        </div>

        {/* Data de Aquisição */}
        <div style={{ display: 'grid', gap: '4px' }}>
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
        <div style={{ display: 'grid', gap: '4px' }}>
          <label style={styles.label}>Prazo Limite para Próxima Manutenção</label>
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
            placeholder="Especificações técnicas ou detalhes do bem..."
            style={{ ...styles.input, height: '80px', resize: 'vertical' }} 
          />
        </div>

        {/* SEÇÃO DE UPLOAD */}
        <div style={{ gridColumn: 'span 2', display: 'grid', gap: '8px' }}>
          <label style={styles.label}>Imagem Real do Ativo Físico (PNG, JPG) 📁</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <input 
              type="file" 
              id="upload-imagem"
              accept="image/*"
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            <label 
              htmlFor="upload-imagem" 
              style={{
                padding: '10px 16px',
                backgroundColor: darkMode ? '#2d2d2d' : '#f0f2f5',
                color: darkMode ? '#fff' : '#333',
                border: `1px dashed ${darkMode ? '#555' : '#ccc'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📷 {imagePreview ? 'Substituir Mídia' : 'Vincular Imagem'}
            </label>
            <span style={{ fontSize: '13px', color: darkMode ? '#aaa' : '#666', fontStyle: 'italic' }}>
              {imagemArquivo ? imagemArquivo.name : (imagePreview ? 'Mantendo imagem atual' : 'Nenhuma imagem selecionada')}
            </span>
          </div>
        </div>

        {/* PREVIEW */}
        {imagePreview && (
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <div style={{ position: 'relative', border: `2px solid #1a73e8`, borderRadius: '12px', padding: '4px', backgroundColor: darkMode ? '#1e1e1e' : '#fff' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ width: '130px', height: '130px', objectFit: 'cover', borderRadius: '8px' }} 
              />
              <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#1a73e8', color: '#fff', fontSize: '9px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                PREVIEW DE MÍDIA
              </div>
            </div>
          </div>
        )}

        <button type="submit" style={{ gridColumn: 'span 2', padding: '12px', fontWeight: 'bold', backgroundColor: '#1a73e8', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', marginTop: '10px' }}>
          {bemParaEditar ? 'Confirmar Atualização de Patrimônio' : 'Cadastrar Ativo no Sistema'}
        </button>

        {bemParaEditar && (
          <button type="button" onClick={cancelarEdicao} style={{ gridColumn: 'span 2', padding: '10px', backgroundColor: 'transparent', border: '1px solid #ff4d4f', borderRadius: '8px', color: '#ff4d4f', fontWeight: '600', cursor: 'pointer' }}>
            Descartar Edição
          </button>
        )}
      </form>
    </section>
  );
}