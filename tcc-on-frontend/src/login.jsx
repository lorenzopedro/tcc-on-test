import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!usuario || !senha) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usuario,
          password: senha,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Salva o token e os dados do usuário no localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redireciona com base no tipo de usuário
        switch (data.user.tipo) {
          case 'aluno':
            navigate('/dashboard-aluno');
            break;
          case 'orientador':
            navigate('/dashboard-orientador');
            break;
          case 'coordenador':
            navigate('/dashboard-coordenador');
            break;
          case 'supervisor':
            navigate('/dashboard-supervisor');
            break;
          default:
            navigate('/login'); // Rota padrão
        }
      } else {
        setErro(data.message || 'Falha no login.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      setErro('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.siteTitle}>TCC ON</h2>
        <br />
        {erro && <div style={styles.erro}>{erro}</div>}
        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <input
            type="text"
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>Entrar</button>
          <p
            style={styles.loginLink}
            onClick={() => navigate('/selecionar-tipo')} 
          >
            Não possui cadastro? <span style={styles.link}>Cadastre-se</span>
          </p>
        </form>
      </div>
    </div>
  );
};

// Mantenha os estilos existentes, mas adicione o estilo para erro
const styles = {
  page: {
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    margin: 0,
    padding: 0,
    background: 'linear-gradient(150deg, #cfd9df 0%, #e2ebf0 100%)',
    overflow: 'hidden',
  },
  container: {
    backgroundColor: '#fff',
    padding: '50px 30px',
    borderRadius: '12px',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: '360px',
    textAlign: 'center',
  },
  siteTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '12px 15px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#fff',
    color: '#333',
    outline: 'none',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#0056d2',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  loginLink: {
    marginTop: '15px',
    fontSize: '14px',
    color: '#666',
    cursor: 'pointer'
  },
  link: {
    color: '#0056d2', 
    textDecoration: 'underline'
  },
  erro: {
    color: '#d32f2f',
    backgroundColor: '#fde8e8',
    padding: '10px 15px',
    borderRadius: '6px',
    marginBottom: '15px',
    textAlign: 'center',
    fontSize: '14px',
  }
};

export default Login;