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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentTccId, setCurrentTccId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [correctionFile, setCorrectionFile] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState('');

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

  const handleOpenFeedbackModal = (id) => {
    setCurrentTccId(id);
    setShowFeedbackModal(true);
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackText('');
    setCorrectionFile(null);
    setFeedbackStatus('');
  };

  const handleFileChange = (e) => {
    setCorrectionFile(e.target.files[0]);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText) {
      setFeedbackStatus('Por favor, escreva o feedback.');
      return;
    }

    const formData = new FormData();
    formData.append('feedback', feedbackText);
    if (correctionFile) {
      formData.append('correctionFile', correctionFile);
    }

    try {
      setFeedbackStatus('Enviando...');
      const response = await fetch(`http://localhost:5000/tcc/${currentTccId}/feedback`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setFeedbackStatus('Feedback enviado com sucesso!');
        const updatedTccs = tccs.map(tcc => {
          if (tcc._id === currentTccId) {
            return { ...tcc, status: 'andamento' };
          }
          return tcc;
        });
        setTccs(updatedTccs);
        setTimeout(() => {
          handleCloseFeedbackModal();
        }, 1500);
      } else {
        const errorData = await response.json();
        setFeedbackStatus(`Erro: ${errorData.message}`);
      }
    } catch (error) {
      setFeedbackStatus('Erro ao conectar com o servidor');
    }
  };

  return (
    <div className="orientador-container">
      {/* Novo Modal de Feedback - Design Moderno */}
      {showFeedbackModal && (
        <div className="feedback-modal-container">
          <div className="feedback-modal-overlay" onClick={handleCloseFeedbackModal}></div>
          
          <div className="feedback-modal-card">
            <div className="feedback-modal-header">
              <h2>Enviar Feedback</h2>
              <button className="feedback-modal-close" onClick={handleCloseFeedbackModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="feedback-modal-body">
              <div className="feedback-form-group">
                <label>Comentários:</label>
                <div className="feedback-textarea-container">
                  <textarea
                    placeholder="Digite seu feedback aqui..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="feedback-textarea"
                    maxLength="500"
                  />
                  <div className="textarea-counter">{feedbackText.length}/500</div>
                </div>
              </div>
              
              <div className="feedback-form-group">
                <label>Anexar PDF corrigido (opcional):</label>
                <div className="file-upload-container">
                  <input 
                    type="file" 
                    id="correction-file"
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="file-input"
                  />
                  <label htmlFor="correction-file" className="file-input-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span className="file-text">
                      {correctionFile ? correctionFile.name : "Selecionar arquivo"}
                    </span>
                  </label>
                </div>
              </div>
              
              {feedbackStatus && (
                <div className={`feedback-status ${feedbackStatus.includes('sucesso') ? 'success' : 'error'}`}>
                  {feedbackStatus}
                </div>
              )}
            </div>
            
            <div className="feedback-modal-footer">
              <button onClick={handleCloseFeedbackModal} className="feedback-modal-button cancel">
                Cancelar
              </button>
              <button onClick={handleSubmitFeedback} className="feedback-modal-button submit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13"></path>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Enviar Feedback
              </button>
            </div>
          </div>
        </div>
      )}

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
                          onClick={() => handleOpenFeedbackModal(tcc._id)}
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