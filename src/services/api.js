import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api' // Mantido com /api na base para combinar com as rotas abaixo
});

// Interceptor do Axios: injeta o Token JWT do localStorage em todas as requisições automaticamente
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
    // Rota final: http://localhost:8080/api/auth/login
    const response = await api.post('/auth/login', { email, senha });
    console.log('LOGIN RESPONSE:', response.data);
    return response.data; // Retorna { token, nome, role }
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

// --- CATEGORIA ---
export const listarCategorias = async () => {
  try {
    const response = await api.get('/categoria');
    return response.data;
  } catch (error) {
    console.error("Erro ao listar categorias:", error.response || error);
    // Retorna fallback vazio para o formulário não quebrar se o server estiver off
    return [];
  }
};

// --- NOVA: LISTAR LOCAIS (Pedido pelo João na branch feature/local) ---
export const listarLocais = async () => {
  try {
    const response = await api.get('/local');
    return response.data;
  } catch (error) {
    console.error('Erro ao listar locais:', error.response || error);
    // Retorna dados mocados para a interface renderizar mesmo sem o servidor Java ligado!
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

// --- LISTAR USUÁRIOS (Sincronizado com os nomes e roles da branch do João) ---
export const listarUsuarios = async () => {
  try {
    const response = await api.get('/usuario');
    return response.data;
  } catch (error) {
    console.error("Erro ao listar usuários (Usando Mock temporário):", error.message);
    return [
      { id: 1, nome: 'Administrador', role: 'ROLE_ADM', tipo: 'ADM' },
      { id: 2, nome: 'Lucas Cliente', role: 'ROLE_CLIENTE', tipo: 'CLIENTE' },
      { id: 3, nome: 'João Backend', role: 'ROLE_CLIENTE', tipo: 'CLIENTE' },
      { id: 4, nome: 'Maria Supervisora', role: 'ROLE_CLIENTE', tipo: 'CLIENTE' }
    ];
  }
};

// --- BUSCAR AUDITORIA (Mantido aqui por segurança para compilar sem erros) ---
export const buscarLogsAuditoria = async () => {
  try {
    const response = await api.get('/auditoria');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar logs (Usando Mock temporário):", error.message);
    return [
      { id: 1, usuario: 'Administrador', acao: 'CREATE', item: 'Monitor Dell', data: new Date().toISOString() },
      { id: 2, usuario: 'João Backend', acao: 'UPDATE', item: 'Cadeira Gamer', detalhe: 'Alterou localização', data: new Date().toISOString() },
      { id: 3, usuario: 'Administrador', acao: 'DELETE', item: 'Teclado Antigo', data: new Date().toISOString() }
    ];
  }
};

export default api;