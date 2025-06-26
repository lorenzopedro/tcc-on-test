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

  const [tccs, setTccs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchTccs = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/orientador/tccs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTccs(data.tccs);
        } else {
          console.error("Falha ao buscar TCCs");
        }
      } catch (error) {
        console.error("Erro ao buscar TCCs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTccs();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleAvaliarTCC = (id) => {
    navigate(`/orientador/avaliar/${id}`);
  };

  const handleEnviarFeedback = (id) => {
    navigate(`/orientador/feedback/${id}`);
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
                <p className="stat-number">{tccs.filter(tcc => tcc.status === 'pendente').length}</p>
              </div>
              <div className="stat-card">
                <h3>Em Andamento</h3>
                <p className="stat-number">{tccs.filter(tcc => tcc.status === 'andamento').length}</p>
              </div>
              <div className="stat-card">
                <h3>Concluídos</h3>
                <p className="stat-number">{tccs.filter(tcc => tcc.status === 'concluido').length}</p>
              </div>
            </div>

            {loading ? (
              <p>Carregando TCCs...</p>
            ) : tccs.length === 0 ? (
              <p>Não há TCCs para orientação no momento.</p>
            ) : (
              <div className="tcc-list-container">
                <div className="tcc-list">
                  {tccs.map(tcc => (
                    <div key={tcc._id} className="tcc-item">
                      <div className="tcc-info">
                        <h3>{tcc.titulo}</h3>
                        <div className="tcc-details">
                          <p><strong>Aluno:</strong> {tcc.aluno_nome}</p>
                          <p><strong>Matrícula:</strong> {tcc.matricula}</p>
                          <p><strong>Status:</strong> <span className={`status-${tcc.status}`}>{tcc.status}</span></p>
                          <p><strong>Última submissão:</strong> {new Date(tcc.data_envio).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="tcc-actions">
                        <a 
                          href={`http://localhost:5000${tcc.arquivo_url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="dashboard-button primary"
                        >
                          Ver PDF
                        </a>
                        <button 
                          className="dashboard-button primary"
                          onClick={() => handleAvaliarTCC(tcc._id)}
                        >
                          Avaliar
                        </button>
                        <button 
                          className="dashboard-button secondary"
                          onClick={() => handleEnviarFeedback(tcc._id)}
                        >
                          Enviar Feedback
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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