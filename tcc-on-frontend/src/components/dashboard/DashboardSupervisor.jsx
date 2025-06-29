import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardSupervisor.css';

function DashboardSupervisor() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "Carregando...",
    role: "Supervisor de Bancas",
    departamento: "",
    notifications: 0
  });

  const [tccsAprovados, setTccsAprovados] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [showAgendarModal, setShowAgendarModal] = useState(false);
  const [currentTcc, setCurrentTcc] = useState(null);
  const [dataApresentacao, setDataApresentacao] = useState('');
  const [local, setLocal] = useState('');
  const [banca, setBanca] = useState([{ professorId: '', papel: 'Avaliador' }]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUserData({
        name: storedUser.nomeCompleto || storedUser.username,
        role: "Supervisor de Bancas",
        departamento: storedUser.departamento || "Sistemas de Informação",
        notifications: storedUser.notifications || 0
      });
    }
  }, []);

  useEffect(() => {
    const fetchTccsAprovados = async () => {
      try {
        const response = await fetch('http://localhost:5000/supervisor/tccs-aprovados', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTccsAprovados(data.tccs);
        } else {
          console.error("Falha ao buscar TCCs aprovados");
        }
      } catch (error) {
        console.error("Erro ao buscar TCCs aprovados:", error);
      }
    };

    const fetchProfessores = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/professores', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfessores(data.professores);
        } else {
          console.error("Falha ao buscar professores");
        }
      } catch (error) {
        console.error("Erro ao buscar professores:", error);
      }
    };

    fetchTccsAprovados();
    fetchProfessores();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleOpenAgendarModal = (tcc) => {
    setCurrentTcc(tcc);
    const orientador = {
      professorId: tcc.orientadorId._id,
      papel: 'Orientador'
    };
    setBanca([orientador, { professorId: '', papel: 'Avaliador' }]);
    setShowAgendarModal(true);
  };

  const handleCloseAgendarModal = () => {
    setShowAgendarModal(false);
    setDataApresentacao('');
    setLocal('');
    setBanca([{ professorId: '', papel: 'Avaliador' }]);
    setStatus('');
  };

  const handleAddMembroBanca = () => {
    setBanca([...banca, { professorId: '', papel: 'Avaliador' }]);
  };

  const handleRemoveMembroBanca = (index) => {
    if (index === 0) return;
    const newBanca = [...banca];
    newBanca.splice(index, 1);
    setBanca(newBanca);
  };

  const handleBancaChange = (index, field, value) => {
    const newBanca = [...banca];
    newBanca[index][field] = value;
    setBanca(newBanca);
  };

  const handleAgendarApresentacao = async () => {
    if (!dataApresentacao || !local || banca.some((membro, index) => index > 0 && (!membro.professorId || !membro.papel))) {
      setStatus('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setStatus('Agendando...');
      const response = await fetch(`http://localhost:5000/tcc/${currentTcc._id}/agendar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          data_apresentacao: dataApresentacao,
          local_apresentacao: local,
          banca: banca
        })
      });

      if (response.ok) {
        setStatus('Apresentação agendada com sucesso!');
        setTimeout(() => {
          handleCloseAgendarModal();
          const fetchTccs = async () => {
            const res = await fetch('http://localhost:5000/supervisor/tccs-aprovados', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            if (res.ok) {
              const data = await res.json();
              setTccsAprovados(data.tccs);
            }
          };
          fetchTccs();
        }, 1500);
      } else {
        const errorData = await response.json();
        setStatus(`Erro: ${errorData.message}`);
      }
    } catch (error) {
      setStatus('Erro ao conectar com o servidor');
    }
  };

  return (
    <div className="supervisor-container">
      {showAgendarModal && (
        <div className="agendar-modal-container">
          <div className="agendar-modal-overlay" onClick={handleCloseAgendarModal}></div>
          
          <div className="agendar-modal-card">
            <div className="agendar-modal-header">
              <h2>Agendar Apresentação</h2>
              <button className="agendar-modal-close" onClick={handleCloseAgendarModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="agendar-modal-body">
              <div className="agendar-form-group">
                <label>Título do TCC</label>
                <input 
                  type="text" 
                  value={currentTcc?.titulo || ''} 
                  disabled 
                  className="agendar-form-input"
                />
              </div>
              
              <div className="agendar-form-group">
                <label>Aluno</label>
                <input 
                  type="text" 
                  value={currentTcc?.alunoId?.nomeCompleto || ''} 
                  disabled 
                  className="agendar-form-input"
                />
              </div>
              
              <div className="agendar-form-group">
                <label>Data da Apresentação*</label>
                <input 
                  type="datetime-local" 
                  value={dataApresentacao} 
                  onChange={(e) => setDataApresentacao(e.target.value)} 
                  className="agendar-form-input"
                />
              </div>
              
              <div className="agendar-form-group">
                <label>Local*</label>
                <input 
                  type="text" 
                  placeholder="Sala, bloco, etc." 
                  value={local} 
                  onChange={(e) => setLocal(e.target.value)} 
                  className="agendar-form-input"
                />
              </div>
              
              <div className="agendar-form-group">
                <label>Composição da Banca*</label>
                {banca.map((membro, index) => (
                  <div key={index} className="banca-member">
                    <select
                      value={membro.professorId}
                      onChange={(e) => handleBancaChange(index, 'professorId', e.target.value)}
                      className="agendar-form-select"
                      disabled={index === 0}
                    >
                      <option value="">Selecione um professor</option>
                      {professores.map(prof => (
                        <option key={prof._id} value={prof._id}>
                          {prof.nomeCompleto}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={membro.papel}
                      onChange={(e) => handleBancaChange(index, 'papel', e.target.value)}
                      className="agendar-form-select"
                      disabled={index === 0}
                    >
                      <option value="Avaliador">Avaliador</option>
                      <option value="Presidente">Presidente</option>
                      <option value="Membro">Membro</option>
                      {index === 0 && <option value="Orientador">Orientador</option>}
                    </select>
                    
                    {index > 0 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveMembroBanca(index)}
                        className="remove-button"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={handleAddMembroBanca}
                  className="add-button"
                >
                  Adicionar Membro
                </button>
              </div>
              
              {status && (
                <div className={`agendar-status ${status.includes('sucesso') ? 'success' : 'error'}`}>
                  {status}
                </div>
              )}
            </div>
            
            <div className="agendar-modal-footer">
              <button onClick={handleCloseAgendarModal} className="agendar-modal-button cancel">
                Cancelar
              </button>
              <button onClick={handleAgendarApresentacao} className="agendar-modal-button submit">
                Agendar
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="supervisor-header">
        <div className="logo-container">
          <h1>TCC ON</h1>
          <p>Painel do Supervisor</p>
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

      <nav className="supervisor-nav">
        <ul>
          <li><a href="/supervisor" className="active">Início</a></li>
        </ul>
      </nav>

      <main className="supervisor-main">
        <div className="supervisor-dashboard">
          <section className="dashboard-section">
            <h2>TCCs Aprovados para Bancas</h2>
            
            {tccsAprovados.length === 0 ? (
              <p>Não há TCCs aprovados no momento.</p>
            ) : (
              <div className="tcc-list-container">
                <div className="tcc-list">
                  {tccsAprovados.map(tcc => (
                    <div key={tcc._id} className="tcc-item">
                      <div className="tcc-info">
                        <h3>{tcc.titulo}</h3>
                        <div className="tcc-details">
                          <p><strong>Aluno:</strong> {tcc.alunoId.nomeCompleto}</p>
                          <p><strong>Matrícula:</strong> {tcc.alunoId.matricula}</p>
                          <p><strong>Orientador:</strong> {tcc.orientadorId.nomeCompleto}</p>
                          <p><strong>Data de Envio:</strong> {new Date(tcc.data_envio).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="tcc-actions">
                        <a 
                          href={`http://localhost:5000${tcc.arquivo_url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="dashboard-button primary"
                        >
                          Ver TCC
                        </a>
                        <button 
                          className="dashboard-button success"
                          onClick={() => handleOpenAgendarModal(tcc)}
                        >
                          Agendar Banca
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

      <footer className="supervisor-footer">
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

export default DashboardSupervisor;