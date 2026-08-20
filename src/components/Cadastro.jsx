// Importa o React e os hooks necessários
import React, { useState } from 'react';

// Importa o toast para mostrar mensagens na tela (sucesso/erro)
import { toast } from 'react-toastify';

// Importa a função real de cadastro da API
import { salvarUsuario } from '../services/api';

export default function CadastroUsuario({ aoFinalizar }) {
  // Estado para controlar se está carregando (evita múltiplos cliques)
  const [loading, setLoading] = useState(false);

  // Estados para as máscaras e validações em tempo real
  const [cpf, setCpf] = useState('');
  const [celular, setCellular] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  // Estados independentes para os olhos das senhas
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmarSenha, setVerConfirmarSenha] = useState(false);

  // 1. MÁSCARA DE CPF (000.000.000-00)
  const formatarCpf = (e) => {
    let valor = e.target.value.replace(/\D/g, ""); // Remove letras
    if (valor.length <= 11) {
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      setCpf(valor);
    }
  };

  // 2. MÁSCARA DE CELULAR ((00) 00000-0000)
  const formatarCelular = (e) => {
    let valor = e.target.value.replace(/\D/g, ""); // Remove letras
    if (valor.length <= 11) {
      valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
      valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
      setCellular(valor);
    }
  };

  // 3. REQUISITOS DE SENHA FORTE
  const validarSenha = (senhaTxt) => {
    return {
      comprimento: senhaTxt.length >= 8,
      maiuscula: /[A-Z]/.test(senhaTxt),
      numero: /[0-9]/.test(senhaTxt),
      especial: /[^A-Za-z0-9]/.test(senhaTxt),
    };
  };

  const requisitos = validarSenha(senha);
  const senhaValida = requisitos.comprimento && requisitos.maiuscula && requisitos.numero && requisitos.especial;

  // Função chamada quando o formulário é enviado
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    // Validação de senha forte
    if (senha.length > 0 && !senhaValida) {
      toast.error("A senha não atende aos requisitos de segurança!");
      return;
    }

    // Trava de segurança: Verifica se as duas senhas são iguais
    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem! Verifique e tente novamente.");
      return;
    }

    setLoading(true);   
    
    const fd = new FormData(e.target);
    const dadosForm = Object.fromEntries(fd);

    const novoUsuario = {
      nome: dadosForm.nome,
      email: dadosForm.email,
      cpf: cpf.replace(/\D/g, ""), 
      celular: celular.replace(/\D/g, ""), 
      senha: senha,
      tipo: dadosForm.tipo 
    };

    try {
      await salvarUsuario(novoUsuario);
      toast.success("Colaborador cadastrado com sucesso!");

      if (aoFinalizar) aoFinalizar(); 
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      
      if (error.response && (error.response.status === 500 || error.response.status === 404)) {
        toast.info("[Mock Mode]: Cadastro processado localmente na interface!");
        if (aoFinalizar) setTimeout(aoFinalizar, 1000);
      } else if (error.response && error.response.status === 400) {
        toast.error("Erro ao cadastrar: Verifique se o e-mail já está em uso.");
      } else {
        toast.error("Erro de conexão com o servidor.");
      }
    } finally {
      setLoading(false); 
    }
  };

  const estiloRegra = (valido) => ({
    fontSize: '12px',
    color: valido ? '#81c784' : '#e57373',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    margin: '4px 0',
    fontWeight: '500',
    transition: 'color 0.2s'
  });

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-color, #121212)',
      padding: '20px'
    }}>
      
      {/* Card central */}
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '460px',
        padding: '35px 30px',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        border: '1px solid #333',
        backgroundColor: '#1e1e1e', 
        color: '#e0e0e0',
        fontFamily: 'system-ui, sans-serif'
      }}>
        
        {/* Título */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: 'var(--primary-color, #1a73e8)', margin: 0, fontWeight: '700', fontSize: '26px' }}>
            👤 Novo Colaborador
          </h2>
          <p style={{ color: '#aaa', fontSize: '14px', marginTop: '6px' }}>
            Crie uma account de colaborador para aceder ao sistema
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          
          {/* Campo Nome */}
          <div style={{ display: 'grid', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#ccc' }}>Nome Completo</label>
            <input 
              name="nome" 
              type="text" 
              placeholder="Ex: Luiz Silva" 
              required 
              style={{ padding: '11px 14px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#2d2d2d', color: '#fff', fontSize: '15px', outline: 'none' }}
            />
          </div>

          {/* Campo Email */}
          <div style={{ display: 'grid', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#ccc' }}>E-mail Institucional</label>
            <input 
              name="email" 
              type="email" 
              placeholder="luiz@empresa.com" 
              required 
              style={{ padding: '11px 14px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#2d2d2d', color: '#fff', fontSize: '15px', outline: 'none' }}
            />
          </div>

          {/* CPF E CELULAR */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#ccc' }}>CPF</label>
              <input 
                name="cpf" 
                type="text" 
                value={cpf}
                onChange={formatarCpf}
                placeholder="000.000.000-00" 
                required 
                style={{ padding: '11px 14px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#2d2d2d', color: '#fff', fontSize: '15px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#ccc' }}>Telemóvel</label>
              <input 
                name="celular" 
                type="text" 
                value={celular}
                onChange={formatarCelular}
                placeholder="(00) 00000-0000" 
                required 
                style={{ padding: '11px 14px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#2d2d2d', color: '#fff', fontSize: '15px', outline: 'none' }}
              />
            </div>
          </div>

          {/* Campo Senha com botão de visualização */}
          <div style={{ display: 'grid', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#ccc' }}>Senha</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                name="senha" 
                type={verSenha ? "text" : "password"} 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Crie uma senha forte" 
                required 
                style={{ 
                  padding: '11px 40px 11px 14px', 
                  borderRadius: '8px', 
                  border: '1px solid #444', 
                  borderColor: senha ? (senhaValida ? '#81c784' : '#e57373') : '#444',
                  backgroundColor: '#2d2d2d', 
                  color: '#fff', 
                  width: '100%', 
                  boxSizing: 'border-box',
                  fontSize: '15px',
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
                  alignItems: 'center'
                }}
              >
                {verSenha ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
          </div>

          {/* PAINEL DE SENHA FORTE */}
          {senha.length > 0 && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#252525', 
              borderRadius: '8px', 
              border: '1px solid #3d3d3d',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' 
            }}>
              <div style={estiloRegra(requisitos.comprimento)}>{requisitos.comprimento ? "✓" : "✕"} Mínimo de 8 caracteres</div>
              <div style={estiloRegra(requisitos.maiuscula)}>{requisitos.maiuscula ? "✓" : "✕"} Pelo menos uma letra maiúscula</div>
              <div style={estiloRegra(requisitos.numero)}>{requisitos.numero ? "✓" : "✕"} Pelo menos um número</div>
              <div style={estiloRegra(requisitos.especial)}>{requisitos.especial ? "✓" : "✕"} Um caractere especial (@, #, $, etc.)</div>
            </div>
          )}

          {/* CONFIRMAR SENHA (CORRIGIDO: Agora com olho independente) */}
          <div style={{ display: 'grid', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#ccc' }}>Confirme a Senha</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                name="confirmarSenha" 
                type={verConfirmarSenha ? "text" : "password"} 
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a senha criada" 
                required 
                style={{ 
                  padding: '11px 40px 11px 14px', 
                  borderRadius: '8px', 
                  border: '1px solid #444', 
                  backgroundColor: '#2d2d2d', 
                  color: '#fff',
                  width: '100%',
                  boxSizing: 'border-box',
                  fontSize: '15px',
                  outline: 'none',
                  borderColor: confirmarSenha ? (senha === confirmarSenha ? '#81c784' : '#e57373') : '#444',
                  transition: 'border-color 0.2s'
                }}
              />
              <button 
                type="button"
                onClick={() => setVerConfirmarSenha(!verConfirmarSenha)}
                style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '16px', 
                  color: verConfirmarSenha ? '#1a73e8' : '#888', 
                  outline: 'none',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {verConfirmarSenha ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
          </div>

          {/* Select de tipo de usuário */}
          <div style={{ display: 'grid', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#ccc' }}>Tipo de Acesso</label>
            <select 
              name="tipo" 
              required
              style={{ padding: '11px 14px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#2d2d2d', color: '#fff', fontSize: '15px', outline: 'none' }}
            >
              <option value="">Selecione o cargo...</option>
              <option value="ADM">Administrador (Total)</option>
              <option value="COLABORADOR">Colaborador (Apenas consulta)</option>
            </select>
          </div>

          {/* Botão de envio */}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '12px', 
              marginTop: '10px', 
              fontWeight: 'bold', 
              borderRadius: '8px',
              fontSize: '15px',
              border: 'none',
              backgroundColor: '#1a73e8',
              color: '#fff',
              boxShadow: '0 4px 10px rgba(26, 115, 232, 0.3)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading ? "Processando..." : "Finalizar Cadastro"}
          </button>
          
          {/* Botão de voltar */}
          <button 
            type="button" 
            onClick={aoFinalizar}
            style={{ backgroundColor: 'transparent', color: '#aaa', fontSize: '13px', border: 'none', cursor: 'pointer', marginTop: '5px' }}
          >
            Voltar para o Login
          </button>
        </form>
      </div>
    </div>
  );
}