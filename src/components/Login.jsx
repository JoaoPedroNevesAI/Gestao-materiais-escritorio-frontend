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
  const [verSenha, setVerSenha] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const dados = await realizarLogin(email, senha);
      const token = dados?.token;

      if (!token) {
        throw new Error("Token não retornado pelo servidor");
      }

      let decoded = {};
      try {
        decoded = jwtDecode(token);
      } catch (jwtErr) {
        console.error("Falha ao decodificar o JWT:", jwtErr);
        throw new Error("Token JWT inválido");
      }

      // 1. Extrai o nome do usuário com fallbacks seguros contra null/undefined
      const sub = typeof decoded.sub === 'string' ? decoded.sub : email;
      const nomeBase = sub.includes('@') ? sub.split('@')[0] : sub;
      const nomeUsuario = dados?.nome || nomeBase || 'Usuário';
      const nomeFormatado = nomeUsuario.charAt(0).toUpperCase() + nomeUsuario.slice(1);

      // 2. Resolução da Role / Authority
      let roleReal = dados?.role || dados?.perfil || dados?.tipo; 

      if (!roleReal && decoded.authorities) {
        if (Array.isArray(decoded.authorities) && decoded.authorities.length > 0) {
          const primeiraAuth = decoded.authorities[0];
          roleReal = typeof primeiraAuth === 'object' ? primeiraAuth.authority : primeiraAuth;
        } else if (typeof decoded.authorities === 'string') {
          roleReal = decoded.authorities;
        }
      }

      if (!roleReal && decoded.role) {
        roleReal = decoded.role;
      }

      // Fallback padronizado
      if (!roleReal) {
        roleReal = 'ROLE_COLABORADOR';
      }

      // Envia os dados higienizados para o componente pai
      aoLogar({ 
        token: token,
        nome: nomeFormatado,
        role: roleReal 
      });

    } catch (error) {
      console.error("Erro na autenticação:", error);
      
      if (error.message && (error.message.includes("Token") || error.message.includes("JWT"))) {
        toast.error("Erro ao processar token de acesso. Contate o suporte.");
      } else {
        toast.error("Credenciais inválidas ou erro no servidor.");
      }
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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: 'var(--bg-color, #121212)', 
      padding: '20px'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '420px', 
        padding: '35px 30px', 
        backgroundColor: '#1e1e1e', 
        borderRadius: '16px',
        border: '1px solid #333',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        color: '#e0e0e0',
        fontFamily: 'system-ui, sans-serif'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--primary-color, #1a73e8)', margin: 0, fontWeight: '700', fontSize: '26px' }}>
            🏛️ Patrimônio Web
          </h2>
          <p style={{ color: '#aaa', marginTop: '8px', fontSize: '14px' }}>
            Sistema de Gerenciamento de Bens
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
          
          {/* E-mail */}
          <div style={{ display: 'grid', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#ccc' }}>
              E-mail institucional
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="exemplo@ifes.com" 
              required 
              style={{ 
                padding: '11px 14px', 
                borderRadius: '8px', 
                border: '1px solid #444', 
                backgroundColor: '#2d2d2d', 
                color: '#fff',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* Senha */}
          <div style={{ display: 'grid', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#ccc' }}>
              Senha
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={verSenha ? "text" : "password"} 
                value={senha} 
                onChange={(e) => setSenha(e.target.value)} 
                placeholder="Digite sua senha" 
                required 
                style={{ 
                  padding: '11px 40px 11px 14px', 
                  borderRadius: '8px', 
                  border: '1px solid #444', 
                  backgroundColor: '#2d2d2d', 
                  color: '#fff',
                  fontSize: '15px',
                  width: '100%',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              <button 
                type="button"
                onClick={() => setVerSenha(!verSenha)}
                style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '16px', 
                  color: verSenha ? '#1a73e8' : '#888',
                  outline: 'none',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={verSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {verSenha ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
          </div>

          {/* Botão de Envio */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={carregando}
            style={{ 
              padding: '12px', 
              fontSize: '15px', 
              cursor: carregando ? 'not-allowed' : 'pointer',
              backgroundColor: '#1a73e8',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              marginTop: '8px',
              transition: 'background-color 0.2s',
              boxShadow: '0 4px 10px rgba(26, 115, 232, 0.3)'
            }}
          >
            {carregando ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>

        {/* Links de navegação inferiores */}
        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid #333', paddingTop: '18px' }}>
          <div style={{ marginBottom: '12px' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setMostrandoCadastro(true); }} 
              style={{ color: '#1a73e8', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}
            >
              Criar nova conta de colaborador
            </a>
          </div>
          <a 
            href="#" 
            onClick={manipularEsqueciSenha} 
            style={{ color: '#aaa', textDecoration: 'none', fontSize: '13px' }}
          >
            Esqueci minha senha
          </a>
          <p style={{ fontSize: '11px', marginTop: '20px', color: '#666', margin: '20px 0 0 0', fontWeight: '500' }}>
            Versão 1.2 (Conectado ao Backend)
          </p>
        </div>

      </div>
    </div>
  );
}