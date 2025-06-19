import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CadastroSupervisor = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    empresa: '',
    cargo: '',
    telefone: '',
    usuario: '',
    senha: '',
    confirmarSenha: ''
  });

  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    if (erro) setErro('');
  };

  // tcc-on-frontend/src/components/cadastro/cadastroSupervisor.jsx

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
      const response = await fetch('http://localhost:5000/cadastro/supervisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Ajustes aqui
          nomeCompleto: formData.nome,
          email: formData.email,
          username: formData.usuario,
          cpf: formData.cpf,
          empresa: formData.empresa,
          cargoEmpresa: formData.cargo, // Mapeamento correto
          telefone: formData.telefone,
          senha: formData.senha,
          confirmacaoSenha: formData.confirmarSenha
        })
      });

      if (response.ok) {
        alert('Supervisor cadastrado com sucesso! Você será redirecionado para o login.');
        navigate('/login');
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
        <h2 style={styles.title}>Cadastro de Supervisor</h2>
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
            placeholder="E-mail profissional"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            type="text"
            name="cpf"
            placeholder="CPF (apenas números)"
            value={formData.cpf}
            onChange={handleChange}
            pattern="\d{11}"
            required
          />

          <input
            style={styles.input}
            type="text"
            name="empresa"
            placeholder="Empresa/Instituição"
            value={formData.empresa}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            type="text"
            name="cargo"
            placeholder="Cargo na empresa"
            value={formData.cargo}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            type="tel"
            name="telefone"
            placeholder="Telefone para contato"
            value={formData.telefone}
            onChange={handleChange}
            required
          />

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

export default CadastroSupervisor;