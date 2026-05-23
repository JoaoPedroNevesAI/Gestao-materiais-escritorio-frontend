// Importa o React e o hook useState para controlar estado do componente
import React, { useState } from 'react';

// Importa o toast para mostrar mensagens na tela (sucesso/erro)
import { toast } from 'react-toastify';

// Importa a função real de cadastro da API
import { salvarUsuario } from '../services/api';

// Componente principal de cadastro de usuário
// Recebe uma função "aoFinalizar" como prop (ex: voltar pro login)
export default function CadastroUsuario({ aoFinalizar }) {

  // Estado para controlar se está carregando (evita múltiplos cliques)
  const [loading, setLoading] = useState(false);

  // Função chamada quando o formulário é enviado
  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    setLoading(true);   // Ativa estado de carregamento
    
    // Captura os dados do formulário
    const fd = new FormData(e.target);

    // Converte FormData em objeto JS comum
    const dadosForm = Object.fromEntries(fd);

    // Monta o objeto mapeado exatamente como o Java espera
    const novoUsuario = {
      nome: dadosForm.nome,
      email: dadosForm.email,
      senha: dadosForm.senha,
      tipo: dadosForm.tipo // Vai enviar "ADM" ou "CLIENTE"
    };

    try {
      // Faz a requisição usando nossa api configurada (POST /api/usuario)
      await salvarUsuario(novoUsuario);

      toast.success("Usuário criado com sucesso!");

      // Se existir função aoFinalizar, chama ela para voltar à tela de login
      if (aoFinalizar) aoFinalizar(); 

    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      
      // Trata a resposta de erro do backend
      if (error.response && error.response.status === 400) {
        toast.error("Erro ao cadastrar: Verifique se o e-mail já está em uso.");
      } else {
        toast.error("Erro de conexão com o servidor. O backend está rodando?");
      }
    } finally {
      // Sempre executa no final (sucesso ou erro)
      setLoading(false); // Desativa loading
    }
  };

  // JSX (interface visual do componente)
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh', 
      backgroundColor: 'var(--bg-color)' 
    }}>
      
      {/* Card central */}
      <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
        
        {/* Título */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>
            👤 Novo Usuário
          </h2>
          <p style={{ color: '#5f6368' }}>
            Crie uma conta para acessar o sistema
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
          
          {/* Campo Nome */}
          <div style={{ display: 'grid', gap: '5px' }}>
            <label>Nome Completo</label>
            <input 
              name="nome" 
              type="text" 
              placeholder="Ex: João Silva" 
              required 
            />
          </div>

          {/* Campo Email */}
          <div style={{ display: 'grid', gap: '5px' }}>
            <label>E-mail Institucional</label>
            <input 
              name="email" 
              type="email" 
              placeholder="email@ifes.com" 
              required 
            />
          </div>

          {/* Campo Senha */}
          <div style={{ display: 'grid', gap: '5px' }}>
            <label>Senha</label>
            <input 
              name="senha" 
              type="password" 
              placeholder="Crie uma senha forte" 
              required 
            />
          </div>

          {/* Select de tipo de usuário alinhado com o Backend (ADM ou CLIENTE) */}
          <div style={{ display: 'grid', gap: '5px' }}>
            <label>Tipo de Acesso</label>
            <select name="tipo" required>
              <option value="">Selecione o cargo...</option>
              <option value="ADM">Administrador (Total)</option>
              <option value="CLIENTE">Cliente (Apenas consulta)</option>
            </select>
          </div>

          {/* Botão de envio */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading} // Desabilita enquanto carrega
            style={{ padding: '12px', marginTop: '10px' }}
          >
            {loading ? "Processando..." : "Finalizar Cadastro"}
          </button>
          
          {/* Botão de voltar */}
          <button 
            type="button" 
            onClick={aoFinalizar}
            className="btn" 
            style={{ backgroundColor: 'transparent', color: '#5f6368' }}
          >
            Voltar para o Login
          </button>
        </form>
      </div>
    </div>
  );
}