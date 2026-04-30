// Hook de estado
import { useState } from 'react';

// Toast pra feedback (mensagens)
import { toast } from 'react-toastify';

// Componente de cadastro (tela alternativa)
import CadastroUsuario from './Cadastro';

// Componente principal de Login
export default function Login({ aoLogar }) {

  // Estado do campo usuário
  const [usuario, setUsuario] = useState('');

  // Estado do campo senha
  const [senha, setSenha] = useState('');

  // Controla se mostra login ou cadastro
  const [mostrandoCadastro, setMostrandoCadastro] = useState(false);

  // Função ao enviar formulário
  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulação de autenticação (hardcoded)
    if ((usuario === 'admin' || usuario === 'gerente') && senha === '123') {

      toast.success(`Bem-vindo, ${usuario}! Acesso total autorizado.`);

      // Envia dados pro componente pai (provavelmente salva sessão)
      aoLogar({ nome: usuario, cargo: 'ADM' });

    } else if (usuario === 'user' && senha === '123') {

      toast.info("Acesso autorizado: Modo de Visualização.");

      aoLogar({ nome: 'Colaborador', cargo: 'VISUALIZADOR' });

    } else {
      // Credenciais inválidas
      toast.error("Credenciais inválidas. Verifique usuário e senha.");
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
          
          {/* Usuário */}
          <div style={{ display: 'grid', gap: '8px' }}>
            <label>Usuário</label>
            <input 
              type="text" 
              value={usuario} // controlado
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="admin, gerente ou user"
              required 
            />
          </div>

          {/* Senha */}
          <div style={{ display: 'grid', gap: '8px' }}>
            <label>Senha</label>
            <input 
              type="password" 
              value={senha} // controlado
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
          >
            Entrar no Sistema
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