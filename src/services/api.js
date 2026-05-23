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
  // Rota final: http://localhost:8080/api/auth/login
  const response = await api.post('/auth/login', { email, senha });
  return response.data; // Retorna { token, nome, role }
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

// --- NOVA: LISTAR USUÁRIOS (Para a barra lateral de acessos) ---
export const listarUsuarios = async () => {
  try {
    const response = await api.get('/usuario');
    return response.data;
  } catch (error) {
    console.error("Erro ao listar usuários (Usando Mock temporário):", error.message);
    // Retorna dados mocados para a interface renderizar mesmo sem o servidor Java ligado!
    return [
      { id: 1, nome: 'Luiz (Você)', role: 'ROLE_ADM', tipo: 'ADM' },
      { id: 2, nome: 'Lucas Coisinha', role: 'ROLE_USER', tipo: 'USER' },
      { id: 3, nome: 'João Backend', role: 'ROLE_USER', tipo: 'USER' },
      { id: 4, nome: 'Maria Supervisor', role: 'ROLE_USER', tipo: 'USER' }
    ];
  }
};

// --- NOVA: BUSCAR AUDITORIA (Para a tabela de logs) ---
export const buscarLogsAuditoria = async () => {
  try {
    const response = await api.get('/auditoria'); // Altere a rota aqui se o endpoint no Spring for diferente (ex: /logs)
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar logs (Usando Mock temporário):", error.message);
    // Evita crash na tela de auditoria quando o server está offline
    return [
      { id: 1, usuario: 'Luiz', acao: 'CREATE', item: 'Monitor Dell 24"', data: new Date().toISOString() },
      { id: 2, usuario: 'João Backend', acao: 'UPDATE', item: 'Cadeira Gamer', detalhe: 'Alterou valor', data: new Date().toISOString() },
      { id: 3, usuario: 'Admin', acao: 'DELETE', item: 'Teclado Antigo Mecânico', data: new Date().toISOString() }
    ];
  }
};

export default api;