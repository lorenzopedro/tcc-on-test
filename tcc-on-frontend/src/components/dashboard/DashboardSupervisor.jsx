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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const [bancas, setBancas] = useState([
    {
      id: 1,
      titulo: "Sistema de Gestão Acadêmica",
      aluno: "João Silva",
      orientador: "Prof. Eder Santana",
      data: "20/05/2025",
      horario: "14:00",
      local: "Sala 301 Bloco G",
      participantes: [
        { id: 1, nome: "Prof. Rafael Marinho", papel: "Avaliador" },
        { id: 2, nome: "Prof. Juliana Lilis", papel: "Avaliador" }
      ]
    },
    {
      id: 2,
      titulo: "Aplicativo para Controle Financeiro",
      aluno: "Maria Santos",
      orientador: "Prof. Rafael Marinho",
      data: "22/05/2025",
      horario: "10:30",
      local: "Sala 304 Bloco H",
      participantes: [
        { id: 1, nome: "Prof. Henaldo Barros", papel: "Avaliador" },
        { id: 2, nome: "Prof. Eder Santana", papel: "Avaliador" }
      ]
    },
    {
      id: 3,
      titulo: "IA para Diagnóstico Médico",
      aluno: "Enzo Fernandes",
      orientador: "Prof. Juliana Lilis",
      data: "25/05/2025",
      horario: "16:00",
      local: "Sala 402 Bloco N",
      participantes: [
        { id: 1, nome: "Prof. Carlos Mendes", papel: "Presidente" }
      ]
    }
  ]);

  const professoresDisponiveis = [
    { id: 1, nome: "Prof. Rafael Marinho" },
    { id: 2, nome: "Prof. Juliana Lilis" },
    { id: 3, nome: "Prof. Henaldo Barros" },
    { id: 4, nome: "Prof. Eder Santana" },
    { id: 5, nome: "Prof. Carlos Mendes" },
    { id: 6, nome: "Prof. Ana Paula Costa" }
  ];

  const papeis = [
    { id: 1, nome: "Avaliador Interno" },
    { id: 2, nome: "Avaliador Externo" }
  ];

  const handleRemoverParticipante = (bancaId, participanteId) => {
    const updatedBancas = bancas.map(banca => {
      if (banca.id === bancaId) {
        return {
          ...banca,
          participantes: banca.participantes.filter(p => p.id !== participanteId)
        };
      }
      return banca;
    });
    setBancas(updatedBancas);
    alert(`Participante removido da banca ${bancaId}`);
  };

  const handleAdicionarParticipante = (bancaId, professorId, papelId) => {
    const professor = professoresDisponiveis.find(p => p.id === professorId);
    const papel = papeis.find(p => p.id === papelId);
    
    if (!professor || !papel) return;

    const updatedBancas = bancas.map(banca => {
      if (banca.id === bancaId) {
        if (banca.participantes.some(p => p.id === professor.id)) {
          alert("Este professor já está na banca!");
          return banca;
        }
        
        return {
          ...banca,
          participantes: [
            ...banca.participantes, 
            {
              ...professor,
              papel: papel.nome
            }
          ]
        };
      }
      return banca;
    });
    setBancas(updatedBancas);
    alert(`Professor ${professor.nome} adicionado como ${papel.nome} à banca ${bancaId}`);
  };

  return (
    <div className="supervisor-container">
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
          <li>
            <a href="/supervisor/mensagens">
              Mensagens
              {userData.notifications > 0 && (
                <span className="nav-notification">{userData.notifications}</span>
              )}
            </a>
          </li>
        </ul>
      </nav>

      <main className="supervisor-main">
        <div className="supervisor-dashboard">
          <section className="dashboard-section">
            <h2>Gerenciamento de Bancas de TCC</h2>
            
            <div className="stats-container">
              <div className="stat-card">
                <h3>Bancas Agendadas</h3>
                <p className="stat-number">{bancas.length}</p>
              </div>
              <div className="stat-card">
                <h3>Total de Participantes</h3>
                <p className="stat-number">
                  {bancas.reduce((total, banca) => total + banca.participantes.length, 0)}
                </p>
              </div>
              <div className="stat-card">
                <h3>Professores</h3>
                <p className="stat-number">{professoresDisponiveis.length}</p>
              </div>
            </div>

            <div className="bancas-list-container">
              <div className="bancas-list">
                {bancas.map(banca => (
                  <div key={banca.id} className="banca-item">
                    <div className="banca-header">
                      <h3>{banca.titulo}</h3>
                      <div className="banca-meta">
                        <span><strong>Aluno:</strong> {banca.aluno}</span>
                        <span><strong>Orientador:</strong> {banca.orientador}</span>
                        <span><strong>Data:</strong> {banca.data} às {banca.horario}</span>
                        <span><strong>Local:</strong> {banca.local}</span>
                      </div>
                    </div>
                    
                    <div className="composicao-banca">
                      <h4>Composição da Banca:</h4>
                      <ul className="membros-banca">
                        <li className="membro-item orientador">
                          <span>{banca.orientador}</span>
                          <span className="papel">Orientador</span>
                        </li>
                        {banca.participantes.map(participante => (
                          <li key={participante.id} className="membro-item">
                            <span>{participante.nome}</span>
                            <span className="papel">{participante.papel}</span>
                            <button 
                              className="remove-button"
                              onClick={() => handleRemoverParticipante(banca.id, participante.id)}
                            >
                              Remover
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                      
                    <div className="adicionar-membro">
                      <h4>Adicionar Membro à Banca:</h4>
                      <div className="add-participante-form">
                        <select className="professor-select">
                          <option value="">Selecione um professor...</option>
                          {professoresDisponiveis.map(professor => (
                            <option key={professor.id} value={professor.id}>
                              {professor.nome}
                            </option>
                          ))}
                        </select>
                        
                        <select className="papel-select">
                          <option value="">Selecione o papel...</option>
                          {papeis.map(papel => (
                            <option key={papel.id} value={papel.id}>
                              {papel.nome}
                            </option>
                          ))}
                        </select>
                        
                        <button 
                          className="dashboard-button primary"
                          onClick={() => {
                            const professorSelect = document.querySelector(`.banca-item:nth-child(${banca.id}) .professor-select`);
                            const papelSelect = document.querySelector(`.banca-item:nth-child(${banca.id}) .papel-select`);
                            
                            if (professorSelect.value && papelSelect.value) {
                              handleAdicionarParticipante(
                                banca.id, 
                                parseInt(professorSelect.value),
                                parseInt(papelSelect.value)
                              );
                              professorSelect.value = "";
                              papelSelect.value = "";
                            } else {
                              alert("Selecione um professor e um papel");
                            }
                          }}
                        >
                          Adicionar à Banca
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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