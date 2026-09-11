import axios from 'axios';

// Instância principal (Protegida) - Adiciona o Token JWT automaticamente
const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Instância alternativa (Pública)
export const apiPublica = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Interceptor de Requisição: injeta o Token JWT em todas as chamadas protegidas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Garante que o formato Bearer sempre vá com o espaço correto
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Resposta: trata sessão expirada/inválida tanto no 401 QUANTO no 403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Sessão negada ou sem permissão (401/403). Verifique as roles e o token.');
    }
    return Promise.reject(error);
  }
);

// --- HELPER LOCAL PARA COLETAR SESSÃO DO USUÁRIO ---
const obterUsuarioAtual = () => {
  try {
    const usuarioSalvo = localStorage.getItem('usuario_patrimonio');
    if (usuarioSalvo) {
      const parsed = JSON.parse(usuarioSalvo);
      return parsed.nome || parsed.email || 'Usuário';
    }
  } catch (e) {
    console.error("Erro ao ler sessão do localStorage para auditoria", e);
  }
  return 'Luis'; 
};

// --- HELPER LOCAL PARA INJETAR LOGS EM TEMPO REAL NO FRONT ---
const salvarLogLocal = (acao, item, detalhe = '') => {
  try {
    const logsAntigos = JSON.parse(localStorage.getItem('logs_auditoria_front')) || [];
    const novoLog = {
      id: Date.now(), 
      usuario: obterUsuarioAtual(),
      acao: acao,
      item: item,
      detalhe: detalhe,
      data: new Date().toISOString()
    };
    localStorage.setItem('logs_auditoria_front', JSON.stringify([novoLog, ...logsAntigos]));
  } catch (e) {
    console.error("Erro ao salvar log na persistência local", e);
  }
};

// --- HELPER PARA FORMATAR DTO DE MATERIAL PARA O SPRING BOOT ---
const normalizarPayloadMaterial = (dados) => {
  const payload = { ...dados };

  // Tratamento limpo para categoria
  if (dados.categoriaId) {
    payload.categoria = { id: Number(dados.categoriaId) };
  } else if (typeof dados.categoria === 'object' && dados.categoria?.id) {
    payload.categoria = { id: Number(dados.categoria.id) };
  } else if (dados.categoria) {
    payload.categoria = { id: Number(dados.categoria) };
  }

  // Tratamento limpo para local
  if (dados.localId) {
    payload.local = { id: Number(dados.localId) };
  } else if (typeof dados.local === 'object' && dados.local?.id) {
    payload.local = { id: Number(dados.local.id) };
  } else if (dados.local) {
    payload.local = { id: Number(dados.local) };
  }

  return payload;
};

// --- AUTENTICAÇÃO ---
export const realizarLogin = async (email, senha) => {
  try {
    const response = await apiPublica.post('/auth/login', { email, senha });
    console.log('LOGIN RESPONSE:', response.data);
    
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    if (response.data?.usuario) {
      localStorage.setItem('usuario_patrimonio', JSON.stringify(response.data.usuario));
    }
    
    return response.data; 
  } catch (error) {
    console.error('Erro no login:', error.response || error);
    throw error;
  }
};

// --- MATERIAL / PATRIMÔNIO ---
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
    const payload = normalizarPayloadMaterial(dados);
    const response = await api.post('/material', payload);
    if (response.data) {
      salvarLogLocal('CREATE', response.data.nome || dados.nome, 'Cadastrou novo material corporativo');
    }
    return response.data;
  } catch (error) {
    console.error("Erro ao salvar material:", error.response || error);
    throw error;
  }
};

export const atualizarMaterial = async (id, dados) => {
  try {
    const payload = normalizarPayloadMaterial(dados);
    const response = await api.put(`/material/${id}`, payload);
    salvarLogLocal('UPDATE', dados.nome || `Item #${id}`, 'Modificou dados cadastrais ou status');
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar material:", error.response || error);
    throw error;
  }
};

