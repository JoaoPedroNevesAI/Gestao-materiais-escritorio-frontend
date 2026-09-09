import axios from 'axios';

// Instância principal (Protegida) - Adiciona o Token JWT automaticamente
const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Instância alternativa (Pública) - Sem interceptor de token para testes de bypass
export const apiPublica = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Interceptor de Requisição: injeta o Token JWT em todas as chamadas protegidas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Resposta: trata sessão expirada ou não autorizada (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Sessão expirada ou não autorizada. Limpando token...');
      localStorage.removeItem('token');
      localStorage.removeItem('usuario_patrimonio');
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

  if (dados.categoriaId && !dados.categoria) {
    payload.categoria = { id: Number(dados.categoriaId) };
  } else if (typeof dados.categoria === 'number' || typeof dados.categoria === 'string') {
    payload.categoria = { id: Number(dados.categoria) };
  }

  if (dados.localId && !dados.local) {
    payload.local = { id: Number(dados.localId) };
  } else if (typeof dados.local === 'number' || typeof dados.local === 'string') {
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

// --- MOVIMENTAÇÕES E SOLICITAÇÕES (AJUSTADO PARA O NOVO CONTROLLER SPRING BOOT) ---

// 1. Criar/Solicitar nova movimentação pendente
export const solicitarMovimentacao = async (dadosMovimentacao) => {
  try {
    const payload = {
      patrimonioId: Number(dadosMovimentacao.patrimonioId || dadosMovimentacao.materialId),
      localDestinoId: Number(dadosMovimentacao.localDestinoId),
      observacao: dadosMovimentacao.observacao || ""
    };

    // Rota ajustada para o novo padrão: POST /api/movimentacao
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

// 2. Listar todas as movimentações
export const listarMovimentacoes = async () => {
  try {
    const response = await api.get('/movimentacao');
    return response.data;
  } catch (error) {
    console.error("Erro ao listar todas as movimentações:", error.message);
    return [];
  }
};

// 3. Listar apenas solicitações pendentes para o painel de aprovação
export const listarSolicitacoesPendentes = async () => {
  try {
    // Rota ajustada para: GET /api/movimentacao/pendentes
    const response = await api.get('/movimentacao/pendentes');
    return response.data;
  } catch (error) {
    console.error("Erro ao listar solicitações pendentes:", error.message);
    return [];
  }
};

// 4. Responder solicitação (Aprovar / Reprovar)
export const responderSolicitacao = async (idSolicitacao, aprovado, observacaoAdmin = "") => {
  try {
    // Rota ajustada para: PUT /api/movimentacao/{id}/aprovar ou /reprovar
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

// 5. Transferência Direta (atualmente redireciona para a mesma rota de solicitação)
export const transferirPatrimonioDireto = async (dados) => {
  return solicitarMovimentacao(dados);
};

// 6. Buscar histórico de movimentações de um patrimônio específico
export const buscarHistoricoMovimentacoes = async (patrimonioId) => {
  try {
    // Rota ajustada para: GET /api/movimentacao/patrimonio/{id}
    const response = await api.get(`/movimentacao/patrimonio/${patrimonioId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar histórico do patrimônio:", error.message);
    return [];
  }
};

export default api;