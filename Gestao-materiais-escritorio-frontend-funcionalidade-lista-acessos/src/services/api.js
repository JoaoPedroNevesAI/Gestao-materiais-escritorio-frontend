import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

export const salvarMaterial = async (dados) => {
  const response = await api.post('/material', dados);
  return response.data;
};

export const listarMateriais = async () => {
  const response = await api.get('/material');
  return response.data;
};

export const deletarMaterial = async (id) => {
  await api.delete(`/material/${id}`);
};

// USUÁRIO
export const salvarUsuario = async (dados) => {
  const response = await api.post('/usuario', dados);
  return response.data;
};