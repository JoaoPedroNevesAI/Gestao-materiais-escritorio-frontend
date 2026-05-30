import { useState } from 'react';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode'; 
import { realizarLogin } from '../services/api';
import CadastroUsuario from './Cadastro';

export default function Login({ aoLogar }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrandoCadastro, setMostrandoCadastro] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const dados = await realizarLogin(email, senha);
      const token = dados?.token;

      if (!token) {
        throw new Error("Token não retornado pelo servidor");
      }

      // Decodifica o token para capturar a autoridade real vinda do backend
      const decoded = jwtDecode(token);
      const nomeUsuario = decoded.sub.split('@')[0];
      const nomeFormatado = nomeUsuario.charAt(0).toUpperCase() + nomeUsuario.slice(1);

      // Pega dinamicamente as permissões atribuídas
      let roleReal = 'ROLE_CLIENTE';
      if (decoded.authorities) {
        if (Array.isArray(decoded.authorities)) {
          roleReal = decoded.authorities[0] || 'ROLE_CLIENTE';
        } else if (typeof decoded.authorities === 'string') {
          roleReal = decoded.authorities;
        }
      }

      // Envia os dados limpos e sincronizados para o manipulador do App.jsx
      aoLogar({ 
        token: token,
        nome: nomeFormatado,
        role: roleReal 
      });

    } catch (error) {
      console.error("Erro na autenticação:", error);
      toast.error("Credenciais inválidas ou erro no servidor.");
    } finally {
      setCarregando(false);
    }
  };

  const manipularEsqueciSenha = (e) => {
    e.preventDefault();
    toast.info("🔒 Serviço de recuperação indisponível: contate o suporte de TI.");
  };

  if (mostrandoCadastro) {
    return <CadastroUsuario aoFinalizar={() => setMostrandoCadastro(false)} />;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '30px', backgroundColor: '#fff', borderRadius: '12px' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#1a73e8', margin: 0 }}>🏛️ Patrimônio Web</h2>
          <p style={{ color: '#5f6368', marginTop: '5px' }}>Sistema de Gerenciamento de Bens</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <label>E-mail institucional</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@ifes.com" required />
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <label>Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Digite sua senha" required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontSize: '16px', cursor: 'pointer' }} disabled={carregando}>
            {carregando ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #dadce0', paddingTop: '15px' }}>
          <div style={{ marginBottom: '10px' }}>
            <a href="#" onClick={() => setMostrandoCadastro(true)}>Criar nova conta de usuário</a>
          </div>
          <a href="#" onClick={manipularEsqueciSenha}>Esqueci minha senha</a>
          <p style={{ fontSize: '12px', marginTop: '10px' }}>Versão 1.0 (Conectado ao Backend)</p>
        </div>
      </div>
    </div>
  );
}