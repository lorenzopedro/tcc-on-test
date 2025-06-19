import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardOrientador.css';

function DashboardOrientador() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "Carregando...",
    role: "Orientador",
    departamento: "",
    notifications: 0
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUserData({
        name: storedUser.nomeCompleto || storedUser.username,
        role: "Orientador",
        departamento: storedUser.departamento || "Sistemas de Informação",
        notifications: storedUser.notifications || 0
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const tccsParaOrientar = [
    {
      id: 1,
      aluno: "João Silva",
      matricula: "20230001",
      titulo: "Sistema de Gestão Acadêmica",
      status: "Aguardando correções",
      ultimaSubmissao: "10/05/2025",
      prazo: "13/05/2025",
      etapa: "Capítulo 3"
    },
    {
      id: 2,
      aluno: "Maria Santos",
      matricula: "20230025",
      titulo: "Aplicativo para Controle Financeiro",
      status: "Em andamento",
      ultimaSubmissao: "11/05/2025",
      prazo: "14/05/2025",
      etapa: "Metodologia"
    },
    {
      id: 3,
      aluno: "Carlos Pereira",
      matricula: "20230042",
      titulo: "Análise de Dados Educacionais",
      status: "Primeira versão",
      ultimaSubmissao: "15/10/2023",
      prazo: "01/11/2023",
      etapa: "Resultados"
    },
    {
      id: 4,
      aluno: "Ana Carolina",
      matricula: "20230018",
      titulo: "Machine Learning para Diagnóstico Médico",
      status: "Revisão final",
      ultimaSubmissao: "05/05/2025",
      prazo: "10/05/2025",
      etapa: "Conclusão"
    }
  ];

  const handleAvaliarTCC = (id) => {
    alert(`Abrindo avaliação do TCC ${id}`);
  };

  const handleEnviarFeedback = (id) => {
    alert(`Enviando feedback para o TCC ${id}`);
  };

  return (
    <div className="orientador-container">
      <header className="orientador-header">
        <div className="logo-container">
          <h1>TCC ON</h1>
          <p>Painel do Orientador</p>
        </div>
        <div className="user-info">
          <div className="user-details">
            <span className="user-name">Bem-vindo, {userData.name}</span>
            <span className="user-role">{userData.role} - {userData.departamento}</span>
          </div>
          <div className="notification-badge">
            <span>{userData.notifications}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">Sair</button>
        </div>
      </header>

      <nav className="orientador-nav">
        <ul>
          <li><a href="/orientador" className="active">Início</a></li>
          <li><a href="/orientador/tccs">Meus Orientandos</a></li>
          <li>
            <a href="/orientador/mensagens">
              Mensagens
              {userData.notifications > 0 && (
                <span className="nav-notification">{userData.notifications}</span>
              )}
            </a>
          </li>
        </ul>
      </nav>

      <main className="orientador-main">
        <div className="orientador-dashboard">
          <section className="dashboard-section">
            <h2>TCCs Para Orientação</h2>
            
            <div className="stats-container">
              <div className="stat-card">
                <h3>Aguardando</h3>
                <p className="stat-number">8</p>
              </div>
              <div className="stat-card">
                <h3>Em Andamento</h3>
                <p className="stat-number">3</p>
              </div>
              <div className="stat-card">
                <h3>Concluídos</h3>
                <p className="stat-number">2</p>
              </div>
            </div>

            <div className="tcc-list-container">
              <div className="tcc-list">
                {tccsParaOrientar.map(tcc => (
                  <div key={tcc.id} className="tcc-item">
                    <div className="tcc-info">
                      <h3>{tcc.titulo}</h3>
                      <div className="tcc-details">
                        <p><strong>Aluno:</strong> {tcc.aluno} ({tcc.matricula})</p>
                        <p><strong>Etapa:</strong> {tcc.etapa}</p>
                        <p><strong>Status:</strong> <span className={`status-${tcc.status.replace(/\s+/g, '-').toLowerCase()}`}>{tcc.status}</span></p>
                        <p><strong>Última submissão:</strong> {tcc.ultimaSubmissao}</p>
                        {tcc.prazo && <p><strong>Prazo:</strong> {tcc.prazo}</p>}
                      </div>
                    </div>
                    <div className="tcc-actions">
                      <button 
                        className="dashboard-button primary"
                        onClick={() => handleAvaliarTCC(tcc.id)}
                      >
                        Avaliar
                      </button>
                      <button 
                        className="dashboard-button secondary"
                        onClick={() => handleEnviarFeedback(tcc.id)}
                      >
                        Enviar Feedback
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="orientador-footer">
        <p>Sistema de TCC - Unipam © {new Date().getFullYear()}</p>
        <div className="footer-links">
          <a href="/sobre">Sobre o Sistema</a>
          <a href="/ajuda">Ajuda</a>
          <a href="/contato">Contato</a>
        </div>
      </footer>
    </div>
  );
}

export default DashboardOrientador;