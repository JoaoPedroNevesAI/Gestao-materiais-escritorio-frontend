import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function CadastroUsuario({ aoFinalizar }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const fd = new FormData(e.target);
    const dadosForm = Object.fromEntries(fd);

    const novoUsuario = {
      nome: dadosForm.nome,
      email: dadosForm.email,
      senha: dadosForm.senha,
      tipo: dadosForm.tipo 
    };

    try {
      const response = await fetch('http://localhost:8080/api/usuarios', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUsuario),
      });

      if (response.ok) {
        toast.success("Usuário criado com sucesso!");
        if (aoFinalizar) aoFinalizar(); 
      } else {
        toast.error("Erro ao cadastrar: Verifique os dados ou se o e-mail já existe.");
      }
    } catch (error) {
      toast.error("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      minHeight: '80vh', backgroundColor: 'var(--bg-color)' 
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>👤 Novo Usuário</h2>
          <p style={{ color: '#5f6368' }}>Crie uma conta para acessar o sistema</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
          <div style={{ display: 'grid', gap: '5px' }}>
            <label style={{ fontWeight: '500' }}>Nome Completo</label>
            <input name="nome" type="text" placeholder="Ex: João Silva" required />
          </div>

          <div style={{ display: 'grid', gap: '5px' }}>
            <label style={{ fontWeight: '500' }}>E-mail Institucional</label>
            <input name="email" type="email" placeholder="email@ifes.edu.br" required />
          </div>

          <div style={{ display: 'grid', gap: '5px' }}>
            <label style={{ fontWeight: '500' }}>Senha</label>
            <input name="senha" type="password" placeholder="Crie uma senha forte" required />
          </div>

          <div style={{ display: 'grid', gap: '5px' }}>
            <label style={{ fontWeight: '500' }}>Tipo de Acesso</label>
            <select name="tipo" required>
              <option value="">Selecione o cargo...</option>
              <option value="ADMINISTRADOR">Administrador (Total)</option>
              <option value="OPERADOR">Operador (Cadastro)</option>
              <option value="VISUALIZADOR">Visualizador (Apenas consulta)</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ padding: '12px', marginTop: '10px' }}
          >
            {loading ? "Processando..." : "Finalizar Cadastro"}
          </button>
          
          <button 
            type="button" 
            onClick={aoFinalizar}
            className="btn" 
            style={{ backgroundColor: 'transparent', color: '#5f6368' }}
          >
            Voltar para o Login
          </button>
        </form>
      </div>
    </div>
  );
}