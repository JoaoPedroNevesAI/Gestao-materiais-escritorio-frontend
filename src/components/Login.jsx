import React, { useState } from 'react';
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

      // 1. Decodifica o token para capturar o nome de usuário baseado no e-mail
      const decoded = jwtDecode(token);
      const nomeUsuario = decoded.sub ? decoded.sub.split('@')[0] : (dados.nome || 'Usuário');
      const nomeFormatado = nomeUsuario.charAt(0).toUpperCase() + nomeUsuario.slice(1);

      // 2. PRIORIDADE MÁXIMA: Usa a role que veio direto na resposta do JSON (dados.role).
      // Se não existir, tenta ler o array de authorities do JWT. Se falhar, vira CLIENTE.
      let roleReal = dados?.role; 

      if (!roleReal && decoded.authorities) {
        if (Array.isArray(decoded.authorities)) {
          roleReal = decoded.authorities[0];
        } else if (typeof decoded.authorities === 'string') {
          roleReal = decoded.authorities;
        }
      }

      // Se mesmo assim continuar vazio, aplica o padrão seguro
      if (!roleReal) {
        roleReal = 'ROLE_CLIENTE';
      }

      // Envia os dados limpos e perfeitamente sincronizados para o App.jsx
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
            <label style={{ fontWeight: '500', color: '#333' }}>E-mail institucional</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="exemplo@ifes.com" 
              required 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ fontWeight: '500', color: '#333' }}>Senha</label>
            <input 
              type="password" 
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              placeholder="Digite sua senha" 
              required 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={carregando}
            style={{ 
              padding: '12px', 
              fontSize: '16px', 
              cursor: carregando ? 'not-allowed' : 'pointer',
              backgroundColor: '#1a73e8',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              transition: 'background-color 0.2s'
            }}
          >
            {carregando ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #dadce0', paddingTop: '15px' }}>
          <div style={{ marginBottom: '10px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); setMostrandoCadastro(true); }} style={{ color: '#1a73e8', textDecoration: 'none' }}>
              Criar nova conta de usuário
            </a>
          </div>
          <a href="#" onClick={manipularEsqueciSenha} style={{ color: '#5f6368', textDecoration: 'none', fontSize: '14px' }}>
            Esqueci minha senha
          </a>
          <p style={{ fontSize: '12px', marginTop: '15px', color: '#9aa0a6', margin: '15px 0 0 0' }}>
            Versão 1.0 (Conectado ao Backend)
          </p>
        </div>

      </div>
    </div>
  );
}