import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ListaAcessos() {
  const [email, setEmail] = useState('');
  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: 'João Backend', online: true },
    { id: 2, nome: 'Maria Supervisor', online: false },
  ]);

  const adicionarAcesso = (e) => {
    e.preventDefault();
    if (!email) return;
    
    toast.info(`Convite enviado para ${email}. Aguardando integração...`);
    setEmail('');
  };

  return (
    <aside className="sidebar-acessos">
      <div style={{ padding: '20px', borderLeft: '1px solid #ddd', height: '100%', backgroundColor: '#fff' }}>
        <h4 style={{ color: '#1a73e8', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
           👥 Contatos / Acessos
        </h4>

        <form onSubmit={adicionarAcesso} style={{ marginBottom: '20px' }}>
          <input 
            type="email" 
            placeholder="E-mail do novo visualizador" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', fontSize: '13px', marginBottom: '10px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '5px' }}>
            + Adicionar
          </button>
        </form>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ fontSize: '12px', color: '#666', marginBottom: '10px', textTransform: 'uppercase' }}>
            Amigos (Visualizadores)
          </li>
          {usuarios.map(user => (
            <li key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ 
                width: '10px', height: '10px', borderRadius: '50%', 
                backgroundColor: user.online ? '#2ecc71' : '#bdc3c7',
                border: '1px solid #fff',
                boxShadow: '0 0 2px rgba(0,0,0,0.2)'
              }} />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{user.nome}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}