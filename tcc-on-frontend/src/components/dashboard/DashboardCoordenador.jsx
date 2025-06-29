import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardCoordenador.css';

function DashboardCoordenador() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "Carregando...",
    role: "Coordenador do TCC",
    departamento: "Sistemas de Informação",
    notifications: 0
  });

  const [bancasAgendadas, setBancasAgendadas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUserData({
        name: storedUser.nomeCompleto || storedUser.username,
        role: "Coordenador do TCC",
        departamento: storedUser.departamento || "Sistemas de Informação",
        notifications: storedUser.notifications || 0
      });
    }

    const fetchBancasAgendadas = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/coordenador/bancas-agendadas', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setBancasAgendadas(data.bancas);
        } else {
          console.error("Falha ao buscar bancas agendadas");
        }
      } catch (error) {
        console.error("Erro ao buscar bancas agendadas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBancasAgendadas();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleAprovarBanca = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/banca/${id}/aprovar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const updatedBancas = bancasAgendadas.map(banca => {
          if (banca._id === id) {
            return { ...banca, status: 'aprovada' };
          }
          return banca;
        });
        setBancasAgendadas(updatedBancas);
        alert('Banca aprovada com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro ao aprovar banca:', error);
      alert('Erro ao conectar com o servidor');
    }
  };

  const handleReprovarBanca = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/banca/${id}/reprovar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const updatedBancas = bancasAgendadas.map(banca => {
          if (banca._id === id) {
            return { ...banca, status: 'reprovada' };
          }
          return banca;
        });
        setBancasAgendadas(updatedBancas);
        alert('Banca reprovada com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro ao reprovar banca:', error);
      alert('Erro ao conectar com o servidor');
    }
  };

  return (
    <div className="coordenador-container">
      <header className="coordenador-header">
        <div className="logo-container">
          <h1>TCC ON</h1>
          <p>Painel do Coordenador</p>
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

      <nav className="coordenador-nav">
        <ul>
          <li><a href="/coordenador" className="active">Início</a></li>
          <li><a href="/coordenador/orientadores">Orientadores</a></li>
          <li><a href="/coordenador/alunos">Alunos</a></li>
          <li>
            <a href="/coordenador/mensagens">
              Mensagens
              {userData.notifications > 0 && (
                <span className="nav-notification">{userData.notifications}</span>
              )}
            </a>
          </li>
        </ul>
      </nav>

      <main className="coordenador-main">
        <div className="coordenador-dashboard">
          <section className="dashboard-section">
            <h2>Bancas Agendadas para Aprovação</h2>
            
            <div className="stats-container">
              <div className="stat-card">
                <h3>Aguardando</h3>
                <p className="stat-number">
                  {loading ? '...' : bancasAgendadas.filter(b => b.status === 'agendada').length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Aprovadas</h3>
                <p className="stat-number">
                  {loading ? '...' : bancasAgendadas.filter(b => b.status === 'aprovada').length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Reprovadas</h3>
                <p className="stat-number">
                  {loading ? '...' : bancasAgendadas.filter(b => b.status === 'reprovada').length}
                </p>
              </div>
            </div>

            {loading ? (
              <p>Carregando bancas agendadas...</p>
            ) : bancasAgendadas.length === 0 ? (
              <p>Não há bancas agendadas no momento.</p>
            ) : (
              <div className="banca-list-container">
                <div className="banca-list">
                  {bancasAgendadas.map(banca => (
                    <div key={banca._id} className="banca-item">
                      <div className="banca-info">
                        <h3>{banca.titulo}</h3>
                        <div className="banca-details">
                          <p><strong>Aluno:</strong> {banca.alunoId.nomeCompleto}</p>
                          <p><strong>Orientador:</strong> {banca.orientadorId.nomeCompleto}</p>
                          <p><strong>Data:</strong> {new Date(banca.data_apresentacao).toLocaleString()}</p>
                          <p><strong>Local:</strong> {banca.local_apresentacao}</p>
                          <p><strong>Status:</strong> <span className={`status-${banca.status}`}>{banca.status}</span></p>
                          
                          <div className="banca-membros">
                            <h4>Composição da Banca:</h4>
                            <ul>
                              {banca.banca.map((membro, index) => (
                                <li key={index}>
                                  <strong>{membro.papel}:</strong> {membro.professorId.nomeCompleto}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="banca-actions">
                        <a 
                          href={`http://localhost:5000${banca.arquivo_url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="dashboard-button primary"
                        >
                          Ver TCC
                        </a>
                        {banca.status === 'agendada' && (
                          <>
                            <button 
                              className="dashboard-button success"
                              onClick={() => handleAprovarBanca(banca._id)}
                            >
                              Aprovar Banca
                            </button>
                            <button 
                              className="dashboard-button danger"
                              onClick={() => handleReprovarBanca(banca._id)}
                            >
                              Reprovar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="coordenador-footer">
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

export default DashboardCoordenador;