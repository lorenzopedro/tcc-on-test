// tcc-on-frontend/src/components/cadastro/EsqueciSenha.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EsqueciSenha = () => {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (!email) {
      setErro('Por favor, informe seu e-mail.');
      return;
    }

    try {
      // Endpoint que você criará no backend
      const response = await fetch('http://localhost:5000/esqueci-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem(data.message);
      } else {
        setErro(data.message || 'Erro ao processar a solicitação.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      setErro('Não foi possível conectar ao servidor.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Recuperar Senha</h2>
        {mensagem && <div style={styles.sucesso}>{mensagem}</div>}
        {erro && <div style={styles.erro}>{erro}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <p style={styles.instructions}>
            Insira seu e-mail de cadastro para receber as instruções de recuperação de senha.
          </p>
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>Enviar</button>
          <p
            style={styles.loginLink}
            onClick={() => navigate('/login')}
          >
            Lembrou a senha? <span style={styles.link}>Faça login</span>
          </p>
        </form>
      </div>
    </div>
  );
};

// Estilos (similares aos de outros formulários)
const styles = {
    page: {
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(150deg, #cfd9df 0%, #e2ebf0 100%)',
    },
    container: {
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#333',
    },
    instructions: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '20px',
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
    },
    button: {
        padding: '12px',
        fontSize: '16px',
        backgroundColor: '#0056d2',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
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
    },
    sucesso: {
        color: '#155724',
        backgroundColor: '#d4edda',
        padding: '10px 15px',
        borderRadius: '6px',
    }
};

export default EsqueciSenha;