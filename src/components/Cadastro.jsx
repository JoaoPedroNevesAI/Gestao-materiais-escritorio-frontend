// Importa o React e o hook useState para controlar estado do componente
import React, { useState } from 'react';

// Importa o toast para mostrar mensagens na tela (sucesso/erro)
import { toast } from 'react-toastify';

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

    // Monta o objeto do novo usuário
    const novoUsuario = {
      nome: dadosForm.nome,
      email: dadosForm.email,
      senha: dadosForm.senha,
      tipo: dadosForm.tipo 
    };

    try {
      // Faz requisição para o backend (API)
      const response = await fetch('http://localhost:8080/api/usuarios', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUsuario), // Envia dados em JSON
      });

      // Se deu certo (status 200-299)
      if (response.ok) {
        toast.success("Usuário criado com sucesso!");

        // Se existir função aoFinalizar, chama ela (ex: voltar tela)
        if (aoFinalizar) aoFinalizar(); 
      } else {
        // Se o backend respondeu erro (ex: email já existe)
        toast.error("Erro ao cadastrar: Verifique os dados ou se o e-mail já existe.");
      }

    } catch (error) {
      // Se não conseguiu conectar com o servidor
      toast.error("Erro de conexão com o servidor.");
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
              placeholder="email@ifes.edu.br" 
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

          {/* Select de tipo de usuário */}
          <div style={{ display: 'grid', gap: '5px' }}>
            <label>Tipo de Acesso</label>
            <select name="tipo" required>
              <option value="">Selecione o cargo...</option>
              <option value="ADMINISTRADOR">Administrador (Total)</option>
              <option value="OPERADOR">Operador (Cadastro)</option>
              <option value="VISUALIZADOR">Visualizador (Apenas consulta)</option>
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