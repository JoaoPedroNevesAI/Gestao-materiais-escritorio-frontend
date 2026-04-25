// Importa hook para estado
import { useState } from 'react';

// Biblioteca de notificações
import { toast } from 'react-toastify';

// Componente de lista de acessos / contatos
export default function ListaAcessos() {

  // Estado do input (email digitado)
  const [email, setEmail] = useState('');

  // Estado com lista de usuários (mockado/fake por enquanto)
  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: 'João Backend', online: true },
    { id: 2, nome: 'Maria Supervisor', online: false },
  ]);

  // Função ao enviar formulário
  const adicionarAcesso = (e) => {
    e.preventDefault(); // evita reload da página

    // Se não digitou nada, não faz nada
    if (!email) return;
    
    // Mostra mensagem (simulando envio de convite)
    toast.info(`Convite enviado para ${email}. Aguardando integração...`);

    // Limpa input
    setEmail('');
  };

  return (
    // Sidebar lateral
    <aside className="sidebar-acessos">
      
      <div style={{ 
        padding: '20px', 
        borderLeft: '1px solid #ddd', 
        height: '100%', 
        backgroundColor: '#fff' 
      }}>

        {/* Título */}
        <h4 style={{ 
          color: '#1a73e8', 
          marginBottom: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px' 
        }}>
           👥 Contatos / Acessos
        </h4>

        {/* Formulário de adicionar acesso */}
        <form onSubmit={adicionarAcesso} style={{ marginBottom: '20px' }}>
          
          <input 
            type="email" 
            placeholder="E-mail do novo visualizador" 
            value={email} // input controlado
            onChange={(e) => setEmail(e.target.value)} // atualiza estado
            style={{ width: '100%', fontSize: '13px', marginBottom: '10px' }}
          />

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '5px' }}
          >
            + Adicionar
          </button>
        </form>

        {/* Lista de usuários */}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          
          {/* Título da lista */}
          <li style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginBottom: '10px', 
            textTransform: 'uppercase' 
          }}>
            Amigos (Visualizadores)
          </li>

          {/* Renderiza cada usuário */}
          {usuarios.map(user => (
            <li 
              key={user.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                marginBottom: '12px' 
              }}
            >

              {/* Bolinha de status (online/offline) */}
              <div style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                backgroundColor: user.online ? '#2ecc71' : '#bdc3c7',
                border: '1px solid #fff',
                boxShadow: '0 0 2px rgba(0,0,0,0.2)'
              }} />

              {/* Nome do usuário */}
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {user.nome}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}