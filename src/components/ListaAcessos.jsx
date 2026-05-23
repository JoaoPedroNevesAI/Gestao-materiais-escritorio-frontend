import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { listarUsuarios } from '../services/api'; // Importando a chamada real do backend

export default function ListaAcessos({ darkMode }) {

  const [email, setEmail] = useState('');
  const [usuarios, setUsuarios] = useState([]);

  // Carrega os usuários reais cadastrados no banco Spring Boot ao iniciar
  useEffect(() => {
    listarUsuarios()
      .then(dados => {
        // Mapeia os dados do Java e atribui um status visual dinâmico baseado na Role
        const usuariosMapeados = dados.map(user => ({
          id: user.id,
          nome: user.nome,
          online: user.tipo === 'ADM' || user.role === 'ROLE_ADM' // Exemplo visual: ADMs aparecem online
        }));
        setUsuarios(usuariosMapeados);
      })
      .catch(err => {
        console.error("Erro ao carregar lista de acessos:", err);
      });
  }, []);

  // Estilos dinâmicos baseados no tema (Mantive seu design perfeito)
  const styles = {
    container: {
      padding: '20px', 
      borderLeft: `1px solid ${darkMode ? '#333' : '#ddd'}`, 
      height: '100%', 
      backgroundColor: darkMode ? '#1e1e1e' : '#fff',
      color: darkMode ? '#e0e0e0' : '#333',
      transition: 'all 0.2s'
    },
    input: {
      width: '100%', 
      fontSize: '13px', 
      marginBottom: '10px',
      padding: '8px',
      borderRadius: '4px',
      border: `1px solid ${darkMode ? '#444' : '#ccc'}`,
      backgroundColor: darkMode ? '#2d2d2d' : '#fff',
      color: darkMode ? '#fff' : '#000'
    },
    labelLista: {
      fontSize: '11px', 
      color: darkMode ? '#888' : '#666', 
      marginBottom: '15px', 
      textTransform: 'uppercase',
      fontWeight: 'bold',
      letterSpacing: '0.5px'
    }
  };

  const adicionarAcesso = (e) => {
    e.preventDefault();
    if (!email) return;
    // Feedback de convite simulando as futuras integrações por e-mail institucional
    toast.info(`Convite enviado para ${email}. Aguardando aceitação...`);
    setEmail('');
  };

  return (
    <aside className="sidebar-acessos" style={{ height: '100%' }}>
      <div style={styles.container}>

        {/* Título */}
        <h4 style={{ 
          color: '#1a73e8', 
          marginBottom: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          fontSize: '16px'
        }}>
           👥 Usuários / Contatos
        </h4>

        {/* Formulário */}
        <form onSubmit={adicionarAcesso} style={{ marginBottom: '25px' }}>
          <input 
            type="email" 
            placeholder="Convidar novo e-mail..." 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              padding: '8px', 
              fontSize: '14px', 
              fontWeight: 'bold',
              backgroundColor: '#1a73e8',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            + Convidar
          </button>
        </form>

        {/* Lista de usuários vindos do Java */}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={styles.labelLista}>
            Integrantes do Sistema ({usuarios.length})
          </li>

          {usuarios.map(user => (
            <li 
              key={user.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '15px' 
              }}
            >
              {/* Bolinha de status estilo LoL */}
              <div style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                backgroundColor: user.online ? '#2ecc71' : '#bdc3c7',
                border: `2px solid ${darkMode ? '#1e1e1e' : '#fff'}`,
                boxShadow: '0 0 3px rgba(0,0,0,0.3)'
              }} />

              {/* Nome do usuário real */}
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '500',
                color: darkMode ? '#e0e0e0' : '#333'
              }}>
                {user.nome}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}