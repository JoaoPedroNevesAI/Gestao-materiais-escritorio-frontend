import { useState } from 'react';
import { toast } from 'react-toastify';
import CadastroUsuario from './Cadastro';

export default function Login({ aoLogar }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrandoCadastro, setMostrandoCadastro] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((usuario === 'admin' || usuario === 'gerente') && senha === '123') {
      toast.success(`Bem-vindo, ${usuario}! Acesso total autorizado.`);
      aoLogar({ nome: usuario, cargo: 'ADM' });
    } else if (usuario === 'user' && senha === '123') {
      toast.info("Acesso autorizado: Modo de Visualização.");
      aoLogar({ nome: 'Colaborador', cargo: 'VISUALIZADOR' });
    } else {
      toast.error("Credenciais inválidas. Verifique usuário e senha.");
    }
  };

  const manipularEsqueciSenha = (e) => {
    e.preventDefault();
    toast.info("🔒 Serviço de recuperação indisponível: contate o suporte de TI local.");
  };

  if (mostrandoCadastro) {
    return <CadastroUsuario aoFinalizar={() => setMostrandoCadastro(false)} />;
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f0f2f5' 
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#1a73e8', margin: 0 }}>🏛️ Patrimônio Web</h2>
          <p style={{ color: '#5f6368', marginTop: '5px' }}>Sistema de Gerenciamento de Bens</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ fontWeight: '500' }}>Usuário</label>
            <input 
              type="text" 
              value={usuario} 
              onChange={(e) => setUsuario(e.target.value)} 
              placeholder="admin, gerente ou user"
              required 
            />
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ fontWeight: '500' }}>Senha</label>
            <input 
              type="password" 
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              placeholder="Digite sua senha"
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontSize: '16px' }}>
            Entrar no Sistema
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #dadce0', paddingTop: '15px' }}>
          <div style={{ marginBottom: '10px' }}>
            <a 
              href="#" 
              onClick={() => setMostrandoCadastro(true)}
              style={{ color: '#188038', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}
            >
              Criar nova conta de usuário
            </a>
          </div>
          
          <a 
            href="#" 
            onClick={manipularEsqueciSenha}
            style={{ color: '#1a73e8', textDecoration: 'none', fontSize: '14px' }}
          >
            Esqueci minha senha
          </a>
          
          <p style={{ color: '#9aa0a6', fontSize: '12px', marginTop: '10px' }}>
            Versão 1.0 (Conectado ao Backend)
          </p>
        </div>
      </div>
    </div>
  );
}