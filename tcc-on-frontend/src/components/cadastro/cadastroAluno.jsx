import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CadastroAluno = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    matricula: '',
    curso: '',
    usuario: '',
    senha: '',
    confirmarSenha: ''
  });

  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    if (erro && (e.target.name === 'confirmarSenha' || e.target.name === 'usuario')) {
      setErro('');
    }
  };

  // tcc-on-frontend/src/components/cadastro/cadastroAluno.jsx

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
      const response = await fetch('http://localhost:5000/cadastro/aluno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Ajustes aqui para corresponder ao backend
          nomeCompleto: formData.nome,
          email: formData.email,
          username: formData.usuario,
          matricula: formData.matricula,
          curso: formData.curso,
          senha: formData.senha,
          confirmacaoSenha: formData.confirmarSenha
        })
      });
      
      if (response.ok) {
        alert('Aluno cadastrado com sucesso! Você será redirecionado para o login.');
        navigate('/login');
      } else {
        const errorData = await response.json();
        setErro(errorData.message || 'Erro no cadastro');
      }
    } catch (error) {
      console.error('Erro:', error);
      setErro('Erro ao conectar com o servidor');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Cadastro de Aluno</h2>
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
          <input
            style={styles.input}
            type="text"
            name="matricula"
            placeholder="Matrícula"
            value={formData.matricula}
            onChange={handleChange}
            required
          />
          <select
            style={styles.select}
            name="curso"
            value={formData.curso}
            onChange={handleChange}
            required
          >
            <option value="">Selecione o curso</option>
            <option value="Ciência da Computação">Ciência da Computação</option>
            <option value="Engenharia de Software">Engenharia de Software</option>
            <option value="Sistemas de Informação">Sistemas de Informação</option>
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
      height: '100vh',  // Mudei de minHeight para height
      width: '100vw',   // Adicionei largura de 100% da viewport
      background: 'linear-gradient(150deg, #cfd9df 0%, #e2ebf0 100%)',
      margin: 0,
      padding: 0,
      overflow: 'hidden', // Impede qualquer scrollbar indesejada
      position: 'fixed',  // Garante que ocupe toda a tela fixamente
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
      margin: 0,  // Removi a margem de 20px
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
  },
  select: {
    padding: '12px 15px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#fff',
    outline: 'none',
    cursor: 'pointer',
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
  }
};

export default CadastroAluno;