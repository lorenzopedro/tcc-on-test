// tcc-on-frontend/src/components/cadastro/RedefinirSenha.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const RedefinirSenha = () => {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem!');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/redefinir-senha/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha, confirmarSenha }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem(data.message);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setErro(data.message || 'Erro ao redefinir a senha.');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      setErro('Não foi possível conectar ao servidor.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Redefinir Senha</h2>
        {mensagem && <div style={styles.sucesso}>{mensagem}</div>}
        {erro && <div style={styles.erro}>{erro}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <p style={styles.instructions}>
            Digite sua nova senha.
          </p>
          <input
            type="password"
            placeholder="Nova senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Confirme a nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>Redefinir Senha</button>
        </form>
      </div>
    </div>
  );
};

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

export default RedefinirSenha;