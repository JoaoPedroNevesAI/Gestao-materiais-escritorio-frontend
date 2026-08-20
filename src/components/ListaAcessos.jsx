import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { listarUsuarios } from '../services/api'; // Chamada real do backend

export default function ListaAcessos({ darkMode }) {

  const [email, setEmail] = useState('');
  const [usuarios, setUsuarios] = useState([]);

  // Carrega os usuários reais cadastrados no banco Spring Boot ao iniciar
  useEffect(() => {
    listarUsuarios()
      .then(dados => {
        // PENTE FINO: Mapeia garantindo a substituição de qualquer vestígio de cliente para Colaborador
        const usuariosMapeados = dados.map(user => {
          const ehAdmin = user.tipo === 'ADM' || user.role === 'ROLE_ADM';
          
          // Tratamento explícito da nomenclatura exigida
          let cargoExibicao = 'Colaborador';
          if (ehAdmin) {
            cargoExibicao = 'Administrador';
          }

          return {
            id: user.id,
            nome: user.nome || 'Usuário Sem Nome',
            online: ehAdmin, // Exemplo visual mantido: ADMs aparecem online
            cargo: cargoExibicao
          };
        });
        setUsuarios(usuariosMapeados);
      })
      .catch(err => {
        console.error("Erro ao carregar lista de acessos:", err);
      });
  }, []);

  // Estilos dinâmicos baseados no tema
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
      marginBottom: '18px', 
      textTransform: 'uppercase',
      fontWeight: 'bold',
      letterSpacing: '0.5px'
    }
  };

  const adicionarAcesso = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.info(`Convite enviado para ${email}. Aguardando aceitação do colaborador...`);
    setEmail('');
  };

  return (
    <aside className="sidebar-acessos" style={{ height: '100%', minWidth: '260px' }}>
      <div style={styles.container}>

        {/* Título */}
        <h4 style={{ 
          color: 'var(--primary-color, #1a73e8)', 
          marginBottom: '22px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          fontSize: '15px',
          fontWeight: '700'
        }}>
           👥 Gerenciamento de Acessos
        </h4>

        {/* Formulário */}
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
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '13px', 
              fontWeight: 'bold',
              backgroundColor: '#1a73e8',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#fff',
              boxShadow: '0 2px 6px rgba(26, 115, 232, 0.3)',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1557b0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#1a73e8'}
          >
            + Convidar Colaborador
          </button>
        </form>

        {/* Lista de usuários vindos do Java */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={styles.labelLista}>
            Integrantes do Sistema ({usuarios.length})
          </li>

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
                {/* Indicador de Status */}
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

              {/* Badge Dinâmica de Cargo (Blindando contra o nome Cliente) */}
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
      </div>
    </aside>
  );
}