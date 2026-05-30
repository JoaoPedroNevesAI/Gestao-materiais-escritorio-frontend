import { useState } from 'react';
import { toast } from 'react-toastify';
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

      console.log("DADOS LOGIN:", dados);

      localStorage.setItem('token', dados.token);

      aoLogar({
        token: dados.token,
        nome: dados.nome,
        role: dados.role
      });

      toast.success("Login realizado com sucesso!");

    } catch (error) {

      console.error("Erro na autenticação:", error);

      if (
        error.response &&
        (error.response.status === 401 ||
         error.response.status === 403)
      ) {
        toast.error("Credenciais inválidas.");
      } else {
        toast.error("Erro ao conectar com o servidor.");
      }

    } finally {
      setCarregando(false);
    }
  };

  const manipularEsqueciSenha = (e) => {
    e.preventDefault();
    toast.info(
      "🔒 Serviço de recuperação indisponível: contate o suporte de TI local."
    );
  };

  if (mostrandoCadastro) {
    return (
      <CadastroUsuario
        aoFinalizar={() => setMostrandoCadastro(false)}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '30px'
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: '25px'
          }}
        >
          <h2
            style={{
              color: '#1a73e8',
              margin: 0
            }}
          >
            🏛️ Patrimônio Web
          </h2>

          <p
            style={{
              color: '#5f6368',
              marginTop: '5px'
            }}
          >
            Sistema de Gerenciamento de Bens
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gap: '20px'
          }}
        >
          <div
            style={{
              display: 'grid',
              gap: '8px'
            }}
          >
            <label>E-mail institucional</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@ifes.com"
              required
            />
          </div>

          <div
            style={{
              display: 'grid',
              gap: '8px'
            }}
          >
            <label>Senha</label>

            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={carregando}
            style={{
              padding: '12px',
              fontSize: '16px'
            }}
          >
            {carregando
              ? 'Autenticando...'
              : 'Entrar no Sistema'}
          </button>
        </form>

        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            borderTop: '1px solid #dadce0',
            paddingTop: '15px'
          }}
        >
          <div style={{ marginBottom: '10px' }}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setMostrandoCadastro(true);
              }}
            >
              Criar nova conta de usuário
            </a>
          </div>

          <a
            href="#"
            onClick={manipularEsqueciSenha}
          >
            Esqueci minha senha
          </a>

          <p
            style={{
              fontSize: '12px',
              marginTop: '10px'
            }}
          >
            Versão 1.0 (Conectado ao Backend)
          </p>
        </div>
      </div>
    </div>
  );
}