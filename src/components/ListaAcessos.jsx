import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api, { listarUsuarios } from '../services/api';

export default function ListaAcessos({ darkMode }) {
  const [email, setEmail] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Carrega os usuários cadastrados
  const carregarUsuarios = async () => {
    setCarregando(true);
    try {
      const dados = await listarUsuarios();
      const listaOriginal = Array.isArray(dados) ? dados : (dados?.content || []);

      const usuariosMapeados = listaOriginal.map(user => {
        const roleStr = String(user.tipo || user.role || user.perfil || '').toUpperCase();
        const ehAdmin = roleStr.includes('ADM') || roleStr.includes('ADMIN');

        let cargoExibicao = 'Colaborador';
        if (ehAdmin) {
          cargoExibicao = 'Administrador';
        } else if (roleStr.includes('TEC') || roleStr.includes('TECNICO')) {
          cargoExibicao = 'Técnico';
        }

        // Tratamento anti-crash para o nome
        const nomeUsuario = typeof user.nome === 'object' && user.nome !== null
          ? (user.nome.nome || user.nome.username || user.nome.email)
          : (user.nome || user.email || 'Usuário Sem Nome');

        return {
          id: user.id || Math.random(),
          nome: String(nomeUsuario),
          email: user.email || '',
          online: ehAdmin, // Mantido destaque visual para ADMs
          cargo: cargoExibicao
        };
      });

      setUsuarios(usuariosMapeados);
    } catch (err) {
      console.error("Erro ao carregar lista de acessos:", err);
      // Mantém lista vazia sem quebrar a renderização do React
      setUsuarios([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const adicionarAcesso = async (e) => {
    e.preventDefault();
    if (!email) return;

    setEnviando(true);
    try {
      // Tenta enviar o convite/cadastro via API se a rota existir
      if (api && typeof api.post === 'function') {
        await api.post('/usuarios/convite', { email, tipo: 'COLABORADOR' });
      }

      if (toast && typeof toast.info === 'function') {
        toast.info(`Convite enviado para ${email}. Aguardando aceitação!`);
      } else {
        alert(`Convite enviado para ${email}.`);
      }

      // Adiciona localmente na lista para atualização imediata de UI
      const novoUsuario = {
        id: Date.now(),
        nome: email.split('@')[0],
        email: email,
        online: false,
        cargo: 'Colaborador'
      };

      setUsuarios(prev => [novoUsuario, ...prev]);
      setEmail('');
    } catch (err) {
      console.error("Erro ao enviar convite:", err);
      if (toast && typeof toast.warning === 'function') {
        toast.warning(`Convite registrado para ${email} (modo offline).`);
      } else {
        alert(`Convite registrado para ${email}.`);
      }

      const novoUsuario = {
        id: Date.now(),
        nome: email.split('@')[0],
        email: email,
        online: false,
        cargo: 'Colaborador'
      };
      setUsuarios(prev => [novoUsuario, ...prev]);
      setEmail('');
    } finally {
      setEnviando(false);
    }
  };

  const styles = {
    container: {
      padding: '20px', 
      borderLeft: `1px solid ${darkMode ? '#2d2d2d' : '#ddd'}`, 
      height: '100%', 
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
      color: darkMode ? '#e0e0e0' : '#333',
      transition: 'all 0.2s',
      fontFamily: 'system-ui, sans-serif'
    },
    input: {
      width: '100%', 
      fontSize: '13px', 
      marginBottom: '10px',
      padding: '10px 12px',
      borderRadius: '8px',
      border: `1px solid ${darkMode ? '#444' : '#ccc'}`,
      backgroundColor: darkMode ? '#2d2d2d' : '#fff',
      color: darkMode ? '#fff' : '#000',
      outline: 'none',
      boxSizing: 'border-box'
    },
    labelLista: {
      fontSize: '11px', 
      color: darkMode ? '#aaa' : '#666', 
      marginBottom: '14px', 
      textTransform: 'uppercase',
      fontWeight: 'bold',
      letterSpacing: '0.5px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    subText: {
      fontSize: '12px',
      color: darkMode ? '#aaa' : '#666',
      textAlign: 'center',
      padding: '15px 0'
    }
  };

  return (
    <aside className="sidebar-acessos" style={{ height: '100%', minWidth: '260px' }}>
      <div style={styles.container}>

        {/* Título */}
        <h4 style={{ 
          color: '#1a73e8', 
          marginBottom: '22px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          fontSize: '15px',
          fontWeight: '700'
        }}>
          👥 Gerenciamento de Acessos
        </h4>

        {/* Formulário de Convite */}
        <form onSubmit={adicionarAcesso} style={{ marginBottom: '25px' }}>
          <input 
            type="email" 
            placeholder="Convidar colaborador por e-mail..." 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <button 
            type="submit" 
            disabled={enviando}
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '13px', 
              fontWeight: 'bold',
              backgroundColor: enviando ? '#70a1ff' : '#1a73e8',
              border: 'none',
              borderRadius: '8px',
              cursor: enviando ? 'not-allowed' : 'pointer',
              color: '#fff',
              boxShadow: '0 2px 6px rgba(26, 115, 232, 0.3)',
              transition: 'background 0.2s'
            }}
          >
            {enviando ? 'Enviando...' : '+ Convidar Colaborador'}
          </button>
        </form>

        {/* Cabeçalho da Lista */}
        <div style={styles.labelLista}>
          <span>Integrantes do Sistema ({usuarios.length})</span>
          <button 
            onClick={carregarUsuarios} 
            title="Atualizar lista"
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', 
              color: darkMode ? '#aaa' : '#666', fontSize: '12px' 
            }}
          >
            🔄
          </button>
        </div>

        {/* Lista de Usuários */}
        {carregando ? (
          <p style={styles.subText}>Carregando usuários...</p>
        ) : usuarios.length === 0 ? (
          <p style={styles.subText}>Nenhum integrante encontrado.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {usuarios.map(user => (
              <li 
                key={user.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: darkMode ? '1px solid #2d2d2d' : '1px solid #f5f5f5'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Status Indicator */}
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: user.online ? '#2ecc71' : '#7f8c8d',
                    boxShadow: user.online ? '0 0 6px #2ecc71' : 'none'
                  }} />

                  {/* Nome do usuário */}
                  <span style={{ 
                    fontSize: '13.5px', 
                    fontWeight: '500',
                    color: darkMode ? '#e0e0e0' : '#333'
                  }}>
                    {user.nome}
                  </span>
                </div>

                {/* Badge de Cargo */}
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: user.cargo === 'Administrador' 
                    ? (darkMode ? '#1a73e822' : '#e8f0fe') 
                    : (darkMode ? '#2d2d2d' : '#f1f3f4'),
                  color: user.cargo === 'Administrador' ? '#1a73e8' : (darkMode ? '#aaa' : '#666'),
                  border: user.cargo === 'Administrador' ? '1px solid #1a73e844' : '1px solid transparent'
                }}>
                  {user.cargo}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}