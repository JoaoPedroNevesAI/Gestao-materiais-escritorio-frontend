import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ListaAcessos({ darkMode }) { // Recebe a prop aqui

  const [email, setEmail] = useState('');
  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: 'João Backend', online: true },
    { id: 2, nome: 'Maria Supervisor', online: false },
  ]);

  // Estilos dinâmicos baseados no tema
  const styles = {
    container: {
      padding: '20px', 
      borderLeft: `1px solid ${darkMode ? '#333' : '#ddd'}`, 
      height: '100%', 
      backgroundColor: darkMode ? '#1e1e1e' : '#fff', // Corrigido!
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
    toast.info(`Convite enviado para ${email}. Aguardando integração...`);
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
           👥 Contatos / Acessos
        </h4>

        {/* Formulário */}
        <form onSubmit={adicionarAcesso} style={{ marginBottom: '25px' }}>
          <input 
            type="email" 
            placeholder="E-mail do novo visualizador" 
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
            + Adicionar
          </button>
        </form>

        {/* Lista de usuários */}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={styles.labelLista}>
            Amigos (Visualizadores)
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
              {/* Bolinha de status */}
              <div style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                backgroundColor: user.online ? '#2ecc71' : '#bdc3c7',
                border: `2px solid ${darkMode ? '#1e1e1e' : '#fff'}`,
                boxShadow: '0 0 3px rgba(0,0,0,0.3)'
              }} />

              {/* Nome do usuário */}
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