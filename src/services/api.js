import axios from 'axios';

// Instância principal (Protegida) - Adiciona o Token JWT automaticamente
const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Instância alternativa (Pública) - Sem interceptor de token para testes de bypass
export const apiPublica = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Interceptor do Axios: injeta o Token JWT do localStorage em todas as requisições da instância 'api'
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- AUTENTICAÇÃO ---
export const realizarLogin = async (email, senha) => {
  try {
    const response = await api.post('/auth/login', { email, senha });
    console.log('LOGIN RESPONSE:', response.data);
    return response.data; 
  } catch (error) {
    console.error('Erro no login:', error.response || error);
    throw error;
  }
};

// --- MATERIAL ---
export const listarMateriais = async () => {
  try {
    const response = await api.get('/material');
    return response.data;
  } catch (error) {
    console.error("Erro ao listar materiais:", error.response || error);
    throw error;
  }
};

export const salvarMaterial = async (dados) => {
  try {
    const response = await api.post('/material', dados);
    return response.data;
  } catch (error) {
    console.error("Erro ao salvar material:", error.response || error);
    throw error;
  }
};

export const atualizarMaterial = async (id, dados) => {
  try {
    const response = await api.put(`/material/${id}`, dados);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar material:", error.response || error);
    throw error;
  }
};

export const deletarMaterial = async (id) => {
  try {
    await api.delete(`/material/${id}`);
  } catch (error) {
    console.error("Erro ao deletar material:", error.response || error);
    throw error;
  }
};

// --- UPLOAD DE IMAGEM ---
export const fazerUploadImagemMaterial = async (idMaterial, arquivoImagem) => {
  try {
    const formData = new FormData();
    formData.append('imagem', arquivoImagem); 

    const response = await api.post(`/material/${idMaterial}/imagem`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error.response || error);
    throw error;
  }
};

// --- CATEGORIA ---
export const listarCategorias = async () => {
  try {
    const response = await api.get('/categoria');
    return response.data;
  } catch (error) {
    console.error("Erro ao listar categorias:", error.response || error);
    return [];
  }
};

// --- LOCAL ---
export const listarLocais = async () => {
  try {
    const response = await api.get('/local');
    return response.data;
  } catch (error) {
    console.error('Erro ao listar locais:', error.response || error);
    return [
      { id: 1, nome: 'Departamento TI' },
      { id: 2, nome: 'Escritório' },
      { id: 3, nome: 'Recepção' }
    ];
  }
};

// --- USUARIO ---
export const salvarUsuario = async (dados) => {
  try {
    const response = await api.post('/usuario', dados);
    return response.data;
  } catch (error) {
    console.error("Erro ao salvar usuário:", error.response || error);
    throw error;
  }
};

export const listarUsuarios = async () => {
  try {
    const response = await api.get('/usuario');
    return response.data;
  } catch (error) {
    console.error("Erro ao listar usuários (Mock ativo):", error.message);
    return [
      { id: 1, nome: 'Administrador', role: 'ROLE_ADM', tipo: 'ADM' },
      { id: 2, nome: 'Lucas Cliente', role: 'ROLE_CLIENTE', tipo: 'CLIENTE' },
      { id: 3, nome: 'João Backend', role: 'ROLE_CLIENTE', tipo: 'CLIENTE' },
      { id: 4, nome: 'Maria Supervisora', role: 'ROLE_CLIENTE', tipo: 'CLIENTE' }
    ];
  }
};

// --- AUDITORIA ---
export const buscarLogsAuditoria = async () => {
  try {
    const response = await api.get('/auditoria');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar logs (Mock ativo):", error.message);
    return [
      { id: 1, usuario: 'Administrador', acao: 'CREATE', item: 'Monitor Dell', data: new Date().toISOString() },
      { id: 2, usuario: 'João Backend', acao: 'UPDATE', item: 'Cadeira Gamer', detalhe: 'Alterou localização', data: new Date().toISOString() },
      { id: 3, usuario: 'Administrador', acao: 'DELETE', item: 'Teclado Antigo', data: new Date().toISOString() }
    ];
  }
};

// --- MOVIMENTAÇÕES E SOLICITAÇÕES ---
export const listarSolicitacoesPendentes = async () => {
  try {
    const response = await api.get('/movimentacao/pendentes');
    return response.data;
  } catch (error) {
    console.error("Erro ao listar solicitações pendentes (Mock ativo):", error.message);
    return [
      { 
        id: 101, 
        materialNome: 'Notebook Dell Latitude', 
        materialId: 5,
        tipo: 'MANUTENCAO', 
        solicitante: 'João P Neves (Mobile)', 
        observacao: 'Tela piscando e cooler fazendo muito barulho.',
        dataSolicitacao: '16/06/2026'
      },
      { 
        id: 102, 
        materialNome: 'Cadeira Ergonômica', 
        materialId: 8,
        tipo: 'TRANSFERENCIA', 
        localDestinoNome: 'Departamento TI',
        localDestinoId: 1,
        solicitante: 'Lucas Cliente', 
        observacao: 'Mudança de setor do funcionário.',
        dataSolicitacao: '16/06/2026'
      }
    ];
  }
};

export const responderSolicitacao = async (idSolicitacao, aprovado) => {
  try {
    const response = await api.put(`/movimentacao/${idSolicitacao}/responder`, null, {
      params: { aprovado: aprovado }
    });
    return response.data;
  } catch (error) {
    console.warn(`Erro na API ao responder solicitação (Mock ativo):`, error.message);
    return { status: 'sucesso', mensagem: aprovado ? 'Aprovado com sucesso!' : 'Reprovado com sucesso!' };
  }
};

export default api;