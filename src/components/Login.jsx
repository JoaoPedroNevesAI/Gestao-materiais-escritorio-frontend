import { useState } from 'react';
import { toast } from 'react-toastify';
import { realizarLogin } from '../services/api';
import CadastroUsuario from './Cadastro';

// Componente principal de Login
export default function Login({ aoLogar }) {

  // Estado do campo usuário (que o back espera como email)
  const [email, setEmail] = useState('');

  // Estado do campo senha
  const [senha, setSenha] = useState('');

  // Controla o estado de carregamento do botão
  const [carregando, setCarregando] = useState(false);

  // Controla se mostra login ou cadastro
  const [mostrandoCadastro, setMostrandoCadastro] = useState(false);

  // Função ao enviar formulário integrado ao backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      // Faz a requisição real para o Spring Boot
      const dados = await realizarLogin(email, senha);

      // Salva o token JWT no navegador para as próximas requisições
      localStorage.setItem('token', dados.token);

      // Envia os dados corretos vindo do Java para o App.jsx
      aoLogar({ 
        nome: dados.nome, 
        role: dados.role // ROLE_ADM ou ROLE_CLIENTE
      });

      toast.success(`Bem-vindo, ${dados.nome}!`);
    } catch (error) {
      console.error("Erro na autenticação:", error);
      
      // Trata erros de credenciais inválidas ou queda de servidor
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        toast.error("Credenciais inválidas. Verifique seu e-mail e senha.");
      } else {
        toast.error("Erro ao conectar com o servidor. O backend está rodando?");
      }
    } finally {
      setCarregando(false);
    }
  };

  // Função "esqueci senha" (simulada)
  const manipularEsqueciSenha = (e) => {
    e.preventDefault();
    toast.info("🔒 Serviço de recuperação indisponível: contate o suporte de TI local.");
  };

  // Se estiver no modo cadastro, troca completamente a tela
  if (mostrandoCadastro) {
    return (
      <CadastroUsuario 
        aoFinalizar={() => setMostrandoCadastro(false)} 
      />
    );
  }

  // Tela de login
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f0f2f5' 
    }}>
      
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
        
        {/* Título */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#1a73e8', margin: 0 }}>
            🏛️ Patrimônio Web
          </h2>
          <p style={{ color: '#5f6368', marginTop: '5px' }}>
            Sistema de Gerenciamento de Bens
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          
          {/* E-mail */}
          <div style={{ display: 'grid', gap: '8px' }}>
            <label>E-mail institucional</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@ifes.com"
              required 
            />
          </div>

          {/* Senha */}
          <div style={{ display: 'grid', gap: '8px' }}>
            <label>Senha</label>
            <input 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required 
            />
          </div>

          {/* Botão */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ padding: '12px', fontSize: '16px' }}
            disabled={carregando}
          >
            {carregando ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>

        {/* Área inferior */}
        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center', 
          borderTop: '1px solid #dadce0', 
          paddingTop: '15px' 
        }}>
          
          {/* Criar conta */}
          <div style={{ marginBottom: '10px' }}>
            <a 
              href="#" 
              onClick={() => setMostrandoCadastro(true)}
            >
              Criar nova conta de usuário
            </a>
          </div>
          
          {/* Esqueci senha */}
          <a 
            href="#" 
            onClick={manipularEsqueciSenha}
          >
            Esqueci minha senha
          </a>
          
          <p style={{ fontSize: '12px', marginTop: '10px' }}>
            Versão 1.0 (Conectado ao Backend)
          </p>
        </div>
      </div>
    </div>
  );
}