export const deletarMaterial = async (id) => {
  try {
    await api.delete(`/material/${id}`);
    salvarLogLocal('DELETE', `Patrimônio #${id}`, 'Realizou a exclusão lógica do ativo');
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

// --- USUÁRIO ---
export const salvarUsuario = async (dados) => {
  try {
    const payload = {
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha || 'Senha@123',
      role: dados.role || (dados.tipo === 'ADM' ? 'ROLE_ADM' : 'ROLE_CLIENTE'),
      tipo: dados.tipo || 'CLIENTE'
    };

    const response = await api.post('/usuario', payload);
    salvarLogLocal('CREATE', `Usuário: ${dados.nome}`, 'Cadastrou novo colaborador no sistema');
    return response.data;
  } catch (error) {
    console.error("Erro ao salvar usuário:", error.response?.data || error);
    throw error;
  }
};

export const listarUsuarios = async () => {
  try {
    const response = await api.get('/usuario');
    return response.data;
  } catch (error) {
    console.error("Erro ao listar usuários:", error.message);
    return [];
  }
};

// --- AUDITORIA ---
export const buscarLogsAuditoria = async () => {
  try {
    const response = await api.get('/auditoria');
    const logsLocais = JSON.parse(localStorage.getItem('logs_auditoria_front')) || [];
    return [...logsLocais, ...response.data];
  } catch (error) {
    console.error("Erro ao buscar logs (Mesclando histórico local):", error.message);
    const logsLocais = JSON.parse(localStorage.getItem('logs_auditoria_front')) || [];
    return logsLocais;
  }
};

// --- MOVIMENTAÇÕES E SOLICITAÇÕES ---
export const solicitarMovimentacao = async (dadosMovimentacao) => {
  try {
    const payload = {
      patrimonioId: Number(dadosMovimentacao.patrimonioId || dadosMovimentacao.materialId),
      localDestinoId: Number(dadosMovimentacao.localDestinoId),
      observacao: dadosMovimentacao.observacao || ""
    };

    const response = await api.post('/movimentacao', payload);
    
    salvarLogLocal(
      'TRANSFERENCIA', 
      `Patrimônio #${payload.patrimonioId}`, 
      `Solicitou mudança para local ID: ${payload.localDestinoId}`
    );

    return response.data;
  } catch (error) {
    console.error("Erro ao solicitar movimentação:", error.response || error);
    throw error;
  }
};

export const listarMovimentacoes = async () => {
  try {
    const response = await api.get('/movimentacao');
    return response.data;
  } catch (error) {
    console.error("Erro ao listar todas as movimentações:", error.message);
    return [];
  }
};

export const listarSolicitacoesPendentes = async () => {
  try {
    const response = await api.get('/movimentacao/pendentes');
    return response.data;
  } catch (error) {
    console.error("Erro ao listar solicitações pendentes:", error.message);
    return [];
  }
};

export const responderSolicitacao = async (idSolicitacao, aprovado, observacaoAdmin = "") => {
  try {
    const endpoint = `/movimentacao/${idSolicitacao}/${aprovado ? 'aprovar' : 'reprovar'}`;
    const payload = {
      observacaoAdmin: observacaoAdmin || (aprovado ? "Aprovado pelo gestor" : "Solicitação recusada")
    };

    const response = await api.put(endpoint, payload);

    salvarLogLocal(
      aprovado ? 'APROVACAO' : 'REJEICAO', 
      `Solicitação #${idSolicitacao}`, 
      aprovado ? 'Aprovou a movimentação de patrimônio' : 'Rejeitou a solicitação'
    );

    return response.data;
  } catch (error) {
    console.error(`Erro na API ao responder solicitação:`, error.response || error);
    throw error;
  }
};

export const transferirPatrimonioDireto = async (dados) => {
  return solicitarMovimentacao(dados);
};

export const buscarHistoricoMovimentacoes = async (patrimonioId) => {
  try {
    const response = await api.get(`/movimentacao/patrimonio/${patrimonioId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar histórico do patrimônio:", error.message);
    return [];
  }
};

export default api;