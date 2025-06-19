import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SelecionarTipo = () => {
  const [tipoUsuario, setTipoUsuario] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tipoUsuario) {
      navigate(`/cadastro/${tipoUsuario}`);
    }
  };

  const tiposUsuario = [
    { id: 1, tipo: 'aluno', label: 'Aluno' },
    { id: 2, tipo: 'orientador', label: 'Orientador' },
    { id: 3, tipo: 'coordenador', label: 'Coordenador' },
    { id: 4, tipo: 'supervisor', label: 'Supervisor' }
  ];
  

  {tiposUsuario.map((item) => (
    <label key={item.id}>
      <input
        type="radio"
        name="tipoUsuario"
        value={item.tipo}
        checked={tipoUsuario === item.tipo}
        onChange={() => setTipoUsuario(item.tipo)}
      />
      {item.label}
    </label>
  ))}

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.siteTitle}>TCC ON - Cadastro</h2>
        <p style={styles.subtitle}>Selecione seu tipo de usuário</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.radioGroup}>
            {['aluno', 'orientador', 'coordenador', 'supervisor'].map((tipo) => (
              <label key={tipo} style={styles.radioLabel}>
                <input
                  type="radio"
                  name="tipoUsuario"
                  value={tipo}
                  checked={tipoUsuario === tipo}
                  onChange={() => setTipoUsuario(tipo)}
                  style={styles.radioInput}
                  required
                />
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </label>
            ))}
          </div>
          
          <button type="submit" style={styles.button}>
            Continuar
          </button>

          <p style={styles.loginLink}>
            Já possui conta? <span style={styles.link} onClick={() => navigate('/')}>Faça login</span>
          </p>
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
    padding: '40px 30px',
    borderRadius: '12px',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  siteTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '10px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    padding: '12px 15px',
    borderRadius: '6px',
    backgroundColor: '#f5f5f5',
    transition: 'background 0.2s',
  },
  radioInput: {
    accentColor: '#0056d2',
    transform: 'scale(1.2)',
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
    '&:hover': {
      backgroundColor: '#003d82'
    }
  },
  loginLink: {
    marginTop: '15px',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#0056d2',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default SelecionarTipo;