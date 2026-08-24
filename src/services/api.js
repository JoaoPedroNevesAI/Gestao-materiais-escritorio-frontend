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

// --- HELPER LOCAL PARA COLETAR SESSÃO DO USUÁRIO ---
const obterUsuarioAtual = () => {
  try {
    const usuarioSalvo = localStorage.getItem('usuario_patrimonio');
    if (usuarioSalvo) {
      const parsed = JSON.parse(usuarioSalvo);
      return parsed.nome || 'Usuário';
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
    const response = await api.post('/material', dados);
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
    const response = await api.put(`/material/${id}`, dados);
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
    // Normalização de DTO para garantir compatibilidade com Spring Boot e Security
    const payload = {
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha || 'Senha@123', // Garante uma senha válida se o formulário não passar
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
    const logsLocais = JSON.parse(localStorage.getItem('logs_auditoria_front')) || [];
    return [...logsLocais, ...response.data];
  } catch (error) {
    console.error("Erro ao buscar logs (Mesclando histórico local):", error.message);
    
    const logsLocais = JSON.parse(localStorage.getItem('logs_auditoria_front')) || [];
    
    const mocksEstaticos = [
      { id: 1, usuario: 'Administrador', acao: 'CREATE', item: 'Monitor Dell 24"', detalhe: 'Configuração inicial do sistema', data: '2026-06-28T14:32:00.000Z' },
      { id: 2, usuario: 'Lucas Cliente', acao: 'UPDATE', item: 'Cadeira Gamer', detalhe: 'Alterou localização para Departamento TI', data: '2026-06-27T10:15:00.000Z' }
    ];

    return [...logsLocais, ...mocksEstaticos];
  }
};

// --- MOVIMENTAÇÕES E SOLICITAÇÕES REAL (SINCRONIZADAS COM O SPRING BOOT) ---

// 1. Criar/Solicitar nova movimentação pendente (Mapeia SolicitarMovimentacaoRequest)
export const solicitarMovimentacao = async (dadosMovimentacao) => {
  try {
    const payload = {
      patrimonioId: Number(dadosMovimentacao.patrimonioId || dadosMovimentacao.materialId),
      localDestinoId: Number(dadosMovimentacao.localDestinoId),
      observacao: dadosMovimentacao.observacao || ""
    };

    const response = await api.post('/solicitacao-movimentacao/solicitar', payload);
    
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

// 2. Listar solicitações pendentes para o painel de aprovação
export const listarSolicitacoesPendentes = async () => {
  try {
    const response = await api.get('/solicitacao-movimentacao/pendentes');
    return response.data;
  } catch (error) {
    console.error("Erro ao listar solicitações pendentes:", error.message);
    return [];
  }
};

// 3. Responder solicitação (Aprovar / Reprovar) - Mapeia AprovarMovimentacaoRequest
export const responderSolicitacao = async (idSolicitacao, aprovado, observacaoAdmin = "") => {
  try {
    const endpoint = `/solicitacao-movimentacao/${idSolicitacao}/${aprovado ? 'aprovar' : 'reprovar'}`;
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

// 4. Transferência Direta sem aprovação prévia (Mapeia MovimentacaoRequest)
export const transferirPatrimonioDireto = async (dados) => {
  try {
    const payload = {
      patrimonioId: Number(dados.patrimonioId || dados.materialId),
      localDestinoId: Number(dados.localDestinoId),
      observacao: dados.observacao || ""
    };

    const response = await api.post('/movimentacao/transferir', payload);
    
    salvarLogLocal('TRANSFERENCIA_DIRETA', `Patrimônio #${payload.patrimonioId}`, `Transferido direto para local ${payload.localDestinoId}`);
    return response.data;
  } catch (error) {
    console.error("Erro na transferência direta:", error.response || error);
    throw error;
  }
};

// 5. Buscar histórico de movimentações de um patrimônio específico
export const buscarHistoricoMovimentacoes = async (materialId) => {
  try {
    const response = await api.get(`/movimentacao/material/${materialId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar histórico do material:", error.message);
    return [];
  }
};

export default api;