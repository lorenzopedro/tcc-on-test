import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CadastroCoordenador = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    departamento: '',
    cargo: '',
    usuario: '',
    senha: '',
    confirmarSenha: ''
  });

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    if (erro) setErro('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem!');
      return;
    }

    if (!formData.usuario.trim()) {
      setErro('O campo de usuário é obrigatório!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/cadastro/coordenador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCompleto: formData.nome,
          email: formData.email,
          username: formData.usuario,
          departamento: formData.departamento,
          cargo: formData.cargo,
          senha: formData.senha,
          confirmacaoSenha: formData.confirmarSenha
        })
      });

      if (response.ok) {
        setSucesso(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        const errorData = await response.json();
        setErro(errorData.message || 'Erro no cadastro. Verifique os dados.');
      }
    } catch (error) {
      console.error('Erro:', error);
      setErro('Erro ao conectar com o servidor');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Cadastro de Coordenador</h2>
        
        {sucesso ? (
          <div style={styles.sucessoContainer}>
            <svg style={styles.sucessoIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
            <h3 style={styles.sucessoTitulo}>Cadastro realizado com sucesso!</h3>
            <p style={styles.sucessoTexto}>Você será redirecionado para a página de login em instantes...</p>
            <div style={styles.loader}></div>
          </div>
        ) : (
          <>
            {erro && <div style={styles.erro}>{erro}</div>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                style={styles.input}
                type="text"
                name="nome"
                placeholder="Nome completo"
                value={formData.nome}
                onChange={handleChange}
                required
              />

              <input
                style={styles.input}
                type="email"
                name="email"
                placeholder="E-mail institucional"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <select
                style={styles.select}
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o departamento</option>
                <option value="Computação">Computação</option>
                <option value="Engenharia">Engenharia</option>
                <option value="Matemática">Matemática</option>
              </select>

              <select
                style={styles.select}
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o cargo</option>
                <option value="Coordenador de Curso">Coordenador de Curso</option>
                <option value="Chefe de Departamento">Chefe de Departamento</option>
                <option value="Vice-Diretor">Vice-Diretor</option>
              </select>

              <input
                style={styles.input}
                type="text"
                name="usuario"
                placeholder="Nome de usuário"
                value={formData.usuario}
                onChange={handleChange}
                required
              />

              <input
                style={styles.input}
                type="password"
                name="senha"
                placeholder="Senha (mínimo 6 caracteres)"
                value={formData.senha}
                onChange={handleChange}
                minLength="6"
                required
              />

              <input
                style={styles.input}
                type="password"
                name="confirmarSenha"
                placeholder="Confirme sua senha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                minLength="6"
                required
              />

              <button type="submit" style={styles.button}>
                Cadastrar
              </button>
            </form>
          </>
        )}
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
    width: '100vw',
    background: 'linear-gradient(150deg, #cfd9df 0%, #e2ebf0 100%)',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0
  },
  container: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: '500px',
    margin: 0,
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
    textAlign: 'center',
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
    outline: 'none',
    transition: 'border 0.3s',
    ':focus': {
      borderColor: '#0056d2',
      boxShadow: '0 0 0 2px rgba(0, 86, 210, 0.2)'
    }
  },
  select: {
    padding: '12px 15px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#fff',
    outline: 'none',
    cursor: 'pointer',
    ':focus': {
      borderColor: '#0056d2',
      boxShadow: '0 0 0 2px rgba(0, 86, 210, 0.2)'
    }
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#0056d2',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.3s',
    marginTop: '10px',
    ':hover': {
      backgroundColor: '#003d82',
    }
  },
  erro: {
    color: '#d32f2f',
    backgroundColor: '#fde8e8',
    padding: '10px 15px',
    borderRadius: '6px',
    marginBottom: '15px',
    textAlign: 'center',
    fontSize: '14px',
  },
  sucessoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '20px',
  },
  sucessoIcon: {
    width: '60px',
    height: '60px',
    color: '#4caf50',
    marginBottom: '20px',
  },
  sucessoTitulo: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: '10px',
  },
  sucessoTexto: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '20px',
  },
  loader: {
    width: '50px',
    height: '5px',
    background: '#e0e0e0',
    borderRadius: '3px',
    position: 'relative',
    overflow: 'hidden',
    ':before': {
      content: '""',
      position: 'absolute',
      height: '100%',
      width: '50%',
      background: '#4caf50',
      animation: 'loading 1.5s infinite ease-in-out'
    }
  },
  '@keyframes loading': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(200%)' }
  }
};

export default CadastroCoordenador;