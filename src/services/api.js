import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

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

export const deletarMaterial = async (id) => {
  try {
    // IMPORTANTE: Verifica se a URL no seu Back-end termina com /id ou ?id=
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
    throw error;
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

export const atualizarMaterial = async (id, dados) => {
  try {
    const response = await api.put(`/material/${id}`, dados);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar material:", error.response || error);
    throw error;
  }
};

export default api;
